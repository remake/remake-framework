const parseUrl = require("parseurl");
const jsonfile = require("jsonfile");
import {
  getDirForPageTemplate,
  getDirForRootApp,
  getDirForLayoutTemplate,
} from "./directory-helpers";
import { capture, readFileAsync, readdirAsync, statAsync } from "./async-utils";
import { forInLoopRegex } from "./common";
import { getHandlebarsContext } from "./handlebars-context";
import { processData } from "./process-data";
import { addRemakeAppStatusToPage } from "./add-remake-app-status";
import { getPartialsAsInlinePartials } from "./get-partials";
import { getGlobalData } from "./get-global-data";
import { getHtmlWithUniqueIds } from "./get-html-with-unique-ids";
import RemakeStore from "../lib/remake-store";

export async function getRootAppsPageHtml() {
  let [dirsWithFileTypes] = await capture(
    readdirAsync(getDirForRootApp(), { withFileTypes: true })
  );

  if (dirsWithFileTypes) {
    let dirs = dirsWithFileTypes.filter(dirent => dirent.isDirectory()).map(dirent => dirent.name);
    let html = `<h1>Apps</h1><ul>${dirs
      .map(dir => `<li><a href="/app_${dir}">${dir}</a></li>`)
      .join("")}</ul>`;
    return html;
  } else {
    return `<h1>No apps found</h1>`;
  }
}

// returns a template that can accept data
//   must be inside a layout, for...in helpers replaced, and compiled by handlebars
export async function getPageTemplate({ pageName, appName }) {
  let pageTemplateDir = getDirForPageTemplate({ pageName, appName });
  let [pageTemplateString] = await capture(readFileAsync(pageTemplateDir, "utf8"));

  if (pageTemplateString) {
    let pageTemplateStringProcessed = await processTemplateString({ appName, pageTemplateString });

    const Handlebars = getHandlebarsContext({ appName });
    return Handlebars.compile(pageTemplateStringProcessed);
  }
}

export async function getDataForPage({ req, res, appName, pageAuthor, itemId, pageName }) {
  let params = req.params;
  let query = req.query;
  let pathname = parseUrl(req).pathname;
  let currentUser = req.user;
  let cacheBustString = req.cacheBustString;
  let data = (pageAuthor && pageAuthor.appData) || {};
  let [globalData] = await capture(getGlobalData({ appName }));
  let isPageAuthor =
    currentUser && pageAuthor && currentUser.details.username === pageAuthor.details.username;
  let flashErrors = req.flash("error");
  let flashSuccesses = req.flash("success");

  let currentItem = {};
  let parentItem = {};

  if (RemakeStore.isMultiTenant() || RemakeStore.isGeneratingUniqueIdsEnabled()) {
    let [itemData, itemDataError] = await capture(
      processData({ res, appName, pageAuthor, data, itemId })
    );
    currentItem = itemData.currentItem;
    parentItem = itemData.parentItem;
  }

  let isPreviewing = query && query.preview;

  let allData = {
    ...data,
    globalData,
    appName,
    params,
    query,
    cacheBustString,
    pageName,
    pathname,
    currentItem,
    parentItem,
    flashErrors,
    flashSuccesses,
    currentUser,
    pageAuthor,
    isPageAuthor: isPreviewing ? false : isPageAuthor,
    isPreviewing,
    pageHasAppData: !!pageAuthor,
  };

  return allData;
}

export function getPageHtml({ pageTemplate, data, appName, username, itemId, isPreviewing }) {
  let html = pageTemplate(data);
  let currentUser = data.currentUser;
  let htmlWithAppStatus = addRemakeAppStatusToPage({
    html,
    data,
    currentUser,
    username,
    itemId,
    isPreviewing,
  });

  // this unique ID replacement function should be deprecated soon
  let htmlWithUniqueIds = getHtmlWithUniqueIds({ htmlString: htmlWithAppStatus });

  // insert live reload script
  if (RemakeStore.isAutoReloadEnabled()) {
    let liveReloadScript = "<script type='text/javascript' src='/remake/js/live.js'></script>";
    htmlWithUniqueIds = htmlWithUniqueIds.replace("</body>", liveReloadScript + "</body>");
  }
  
  return htmlWithUniqueIds;
}

export async function doesPageExist({ appName, pageName }) {
  let pageTemplateFileDir = getDirForPageTemplate({ appName, pageName });

  try {
    return await statAsync(pageTemplateFileDir);
  } catch (e) {
    return false;
  }
}

/**********
 * UTILS
 **********/

// process template

let layoutNameRegex = /\{\{\s*layout\s+["'](\w+)["']\s*\}\}/;
let yieldCommandRegex = /\{\{>\s+yield\s+\}\}/;

async function processTemplateString({ appName, pageTemplateString }) {
  // 1. get the layout name from the template string
  //    looks like: {{ layout "layoutName" }}
  let layoutNameMatch = pageTemplateString.match(layoutNameRegex);
  let layoutName = layoutNameMatch ? layoutNameMatch[1] : "default";

  // 2. get layout template string
  let layoutTemplateDir = getDirForLayoutTemplate({ appName, layoutName });
  let [layoutTemplateString] = await capture(readFileAsync(layoutTemplateDir, "utf8"));

  // 3. remove the custom "layout" command from the page template.
  //    looks like: {{ layout "layoutName" }}
  let templateStringWithoutLayout = pageTemplateString.replace(layoutNameRegex, "");

  // 4. replace any "for...in" loops with real #for helper syntax
  let templateStringWithoutForInLoop = templateStringWithoutLayout.replace(
    forInLoopRegex,
    '{{#for $2 itemName="$1"'
  );

  // 5. insert the page template into its layout
  //    yield command looks like: {{> yield }}
  let templateStringWithLayout = layoutTemplateString.replace(
    yieldCommandRegex,
    templateStringWithoutForInLoop
  );

  // 6. insert inline partials into template
  let [inlinePartialsString] = await capture(getPartialsAsInlinePartials({ appName }));
  let finalTemplateString = inlinePartialsString + templateStringWithLayout;

  return finalTemplateString;
}
