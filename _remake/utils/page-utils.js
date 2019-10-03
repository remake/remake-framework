import { getDirForPageTemplate } from "../directory-helpers";
import { readFileAsync } from "./async-utils";
import { getHandlebarsContext } from "./handlebars-context";

// returns a template that can accept data
//   must be inside a layout, for...in helpers replaced, and compiled by handlebars
export async function getPageTemplate ({pageName, appName}) {
  let pageTemplateDir = getDirForPageTemplate({pageName, appName});
  let [pageTemplateString] = await capture(readFileAsync(pageTemplateDir));

  if (pageTemplateString) {
    pageTemplateStringProcessed = await processTemplateString({appName, pageTemplateString});

    const Handlebars = getHandlebarsContext({appName});
    return Handlebars.compile(pageTemplateStringProcessed);
  }
}

export function getDataForPage () {
  console.log("getDataForPage");
  let [currentItem, parentItem] = addIdsAndGetItemData({user, itemId, appName})
}

export function getPageHtml () {
  console.log("getPageHtml");
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
  let [layoutTemplateString] = await capture(readFileAsync(layoutTemplateDir));

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




