const Handlebars = require('handlebars');
const parseUrl = require('parseurl');
import { get, set, isPlainObject } from 'lodash-es';
import forEachDeep from "deepdash-es/forEachDeep";
import { getItemWithId } from "./get-item-with-id";
import { specialDeepExtend } from "./special-deep-extend";
import getUniqueId from "./get-unique-id";
import { getUserData, setUserData } from "./user-data";
import { getParams } from "../utils/get-params";
import { getPartial } from "../utils/get-partials";
import { capture } from "../utils/async-utils";
import { processData } from "../utils/process-data";
import { showConsoleError } from "../utils/console-utils";
import { getBootstrapData } from "../utils/get-bootstrap-data";
import { getQueryParams } from "../utils/get-query-params";
import RemakeStore from "./remake-store";


export function initApiRoutes ({app}) {

  app.post('/save', async (req, res) => {

    if (!req.isAuthenticated()) {
      res.json({success: false, reason: "notAuthorized"});
      return;
    }

    let [params, paramsError] = await capture(getParams({req, fromReferrer: true}));

    let {appName, username, pageName, itemId} = params;

    // get incoming data
    let incomingData = req.body.data;
    let savePath = req.body.path;
    let saveToId = req.body.saveToId;

    if (!incomingData) {
      res.json({success: false, reason: "noIncomingData"});
      return;
    }

    // get existing data
    let currentUser = req.user;
    let isPageAuthor = currentUser && username && currentUser.details.username === username;
    let existingData = currentUser.appData;

    if (!isPageAuthor) {
      res.json({success: false, reason: "notAuthorized"});
      return;
    }

    // option 1: save path
    if (savePath) {
      let dataAtPath = get(existingData, savePath); 

      if (isPlainObject(dataAtPath)) {
        // deep extend, using ids to match objects in arrays
        specialDeepExtend(dataAtPath, incomingData);
        set(existingData, savePath, incomingData);
      } else if (Array.isArray(dataAtPath)) {
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

      if (!itemData) {
        res.json({success: false, reason: "noItemFound"});
        return;
      }

      specialDeepExtend(itemData, incomingData);
      Object.assign(itemData, incomingData);

    // option 3: extend existing data at root level
    } else {
      specialDeepExtend(existingData, incomingData);
      existingData = incomingData;
    }

    let [setUserDataResponse, setUserDataError] = await capture(setUserData({appName, username, data: existingData, type: "appData"}));

    if (setUserDataError) {
      res.json({success: false, reason: "userData"});
      return;
    }

    res.json({success: true});

  })

  app.post('/new', async (req, res) => {

    if (!req.isAuthenticated()) {
      res.json({success: false, reason: "notAuthorized"});
      return;
    }

    let partialName = req.body.templateName;
    let [params, paramsError] = await capture(getParams({req, fromReferrer: true}));
    let {appName, username, pageName, itemId} = params;
    
    // default to using inline named partials as opposed to partial files
    let partialRenderFunc = RemakeStore.getNewItemRenderFunction({name: partialName});

    // use the user-defined partial files only if no render functions are found
    if (!partialRenderFunc) {
      let [partialFileString] = await capture(getPartial({appName, partialName}));

      if (partialFileString) {
        partialRenderFunc = Handlebars.compile(partialFileString);
      }
    }

    if (!partialRenderFunc) {
      showConsoleError(`Error: Couldn't find a template or partial named "${partialName}"`);
      return;
    }

    let [partialBootstrapData] = await capture(getBootstrapData({fileName: partialName, appName}));

    // add a unique key to every plain object in the bootstrap data
    forEachDeep(partialBootstrapData, function (value, key, parentValue, context) {
      if (isPlainObject(value)) {
        value.id = getUniqueId();
      }
    });

    let query = getQueryParams({req, fromReferrer: true});
    let pathname = req.urlData.referrerUrlPathname;
    let currentUser = req.user;
    let [pageAuthor, pageAuthorError] = await capture(getUserData({username}));

    if (pageAuthorError) {
      res.json({success: false, reason: "userData"});
      return;
    }

    if (username && !pageAuthor) {
      res.json({success: false, reason: "notAuthorized"});
      return;
    }

    let data = pageAuthor && pageAuthor.appData || {};
    let isPageAuthor = currentUser && pageAuthor && currentUser.details.username === pageAuthor.details.username;

    if (!isPageAuthor) {
      res.json({success: false, reason: "notAuthorized"});
      return;
    }

    // {res, appName, pageAuthor, data, itemId}
    let [itemData] = await capture(processData({appName, res, pageAuthor, data, params, requestType: "ajax"}));
    let {currentItem, parentItem} = itemData;

    let htmlString = templateRenderFunc({
      data,
      params,
      query,
      pathname,
      currentItem,
      parentItem,
      currentUser,
      pageAuthor,
      isPageAuthor,
      pageHasAppData: !!pageAuthor,
      ...partialBootstrapData
    });

    res.json({success: true, htmlString: htmlString});
  })

}





