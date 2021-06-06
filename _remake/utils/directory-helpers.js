const path = require("upath");
import RemakeStore from "../lib/remake-store";

export function getDirForUserData({ appName, withFile, username }) {
  if (withFile && !username) {
    console.log(
      "Error: getDirForUserData() requires a 'username' if you pass in the 'withFile' argument"
    );
    return;
  }

  let innerAppPath = RemakeStore.isMultiTenant() ? appName + "/" : "";
  let commonPath = `../../app/${innerAppPath}data/database`;
  let filePath = withFile ? username + ".json" : "";
  return [
    path.join(__dirname, `${commonPath}/user-app-data/${filePath}`),
    path.join(__dirname, `${commonPath}/user-details/${filePath}`),
  ];
}

export function getDirForBootstrapDataFile({ fileName, appName }) {
  let innerAppPath = RemakeStore.isMultiTenant() ? appName + "/" : "";
  let pathString = `../../app/${innerAppPath}data/${fileName}.json`;
  return path.join(__dirname, pathString);
}

export function getDirForGlobalData({ appName }) {
  let innerAppPath = RemakeStore.isMultiTenant() ? appName + "/" : "";
  let pathString = `../../app/${innerAppPath}data/global.json`;
  return path.join(__dirname, pathString);
}

export function getDirForRemakeAppData({ appName }) {
  let innerAppPath = RemakeStore.isMultiTenant() ? appName + "/" : "";
  let pathString = `../../app/${innerAppPath}data/_remake-app-data.json`;
  return path.join(__dirname, pathString);
}

export function getDirForUpload({ appName, username }) {
  let innerAppPath = RemakeStore.isMultiTenant() ? appName + "/" : "";
  let pathString = `../../app/${innerAppPath}data/uploads/${username}`;
  return path.join(__dirname, pathString);
}

let pageNamesForUserRoutes = ["login", "signup", "reset", "forgot"];
export function getDirForPageTemplate({ pageName, appName }) {
  let innerAppPath = RemakeStore.isMultiTenant() ? appName + "/" : "";
  let innerPagePath = pageNamesForUserRoutes.includes(pageName) ? "user/" : "";
  let pathString = `../../app/${innerAppPath}pages/${innerPagePath}${pageName}.hbs`;
  return path.join(__dirname, pathString);
}

export function getDirForLayoutTemplate({ appName, layoutName }) {
  let innerAppPath = RemakeStore.isMultiTenant() ? appName + "/" : "";
  let pathString = `../../app/${innerAppPath}layouts/${layoutName}.hbs`;
  return path.join(__dirname, pathString);
}

export function getDirForAllPartials({ appName }) {
  let innerAppPath = RemakeStore.isMultiTenant() ? appName + "/" : "";
  let pathString = `../../app/${innerAppPath}partials`;
  return path.join(__dirname, pathString);
}

export function getDirForPartialTemplate({ appName, partialName }) {
  let innerAppPath = RemakeStore.isMultiTenant() ? appName + "/" : "";
  let pathString = `../../app/${innerAppPath}partials/${partialName}.hbs`;
  return path.join(__dirname, pathString);
}

export function getDirForRootApp() {
  let pathString = `../../app`;
  return path.join(__dirname, pathString);
}
