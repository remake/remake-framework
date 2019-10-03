import { capture } from "./async-utils";
import { getDirForPageTemplate, getDirForRootApp, getDirForLayoutTemplate } from "./directory-helpers";
import { readFileAsync, readdirAsync } from "./async-utils";
import { getHandlebarsContext } from "./handlebars-context";
import { processData } from "./process-data";
import { addRemakeAppStatusToPage } from "./add-remake-app-status";
const parseUrl = require('parseurl');

export async function getRootAppsPageHtml () {
  let [dirsWithFileTypes] = await capture(readdirAsync(getDirForRootApp(), { withFileTypes: true }));

  if (dirsWithFileTypes) {
    let dirs = dirsWithFileTypes.filter(dirent => dirent.isDirectory()).map(dirent => dirent.name);
    let html = `<h1>Apps</h1><ul>${dirs.map(dir => `<li><a href="/${dir}">${dir}</a></li>`).join("")}</ul>`;
    return html;
  } else {
    return `<h1>No apps found</h1>`;
  }
}

// returns a template that can accept data
//   must be inside a layout, for...in helpers replaced, and compiled by handlebars
export async function getPageTemplate ({pageName, appName}) {
  let pageTemplateDir = getDirForPageTemplate({pageName, appName});
  let [pageTemplateString] = await capture(readFileAsync(pageTemplateDir, 'utf8'));

  if (pageTemplateString) {
    let pageTemplateStringProcessed = await processTemplateString({appName, pageTemplateString});

    const Handlebars = getHandlebarsContext({appName});
    return Handlebars.compile(pageTemplateStringProcessed);
  }
}

export async function getDataForPage ({req, res, pageAuthor, appName}) {
  let params = req.params;
  let usernameFromParams = params.username;
  let query = req.query;
  let pathname = parseUrl(req).pathname;
  let currentUser = req.pageAuthor;
  let data = pageAuthor && pageAuthor.appData;
  let isPageAuthor = currentUser && pageAuthor && currentUser.details.username === pageAuthor.details.username;
  let flashErrors = req.flash("error");
  let [itemData] = await capture(processData({res, pageAuthor, data, params}));
  let [currentItem, parentItem] = itemData;

  return {
    data,
    params,
    query,
    pathname,
    currentItem,
    parentItem,
    flashErrors,
    currentUser,
    pageAuthor,
    isPageAuthor,
    pageHasAppData: !!pageAuthor
  }

}

export function getPageHtml ({pageTemplate, data, appName}) {
  let html = template(data);
  let htmlWithAppStatus = addRemakeAppStatusToPage({html, currentUser, params});
  return htmlWithAppStatus;
}


// UTILS

let layoutNameRegex = /\{\{\s+layout\s+["'](\w+)["']\s+\}\}/;
let yieldCommandRegex = /\{\{>\s+yield\s+\}\}/;
let forInLoopRegex = /\{\{#for\s+(\S+)\s+in\s+([^\}\s]+)/g;

async function processTemplateString ({appName, pageTemplateString}) {
  // 1. get the layout name from the template string
  //    looks like: {{ layout "layoutName" }}
  let layoutNameMatch = pageTemplateString.match(layoutNameRegex);
  let layoutName = layoutNameMatch ? layoutNameMatch[1] : "default";

  // 2. get layout template string
  let layoutTemplateDir = getDirForLayoutTemplate({appName, layoutName});
  let [layoutTemplateString] = await capture(readFileAsync(layoutTemplateDir, 'utf8'));

  // 3. remove the custom "layout" command from the page template. 
  //    looks like: {{ layout "layoutName" }}
  let templateStringWithoutLayout = pageTemplateString.replace(layoutNameRegex, "");

  // 4. replace any "for...in" loops with real #for helper syntax
  let templateStringWithoutForInLoop = templateStringWithoutLayout.replace(forInLoopRegex, '{{#for $2 itemName="$1"');

  // 5. insert the page template into its layout
  //    yield command looks like: {{> yield }}
  let finalTemplateString = layoutTemplateString.replace(yieldCommandRegex, templateStringWithoutForInLoop);

  return finalTemplateString;
}




