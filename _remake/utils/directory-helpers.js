const path = require('upath');
import RemakeStore from "../lib/remake-store";

export function getAllDirsForUserData ({appName}) {
  if (RemakeStore.isMultiTenant()) {
    let innerAppPath = appName + "/";
    let userAppDataPathString = `../../data/${innerAppPath}/data/database/user-details/`;
    let userDetailsPathString = `../../data/${innerAppPath}/data/database/user-app-data/`;

    return [
      path.join(__dirname, userAppDataPathString),
      path.join(__dirname, userDetailsPathString)
    ];
  } else {
    let userAppDataPathString = `../../app/data/database/user-details/`;
    let userDetailsPathString = `../../app/data/database/user-app-data/`;
    return [
      path.join(__dirname, userAppDataPathString),
      path.join(__dirname, userDetailsPathString)
    ];
  }
}

export function getDirForUserFile ({type, appName, username}) {
  let innerTypePath = type === "details" ? "user-details" : "user-app-data";
  if (RemakeStore.isMultiTenant()) {
    let innerAppPath = appName + "/";
    let path = `../../data/${innerAppPath}/data/database/${innerTypePath}/${username}`;
    return path.join(__dirname, path);
  } else {
    let path = `../../app/data/database/${innerTypePath}/${username}`;
    return path.join(__dirname, path);
  }
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
  let pathString = `../../app/${innerAppPath}data/global.json`;
  return path.join(__dirname, pathString);
}

export function getDirForUpload ({appName, username}) {
  let innerAppPath = RemakeStore.isMultiTenant() ? `app_${appName}` + "/" : "";
  let pathString = `../../app/${innerAppPath}data/uploads/${username}`;
  return path.join(__dirname, pathString);
}







