const pathMatch = require("path-match")({});
import parseUrl from "parseurl";
import RemakeStore from "../lib/remake-store";
import { capture } from "./async-utils";
import { doesPageExist } from "./page-utils";

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

  Remake has two url formats
  • Single tenant: domain/firstParam/secondParam/thirdParam
  • Multi tenant: subdomain.domain/firstParam/secondParam/thirdParam
*/

let pageNamesForUserRoutes = ["login", "signup", "reset", "forgot"];
export async function getParams({ req }) {
  let { firstParam, secondParam, thirdParam } = req.urlData.pageParamsGeneric;
  let username, pageName, itemId;

  // special case: /user/* routes like /user/login and /user/signup
  if (firstParam === "user") {
    return { pageName: secondParam };
  }

  if (pageNamesForUserRoutes.includes(firstParam)) {
    return { pageName: firstParam, redirectToUserRoute: true };
  }

  if (!firstParam) {
    // route: /
    pageName = "index";
  } else if (!secondParam) {
    let [pageExists] = await capture(
      doesPageExist({
        appName: req.appName,
        pageName: firstParam,
      })
    );

    if (pageExists) {
      // route: /pageName
      pageName = firstParam;
    } else {
      // route: /username
      username = firstParam;
      pageName = "app-index";
    }
  } else {
    // route: /username/pageName/
    // and
    // route: /username/pageName/id
    [username, pageName, itemId] = [firstParam, secondParam, thirdParam];
  }

  return { username, pageName, itemId };
}
