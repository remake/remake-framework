const jsonfile = require("jsonfile");
const path = require("upath");
import { showConsoleError } from "../utils/console-utils";
import { capture, mkdirpAsync } from "../utils/async-utils";
import { getBootstrapData } from "../utils/get-bootstrap-data";
import { getDirForUserData } from "../utils/directory-helpers";

// create new user data files
// returns: {details, appData}
export async function createUserData({ appName, username, hash, email }) {
  let [userAppDataBootstrap] = await capture(getBootstrapData({ fileName: "bootstrap", appName }));
  let [userDetailsBootstrap] = await capture(
    getBootstrapData({ fileName: "user-starting-details", appName })
  );

  let appData = userAppDataBootstrap;
  let details = userDetailsBootstrap;

  // extend user details with args
  Object.assign(details, { appName, username, hash, email });

  // make sure all the user data directories exist before writing to them
  await makeSureUserDataDirectoriesExist({ appName });

  let [appDataFileDir, detailsFileDir] = getDirForUserData({ appName, withFile: true, username });
  let appDataWritePromise = jsonfile.writeFile(appDataFileDir, appData, { spaces: 2 });
  let detailsWritePromise = jsonfile.writeFile(detailsFileDir, details, { spaces: 2 });

  // let higher-level functions capture this if it errors
  await Promise.all([detailsWritePromise, appDataWritePromise]);

  return { details, appData };
}

// get all user data
// - `type` field optional
// returns: {details, appData}
export async function getUserData({ username, type, appName }) {
  let [appDataFileDir, detailsFileDir] = getDirForUserData({ appName, withFile: true, username });

  let [appData] = await capture(jsonfile.readFile(appDataFileDir));
  if (!appData) {
    return null;
  }

  let [details] = await capture(jsonfile.readFile(detailsFileDir));
  if (!details) {
    return null;
  }

  return {
    appData: appData,
    details: details,
  };
}

// set EITHER details data OR appData data by username
// returns: {username, type, data}
export async function setUserData({ appName, username, data, type }) {
  let detailsWritePromise;
  let appDataWritePromise;
  let [appDataFileDir, detailsFileDir] = getDirForUserData({ appName, withFile: true, username });

  try {
    if (type === "appData") {
      appDataWritePromise = jsonfile.writeFile(appDataFileDir, data, { spaces: 2 });
    }
  } catch (e) {
    showConsoleError("Error: Can't set user appData");
  }

  try {
    if (type === "details") {
      detailsWritePromise = jsonfile.writeFile(detailsFileDir, data, { spaces: 2 });
    }
  } catch (e) {
    showConsoleError("Error: Can't set user details");
  }

  // let higher-level functions capture this if it errors
  await Promise.all([detailsWritePromise, appDataWritePromise]);

  return { username, type, data };
}

// UTILS

async function makeSureUserDataDirectoriesExist({ appName }) {
  let ret = [];
  let dirs = getDirForUserData({ appName });

  let promisesArray = dirs.map(function (dir) {
    return mkdirpAsync(dir);
  });

  for (var i = 0; i < promisesArray.length; i++) {
    ret.push(await promisesArray[i]);
  }

  return ret;
}
