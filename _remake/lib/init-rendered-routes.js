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
import { getParamsFromPathname } from "../utils/get-params-from-pathname";
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

async function renderPage ({req, res, appName, pageName, username, itemId, invalidAppName}) {
  if (invalidAppName) {
    let redirectPath = addAppNameToInvalidRequestPath({req});
    res.redirect(redirectPath);
    return;
  }

  let pageTemplate = await getPageTemplate({pageName, appName});

  if (!pageTemplate) {
    res.status(404).send("404 Not Found");
    return;
  }

  let pageAuthor, userDataError;
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

    let [params, paramsError] = await capture(getParamsFromPathname(parseUrl(req).pathname));
    if (paramsError) {
      console.log(paramsError);
    }

    if (params.multiTenantBaseRoute) {
      let html = await getRootAppsPageHtml();
      res.send(html);
      return;
    }

    await renderPage({req, res, ...params});

  });

}