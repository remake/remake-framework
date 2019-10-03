const path = require('upath');
import { capture, readdirAsync } from "../utils/async-utils";
import { 
  getPageTemplate, 
  getDataForPage, 
  getPageHtml, 
  getRootAppsPageHtml 
} from "../utils/page-utils";
import { getUserData } from "./user-data";
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

async function renderPage ({req, res, appName, pageName, username, itemId}) {
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
  let [data] = await capture(getDataForPage({req, res, appName, pageAuthor, itemId}));

  if (itemId && !data.currentItem) {
    res.status(404).send("404 Not Found");
    return;
  }

  let html = getPageHtml({pageTemplate, data, appName, username, itemId});
  res.send(html);
}

export async function initRenderedRoutes ({ app }) {

  // assumptions:
  // - if there's no firstParam, there can't be any other param either
  app.get("/:firstParam?/:secondParam?/:thirdParam?/:fourthParam?", async function (req, res) {

    // don't cache html from these routes
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

    let {firstParam, secondParam, thirdParam, fourthParam} = req.params;

    let appName;
    if (RemakeStore.isMultiTenant()) {

      if (!firstParam) {
        let html = await getRootAppsPageHtml();
        res.send(html);
        return;
      }

      [appName, firstParam, secondParam, thirdParam] = [firstParam, secondParam, thirdParam, fourthParam];

    }

    if (!firstParam) { // route: /

      await renderPage({req, res, appName, pageName: "index"});
      return;

    }

    if (firstParam && secondParam && thirdParam) { // route: /username/pageName/id

      await renderPage({req, res, appName, username: firstParam, pageName: secondParam, itemId: thirdParam});
      return;

    }

    if (firstParam && secondParam) { // route: /username/pageName/

      await renderPage({req, res, appName, username: firstParam, pageName: secondParam});
      return;

    }

    if (firstParam) { // route: /pageName OR /username

      let pageExists = doesPageExist({pageName: firstParam});

      if (pageExists) {
       
        await renderPage({req, res, appName, pageName: firstParam});
        return;
      
      } else {

        await renderPage({req, res, appName, pageName: "index", username: firstParam});
        return;

      }

    }

  });

}