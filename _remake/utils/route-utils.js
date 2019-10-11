const path = require('upath');
import parseUrl from "parseurl";
import { capture } from "./async-utils";

function isBaseRoute ({username, itemId}) {
  return !itemId && !username;
}
function isUsernameRoute ({username, itemId}) {
  return !!username;
}
function isItemRoute ({username, itemId}) {
  return !!itemId;
}

// If a route's url is missing its app name, this gets the app name from
// the referrer url and adds it into the current route's url
async function addAppNameToInvalidPath ({req}) {
  if (req.session.appName) {
    let currentUrlPath = parseUrl(req).pathname;
    let redirectPath = path.join("app_" + req.session.appName, currentUrlPath);
    return redirectPath;
  }
}

export default {
  isBaseRoute,
  isUsernameRoute,
  isItemRoute,
  addAppNameToInvalidPath
}