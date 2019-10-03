import { getPageTemplate, getDataForPage, getPageHtml } from "../utils/page-utils";
import { getUserData } from "./user-data";
import { addIdsAndGetItemData } from "./add-ids-and-get-item-data";

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

async function renderPage ({res, appName, pageName, username, itemId}) {
  let pageTemplate = await getPageTemplate({pageName, appName})

  if (!pageTemplate) {
    res.status(404).send("404 Not Found");
    return;
  }

  let user = username && getUserData({username, appName})

  if (username && !user) {
    res.status(404).send("404 Not Found");
    return;
  }

  // GET DATA
  let data = getDataForPage({req, user, appName});

  if (itemId && !data.currentItem) {
    res.status(404).send("404 Not Found");
    return;
  }

  let html = getPageHtml({pageTemplate, data, appName});
  res.send(html);
}

app.get("/:firstParam/:secondParam/:thirdParam/:fourthParam")
  // assumptions:
  // - if there's no firstParam, there can't be any other param either

  let {firstParam, secondParam, thirdParam, fourthParam} = req.params;

  let appName;
  if (multiTenant) {
    [appName, firstParam, secondParam, thirdParam] = [firstParam, secondParam, thirdParam, fourthParam]
  }

  if (!firstParam) // route: /

    await renderPage({res, appName, pageName: "index"});
    return;

  if (firstParam && secondParam && thirdParam) // route: /username/pageName/id

    await renderPage({res, appName, username: firstParam, pageName: secondParam, itemId: thirdParam});
    return;

  if (firstParam && secondParam) // route: /username/pageName/

    await renderPage({res, appName, username: firstParam, pageName: secondParam});
    return;

  if (firstParam) // route: /pageName OR /username

    let pageExists = doesPageExist({pageName: firstParam});

    if (pageExists)
      await renderPage({res, appName, pageName: firstParam});
      return;
    else
      await renderPage({res, appName, pageName: "index", username: firstParam});
      return;

