const path = require('upath');
import RemakeStore from "../lib/remake-store";

export function getAllDirsForUserData ({appName}) {
  if (RemakeStore.isMultiTenant()) {

    let innerAppPath = RemakeStore.isMultiTenant() ? appName + "/" : "";
    let userAppDataPathString = `../../_remake-data/${innerAppPath}/user-details/`;
    let userDetailsPathString = `../../_remake-data/${innerAppPath}/user-app-data/`;

    return [
      path.join(__dirname, userAppDataPathString),
      path.join(__dirname, userDetailsPathString)
    ];

  } else {

    let userAppDataPathString = `../../_remake-data/user-details/`;
    let userDetailsPathString = `../../_remake-data/user-app-data/`;
    return [
      path.join(__dirname, userAppDataPathString),
      path.join(__dirname, userDetailsPathString)
    ];

  }

}

export function getDirForUserFile ({type, appName, username}) {
  let innerAppPath = RemakeStore.isMultiTenant() ? appName + "/" : "";
  let innerTypePath = type === "details" ? "user-details/" : "user-app-data/";
  let pathString = `../../_remake-data/${innerAppPath}${innerTypePath}${username}.json`;
  return path.join(__dirname, pathString);
}

let pageNamesForUserRoutes = ["login", "signup", "reset", "forgot"];
export function getDirForPageTemplate ({pageName, appName}) {
  let innerAppPath = RemakeStore.isMultiTenant() ? appName + "/" : "";
  let innerPagePath = pageNamesForUserRoutes.includes(pageName) ? "user/" : "";
  let pathString = `../../app/${innerAppPath}pages/${innerPagePath}${pageName}.hbs`;
  return path.join(__dirname, pathString);
}

export function getDirForLayoutTemplate ({appName, layoutName}) {
  let innerAppPath = RemakeStore.isMultiTenant() ? appName + "/" : "";
  let pathString = `../../app/${innerAppPath}layouts/${layoutName}.hbs`;
  return path.join(__dirname, pathString);
}

export function getDirForAllPartials ({appName}) {
  let innerAppPath = RemakeStore.isMultiTenant() ? appName + "/" : "";
  let pathString = `../../app/${innerAppPath}partials`;
  return path.join(__dirname, pathString);
}

export function getDirForPartialTemplate ({appName, partialName}) {
  let innerAppPath = RemakeStore.isMultiTenant() ? appName + "/" : "";
  let pathString = `../../app/${innerAppPath}partials/${partialName}.hbs`;
  return path.join(__dirname, pathString);
}

export function getDirForRootApp () {
  let pathString = `../../app`;
  return path.join(__dirname, pathString);
}

export function getDirForBootstrapDataFile ({fileName, appName}) {
  let innerAppPath = RemakeStore.isMultiTenant() ? appName + "/" : "";
  let pathString = `../../app/${innerAppPath}data/${fileName}.json`;
  return path.join(__dirname, pathString);
}

export function getDirForGlobalData ({fileName, appName}) {
  let innerAppPath = RemakeStore.isMultiTenant() ? appName + "/" : "";
  let pathString = `../../app/${innerAppPath}data/global-app-data.json`;
  return path.join(__dirname, pathString);
}

export function getDirForUpload ({appName, username}) {
  let innerAppPath = RemakeStore.isMultiTenant() ? `app_${appName}` + "/" : "";
  let pathString = `../../_remake-uploads/${innerAppPath}${username}`;
  return path.join(__dirname, pathString);
}







