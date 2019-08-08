const jsonfile = require("jsonfile");
const path = require('path');

async function createUserData ({username}) {
  let startingPrivateData = {};
  let startingPublicData = {};

  let privateDataPromise = jsonfile.writeFile(path.join(__dirname, "../../", "_remake-data/", `_${username}.json`), startingPrivateData);
  let publicDataPromise = jsonfile.writeFile(path.join(__dirname, "../../", "_remake-data/", `${username}.json`), startingPublicData);

  await Promise.all([privateDataPromise, publicDataPromise]);

  return {privateData: startingPrivateData, publicData: startingPublicData};
}

async function getUserData ({username}) {
  try {
    let privateDataPromise = jsonfile.readFile(path.join(__dirname, "../../", "_remake-data/", `_${username}.json`));
    let publicDataPromise = jsonfile.readFile(path.join(__dirname, "../../", "_remake-data/", `${username}.json`));

    let [ privateData, publicData ] = await Promise.all([privateDataPromise, publicDataPromise]);
    return { privateData, publicData };
  } catch (e) {
    return null;
  }
}

async function setUserData ({username, data, type}) {
  let privateDataPromise;
  let publicDataPromise;

  try {
    if (type === "private") {
      privateDataPromise = jsonfile.writeFile(path.join(__dirname, "../../", "_remake-data/", `_${username}.json`), data);
    }
  } catch (e) {
    console.log("Error: Setting user data");
  }

  try {
    if (type === "public") {
      publicDataPromise = jsonfile.writeFile(path.join(__dirname, "../../", "_remake-data/", `${username}.json`), data);
    }
  } catch (e) {
    console.log("Error: Setting user data");
  }

  await Promise.all([privateDataPromise, publicDataPromise]);

  return {type, data};
}

export {
  createUserData,
  getUserData,
  setUserData
}