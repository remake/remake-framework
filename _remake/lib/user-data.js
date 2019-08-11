const jsonfile = require("jsonfile");
const path = require('path');
import { showConsoleError } from "../utils/console-utils";

// create new user data files
// returns: {user, data}
async function createUserData ({ username, hash }) {
  let startingPrivateData = { username, hash };

  let startingPublicData;
  try {
    startingPublicData = await jsonfile.readFile(path.join(__dirname, "../../project-files/_bootstrap-data/user.json"));
  } catch (e) {
    startingPublicData = {};
  }

  let privateDataPromise = jsonfile.writeFile(path.join(__dirname, "../../_remake-data/", `_${username}.json`), startingPrivateData);
  let publicDataPromise = jsonfile.writeFile(path.join(__dirname, "../../_remake-data/", `${username}.json`), startingPublicData);

  await Promise.all([privateDataPromise, publicDataPromise]);

  return {user: startingPrivateData, data: startingPublicData};
}

// get all user data
// returns: {user, data}
async function getUserData ({ username }) {
  try {
    let privateDataPromise = jsonfile.readFile(path.join(__dirname, "../../", "_remake-data/", `_${username}.json`)); 
    let publicDataPromise = jsonfile.readFile(path.join(__dirname, "../../", "_remake-data/", `${username}.json`));
    let [ user, data ] = await Promise.all([privateDataPromise, publicDataPromise]);
    return { user, data }; 
  } catch (e) {
    return null;
  }
}

// set EITHER private OR public data by username
// returns: {username, type, data}
async function setUserData ({ username, data, type }) {
  let privateDataPromise;
  let publicDataPromise;

  try {
    if (type === "private") {
      privateDataPromise = jsonfile.writeFile(path.join(__dirname, "../../", "_remake-data/", `_${username}.json`), data);
    }
  } catch (e) {
    showConsoleError("Error: Setting user data");
  }

  try {
    if (type === "public") {
      publicDataPromise = jsonfile.writeFile(path.join(__dirname, "../../", "_remake-data/", `${username}.json`), data);
    }
  } catch (e) {
    showConsoleError("Error: Setting user data");
  }

  await Promise.all([privateDataPromise, publicDataPromise]);

  return {username, type, data};
}

export {
  createUserData,
  getUserData,
  setUserData
}