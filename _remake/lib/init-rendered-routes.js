const Handlebars = require('handlebars');
const parseUrl = require('parseurl');
import {getRoutes} from "./get-project-info";
const path = require('path');
const jsonfile = require("jsonfile");
import { preProcessData } from "./pre-process-data";
import { createUserData, getUserData, setUserData } from "./user-data";

export async function initRenderedRoutes ({ app }) {

  let routes = getRoutes();

  routes.forEach(({route, templateString}) => {

    app.get(route, async (req, res) => { // route === "/:username/page-name-route/:id"

      let params = req.params;
      let usernameFromParams = params.username;
      let query = req.query;
      let pathname = parseUrl(req).pathname;
      let currentUser = req.user;
      let pageOwner = await getUserData({username: usernameFromParams});
      let data = pageOwner && pageOwner.data || {};
      let isPageOwner = currentUser && pageOwner && currentUser.user.username === pageOwner.user.username;
      let flashErrors = req.flash("error");

      let currentItem;
      let parentItem; 
      if (pageOwner) {
        let processResponse = await preProcessData({data, user: pageOwner, params});
        currentItem = processResponse.currentItem;
        parentItem = processResponse.parentItem;
      }

      if (usernameFromParams && !pageOwner) {
        res.status(404).send("404 Not Found");
        return;
      }

      if (params.id && !currentItem) {
        res.status(404).send("404 Not Found");
        return;
      }

      let template = Handlebars.compile(templateString);
      let html = template({
        data,
        params,
        query,
        pathname,
        currentItem,
        parentItem,
        flashErrors,
        currentUser,
        pageOwner,
        isPageOwner
      });

      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.send(html);

    });

  });

}







