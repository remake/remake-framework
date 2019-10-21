const Handlebars = require('handlebars');
import { isPlainObject } from 'lodash-es';
import forEachDeep from "deepdash-es/forEachDeep";
import getUniqueId from "./get-unique-id";
import { getUserData } from "./user-data";
import { getParams } from "../utils/get-params";
import { getPartial } from "../utils/get-partials";
import { capture } from "../utils/async-utils";
import { processData } from "../utils/process-data";
import { showConsoleError } from "../utils/console-utils";
import { getBootstrapData } from "../utils/get-bootstrap-data";
import { getQueryParams } from "../utils/get-query-params";
import RemakeStore from "./remake-store";


export function initApiNew ({app}) {

  app.post(/(\/app_[a-z]+[a-z0-9-]*)?\/new/, async (req, res) => {

    if (!req.isAuthenticated()) {
      res.json({success: false, reason: "notAuthorized"});
      return;
    }

    let partialName = req.body.templateName;
    let [params, paramsError] = await capture(getParams({req, fromReferrer: true}));
    let {username, pageName, itemId} = params;
    
    // default to using inline named partials as opposed to partial files
    let partialRenderFunc = RemakeStore.getNewItemRenderFunction({appName: req.appName, name: partialName});

    // use the user-defined partial files only if no render functions are found
    if (!partialRenderFunc) {
      let [partialFileString] = await capture(getPartial({appName: req.appName, partialName}));

      if (partialFileString) {
        partialRenderFunc = Handlebars.compile(partialFileString);
      }
    }

    if (!partialRenderFunc) {
      showConsoleError(`Error: Couldn't find a template or partial named "${partialName}"`);
      return;
    }

    let [partialBootstrapData] = await capture(getBootstrapData({appName: req.appName, fileName: partialName}));

    // add a unique key to every plain object in the bootstrap data
    forEachDeep(partialBootstrapData, function (value, key, parentValue, context) {
      if (isPlainObject(value)) {
        value.id = getUniqueId();
      }
    });

    let query = getQueryParams({req, fromReferrer: true});
    let pathname = req.urlData.referrerUrlPathname;
    let currentUser = req.user;
    let [pageAuthor, pageAuthorError] = await capture(getUserData({appName: req.appName, username}));

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
    let [itemData] = await capture(processData({appName: req.appName, res, pageAuthor, data, params, requestType: "ajax"}));
    let {currentItem, parentItem} = itemData;

    let htmlString = partialRenderFunc({
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





