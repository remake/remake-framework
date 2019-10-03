import RemakeStore from "../lib/remake-store";
const isMultiTenant = RemakeStore.isMultiTenant();

export function getDirForUserFile ({type, appName, username}) {
  let innerAppPath = isMultiTenant ? appName + "/" : "";
  let innerTypePath = type === "details" ? "user-details/" : "user-app-data/";
  let pathString = `../../_remake-data/${innerAppPath}${innerTypePath}${username}.json`;
  return path.join(__dirname, pathString);
}

export function getDirForPageTemplate ({pageName, appName}) {
  let innerAppPath = isMultiTenant ? appName + "/" : "";
  let pathString = `../../app/${innerAppPath}pages/${pageName}.hbs`;
  return path.join(__dirname, pathString);
}

export function getDirForLayoutTemplate ({appName, layoutName}) {
  let innerAppPath = isMultiTenant ? appName + "/" : "";
  let pathString = `../../app/${innerAppPath}layouts/${layoutName}.hbs`;
  return path.join(__dirname, pathString);
}

export function getDirForRootApp ({appName, layoutName}) {
  let pathString = `../../app`;
  return path.join(__dirname, pathString);
}





