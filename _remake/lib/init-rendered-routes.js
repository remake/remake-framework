const path = require('upath');
import { capture, readdirAsync } from "../utils/async-utils";
import { 
  getPageTemplate, 
  getDataForPage, 
  getPageHtml, 
  getRootAppsPageHtml 
} from "../utils/page-utils";
import { getUserData } from "./user-data";
import parseUrl from "parseurl";
import { getParams } from "../utils/get-params";
import routeUtils from "../utils/route-utils";
import RemakeStore from "./remake-store";

/*
  Remake has 3 types of routes
  • BaseRoute
  • UsernameRoute
  • ItemRoute

  Combined, these routes can render these patterns:
  • /
  • /pageName
  • /username
  • /username/pageName/
  • /username/pageName/id
*/

async function renderPage ({req, res, appName, pageName, username, itemId, invalidAppName, multiTenantBaseRoute}) {
  if (multiTenantBaseRoute) {
    let html = await getRootAppsPageHtml();
    res.send(html);
    return;
  }

  if (invalidAppName) {
    let [redirectPath] = await capture(routeUtils.addAppNameToInvalidPath({req}));
    if (redirectPath) {
      res.redirect(redirectPath);
      return;
    } else {
      res.status(404).send("404 Not Found");
      return;
    }
  }

  let [pageTemplate, pageTemplateError] = await capture(getPageTemplate({pageName, appName}));

  if (!pageTemplate) {
    res.status(404).send("404 Not Found");
    return;
  }

  let pageAuthor;
  if (username) {
    [pageAuthor] = await capture(getUserData({username, appName}));

    // if username is in the route, there should be a corresponding user
    if (!pageAuthor) {
      res.status(404).send("404 Not Found");
      return;
    }
  }

  // GET DATA
  let [data, dataError] = await capture(getDataForPage({req, res, appName, pageAuthor, itemId}));

  if (dataError) {
    res.status(500).send("500 Server Error");
    return;
  }

  if (itemId && !data.currentItem) {
    res.status(404).send("404 Not Found");
    return;
  }

  let html = getPageHtml({pageTemplate, data, appName, username, itemId});
  res.send(html);
}

export async function initRenderedRoutes ({ app }) {

  app.get("/:firstParam?/:secondParam?/:thirdParam?/:fourthParam?", async function (req, res) {

    // don't cache html from these routes
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

    let [params, paramsError] = await capture(getParams({req}));

    await renderPage({req, res, ...params});

  });

}