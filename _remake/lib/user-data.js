const jsonfile = require("jsonfile");
const path = require('upath');
import { showConsoleError } from "../utils/console-utils";
import { capture, mkdirpAsync } from "../utils/async-utils";
import { getBootstrapData } from "../utils/get-bootstrap-data";
import { getDirForUserFile, getAllDirsForUserData } from "../utils/directory-helpers";

// create new user data files
// returns: {details, appData}
export async function createUserData ({ appName, username, hash, email }) {

  let [userAppDataBootstrap] = await capture(getBootstrapData({fileName: "user-starting-data", appName}));
  let [userDetailsBootstrap] = await capture(getBootstrapData({fileName: "user-starting-details", appName}));

  let appData = userAppDataBootstrap;
  let details = userDetailsBootstrap;

  // extend user details with args
  Object.assign(details, { appName, username, hash, email });

  // make sure all the user data directories exist before writing to them
  await makeSureUserDataDirectoriesExist({appName});

  let detailsWritePromise = jsonfile.writeFile(getDirForUserFile({type: "details", appName, username}), details, { spaces: 2 });
  let appDataWritePromise = jsonfile.writeFile(getDirForUserFile({type: "appData", appName, username}), appData, { spaces: 2 });

  // let higher-level functions capture this if it errors
  await Promise.all([detailsWritePromise, appDataWritePromise]);

  return {details, appData};
}

// get all user data
// - `type` field optional
// returns: {details, appData}
export async function getUserData ({ username, type, appName }) {
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
export async function setUserData ({ appName, username, data, type }) {
  let detailsWritePromise;
  let appDataWritePromise;

  try {
    if (type === "details") {
      let dirForUserFile = getDirForUserFile({appName, type: "details", username});
      detailsWritePromise = jsonfile.writeFile(dirForUserFile, data, { spaces: 2 });
    }
  } catch (e) {
    showConsoleError("Error: Setting user details");
  }

  try {
    if (type === "appData") {
      let dirForUserFile = getDirForUserFile({appName, type: "appData", username});
      appDataWritePromise = jsonfile.writeFile(dirForUserFile, data, { spaces: 2 });
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

