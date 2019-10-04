const pathMatch = require('path-match')({});
import RemakeStore from "../lib/remake-store";

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

export function getParamsFromPathname (pathname) {
  let routeMatcher = route("/:firstParam?/:secondParam?/:thirdParam?/:fourthParam?");
  let params = routeMatcher(pathname) || [];

  let {firstParam, secondParam, thirdParam, fourthParam} = params;

  let appName;
  if (!RemakeStore.isMultiTenant()) {
    [username, pageName, itemId] = [firstParam, secondParam, thirdParam];
  } else {
    [appName, username, pageName, itemId] = [firstParam, secondParam, thirdParam, fourthParam];

    if (!appName) {
      return {multiTenantBaseRoute: true};
    }
  }

  // route: /
  if (!username) {
    pageName = "index";
  }

  if (username && !pageName) {
    if (doesPageExist({pageName: username})) {
      // route: /pageName 
      // if there's no second param, the first param MIGHT be a page name
      pageName = username;
    } else {
      // route: /username
      pageName = "index";
    }
  }

  return {appName, username, pageName, itemId};
}