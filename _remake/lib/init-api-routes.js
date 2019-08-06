const path = require('path');
const jsonfile = require("jsonfile")
import { nunjucks } from "./nunjucks-lib";
const deepExtend = require("deep-extend");
import { get, set, isPlainObject } from 'lodash-es';
import forEachDeep from "deepdash-es/forEachDeep";
import { getItemWithId } from "./get-item-with-id";
const passport = require('passport');
import { getCollection } from "./db-connection";
import { getAppsInfo } from "./get-apps-info";
import { remakeOptions } from "./remake-options";
import { specialDeepExtend } from "./special-deep-extend";
import getUniqueId from "./get-unique-id";


export function initApiRoutes ({app}) {

  app.post('/save', async (req, res) => {

    if (!req.isAuthenticated()) {
      res.json({success: false});
      return;
    }

    // get incoming data
    let incomingData = req.body.data;
    let savePath = req.body.path;
    let saveToId = req.body.saveToId;
    let appName = req.body.appName || "default";

    // get existing data
    let user = req.user;
    let existingData = JSON.parse(user.appData[appName] || {});

    // option 1: save path
    if (savePath) {
      let dataAtPath = get(existingData, savePath); 

      if (isPlainObject(dataAtPath)) {
        if (remakeOptions.autoGenerateUniqueIds) {
          // deep extend, using ids to match objects in arrays
          specialDeepExtend(dataAtPath, incomingData);
          set(existingData, savePath, incomingData);
        } else {
          // default to extending the data if possible, so no data is lost
          deepExtend(dataAtPath, incomingData);
        }
      } else if (Array.isArray(dataAtPath) && remakeOptions.autoGenerateUniqueIds) {
        specialDeepExtend(dataAtPath, incomingData);
        set(existingData, savePath, incomingData);
      } else {
        // if we're not auto generating ids OR
        // if dataAtPath is NOT an object or array
        // replace the data the the path
        set(existingData, savePath, incomingData);
      }
    // option 2: save to id
    } else if (saveToId) {
      let itemData = getItemWithId(existingData, saveToId);

      if (remakeOptions.autoGenerateUniqueIds) {
        specialDeepExtend(itemData, incomingData);
        Object.assign(itemData, incomingData);
      } else {
        deepExtend(itemData, incomingData);
      }
    // option 3: extend existing data at root level
    } else {
      if (remakeOptions.autoGenerateUniqueIds) {
        specialDeepExtend(existingData, incomingData);
        existingData = incomingData;
      } else {
        if (Array.isArray(existingData)) {
          // overwrite data if it's an array (extending arrays doesn't work)
          existingData = incomingData;
        } else {
          // extend the data if possible, so no data is lost
          deepExtend(existingData, incomingData);
        }
      }
    }

    let usersCollection = await getCollection("users");
    let updateCommand = {$set: {}};
    updateCommand["$set"]["appData." + appName] = JSON.stringify(existingData);

    let updateResult = await usersCollection.updateOne(
      { "_id" : user._id },
      updateCommand
    );

    if (user && remakeOptions.writeAppDataToTempFiles) {
      let formattedUsername = user.username.replace(/\W/g, "");
      jsonfile.writeFile(path.join(__dirname, `../tempData/${formattedUsername}-${appName}.json`), existingData, { spaces: 2 }, function () {});
    }

    res.json({success: true});

  })

  app.post('/new', async (req, res) => {
    let user = req.user;
    let templateName = req.body.templateName;
    let appName = req.body.appName;

    let matchingPartial = getAppsInfo().partials.find(partial => partial.name === templateName && partial.appName === appName);

    if (remakeOptions.autoGenerateUniqueIds) {
      forEachDeep(matchingPartial.startingData, function (value, key, parentValue, context) {
        if (isPlainObject(value) && !value.id) {
          value.id = getUniqueId();
        }
      });
    }

    let htmlString = nunjucks.renderString(matchingPartial.templateString, {
      ...matchingPartial.startingData,
      user: user
    });

    res.json({ htmlString: htmlString });
  })

}





