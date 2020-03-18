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
import { getHtmlWithUniqueIds } from "../utils/get-html-with-unique-ids";
import RemakeStore from "./remake-store";


export function initApiNew ({app}) {

  // route for "/upload" and "/app_*/upload"
  app.post(/(\/app_[a-z]+[a-z0-9-]*)?\/upload/, async (req, res) => {

    if (!req.isAuthenticated()) {
      res.json({success: false, reason: "notAuthorized"});
      return;
    }

    let appName = req.appName;
    let username = req.urlData.pageParams.username;
    let currentUser = req.user;
    let [pageAuthor, pageAuthorError] = await capture(getUserData({appName, username}));

    if (pageAuthorError) {
      res.json({success: false, reason: "userData"});
      return;
    }

    if (username && !pageAuthor) {
      res.json({success: false, reason: "notAuthorized"});
      return;
    }

    let isPageAuthor = currentUser && pageAuthor && currentUser.details.username === pageAuthor.details.username;

    if (!isPageAuthor) {
      res.json({success: false, reason: "notAuthorized"});
      return;
    }

    res.json({success: true});
  })

}





