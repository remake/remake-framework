const jsonfile = require("jsonfile");
const path = require('path');
import { showConsoleError } from "../utils/console-utils";

// create new user data files
async function createUserData ({username}) {
  let startingPrivateData = {};
  let startingPublicData = {};

  let privateDataPromise = jsonfile.writeFile(path.join(__dirname, "../../", "_remake-data/", `_${username}.json`), startingPrivateData);
  let publicDataPromise = jsonfile.writeFile(path.join(__dirname, "../../", "_remake-data/", `${username}.json`), startingPublicData);

  await Promise.all([privateDataPromise, publicDataPromise]);

  return {user: startingPrivateData, data: startingPublicData};
}

// get private data, public data, or both by username 
async function getUserData ({username, type}) {

  try {
    
    let privateDataPromise; 
    if (!type || type === "private") {
      privateDataPromise = jsonfile.readFile(path.join(__dirname, "../../", "_remake-data/", `_${username}.json`));
    }

    let publicDataPromise 
    if (!type || type === "public") {
      publicDataPromise = jsonfile.readFile(path.join(__dirname, "../../", "_remake-data/", `${username}.json`));
    }

    if (type) {
      if (type === "private") {
        return await privateDataPromise;
      } else if (type === "public") {
        return await publicDataPromise;
      }
    } else {
      let [ user, data ] = await Promise.all([privateDataPromise, publicDataPromise]);
      return { user, data };
    }
    
  } catch (e) {
    return null;
  }

}

// set EITHER private OR public data by username
async function setUserData ({username, data, type}) {
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