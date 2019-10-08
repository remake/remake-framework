const jsonfile = require("jsonfile");
const path = require('upath');
import { showConsoleError } from "../utils/console-utils";
import { capture, mkdirpAsync } from "../utils/async-utils";
import { getBootstrapData } from "./get-project-info";
import { getDirForUserFile, getAllDirsForUserData } from "../utils/directory-helpers";

// create new user data files
// returns: {details, appData}
async function createUserData ({ username, hash, appName }) {

  let userBootstrapData = getBootstrapData({fileName: "_user", appName});
  let details = userBootstrapData.details || {};
  let appData = userBootstrapData.appData || {};

  // extend user details with args
  Object.assign(details, { username, hash, appName });

  // make sure all the user data directories exist before writing to them
  await makeSureUserDataDirectoriesExist({appName});

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
    let appDataPromise = type === "details" ? null : jsonfile.readFile(getDirForUserFile({type: "appData", appName, username}));
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
      detailsWritePromise = jsonfile.writeFile(getDirForUserFile({appName, type: "details", username}), data, { spaces: 2 });
    }
  } catch (e) {
    showConsoleError("Error: Setting user details");
  }

  try {
    if (type === "appData") {
      appDataWritePromise = jsonfile.writeFile(getDirForUserFile({appName, type: "appData", username}), data, { spaces: 2 });
    }
  } catch (e) {
    showConsoleError("Error: Setting user appData");
  }

  // let higher-level functions capture this if it errors
  await Promise.all([detailsWritePromise, appDataWritePromise]);

  return {username, type, data};
}

// UTILS

async function makeSureUserDataDirectoriesExist ({appName}) {
  let ret = [];
  let dirs = getAllDirsForUserData({appName});

  let promisesArray = dirs.map(function (dir) {
    return mkdirpAsync(dir);
  });

  for (var i = 0; i< promisesArray.length; i++) {
    ret.push(await promisesArray[i]);
  }

  return ret;
}

export {
  createUserData,
  getUserData,
  setUserData
}