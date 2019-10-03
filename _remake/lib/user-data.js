const jsonfile = require("jsonfile");
const path = require('upath');
import { showConsoleError } from "../utils/console-utils";
import { capture } from "../utils/async-utils";
import { getBootstrapData } from "./get-project-info";
import { getDirForUserFile } from "../utils/directory-helpers";

// create new user data files
// returns: {details, appData}
async function createUserData ({ username, hash, appName }) {

  let {details, appData} = getBootstrapData().user;

  // extend user details with args
  Object.assign(details, { username, hash });

  let detailsWritePromise = jsonfile.writeFile(getDirForUserFile({type: "details", appName, username}), details, { spaces: 2 });
  let appDataWritePromise = jsonfile.writeFile(getDirForUserFile({type: "appData", appName, username}), appData, { spaces: 2 });

  // let higher-level functions capture this if it errors
  await Promise.all([detailsWritePromise, appDataWritePromise]);

  return {details, appData};
}

// get all user data
// returns: {details, appData}
async function getUserData ({ username, type, appName }) {
  try {
    let detailsPromise = type === "appData" ? null : jsonfile.readFile(getDirForUserFile({type: "details", appName, username})); 
    let appDataPromise = type === "details" ? null : jsonfile.readFile(getDirForUserFile({type: "details", appName, username}));
    let [ details, appData ] = await Promise.all([detailsPromise, appDataPromise]);
    return { details, appData }; 
  } catch (e) {
    return null;
  }
}

// set EITHER details data OR appData data by username
// returns: {username, type, data}
async function setUserData ({ username, data, type, appName }) {
  let detailsWritePromise;
  let appDataWritePromise;

  try {
    if (type === "details") {
      detailsWritePromise = jsonfile.writeFile(getDirForUserFile({type: "details", appName, username}), data, { spaces: 2 });
    }
  } catch (e) {
    showConsoleError("Error: Setting user details");
  }

  try {
    if (type === "appData") {
      appDataWritePromise = jsonfile.writeFile(getDirForUserFile({type: "appData", appName, username}), data, { spaces: 2 });
    }
  } catch (e) {
    showConsoleError("Error: Setting user appData");
  }

  // let higher-level functions capture this if it errors
  await Promise.all([detailsWritePromise, appDataWritePromise]);

  return {username, type, data};
}

export {
  createUserData,
  getUserData,
  setUserData
}