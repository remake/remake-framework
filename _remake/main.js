import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import expressSession from "express-session";
const flash = require('connect-flash');
const path = require('upath');
const FileStore = require('session-file-store')(expressSession);
import { initApiNew } from "./lib/init-api-new";
import { initApiSave } from "./lib/init-api-save";
import { initRenderedRoutes } from "./lib/init-rendered-routes";
import { initUserAccounts } from "./lib/init-user-accounts";
import RemakeStore from "./lib/remake-store";
import { showConsoleError } from "./utils/console-utils";


// set up environment variables
dotenv.config({ path: "variables.env" });
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = "development";
}


const app = express();
app.use(express.static(path.join(__dirname, './dist')));
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());


// attach url data to the request
app.use(function (req, res, next) {
  req.urlData = {};
  req.urlData.url = req.protocol + '://' + req.get('host') + req.originalUrl;
  req.urlData.referrerUrl = req.get('Referrer');

  req.urlData.urlObj = new URL(req.urlData.url);
  req.urlData.urlPathname = req.urlData.urlObj.pathname;

  req.urlData.referrerUrlObj = req.urlData.referrerUrl && new URL(req.urlData.referrerUrl);
  req.urlData.referrerUrlPathname = req.urlData.referrerUrl && req.urlData.referrerUrlObj.pathname;

  next();
});


// add appName to request object
if (RemakeStore.isMultiTenant()) {
  let appNameRegex = /\/app_([a-z]+[a-z0-9-]*)/;

  app.use(function (req, res, next) {

    let urlPathname = req.urlData.urlPathname;
    if (urlPathname) {
      let appNameMatch = urlPathname.match(appNameRegex);
      req.appName = appNameMatch && appNameMatch[1];
    }

    let referrerPathname = req.urlData.referrerUrlPathname;
    if (referrerPathname) {
      let appNameMatchForReferrer = referrerPathname.match(appNameRegex);
      req.appNameFromReferrer = appNameMatchForReferrer && appNameMatchForReferrer[1];
    }

    next();
  });
}

// express session
app.use(function (req, res, next) {

  if (req.originalUrl === "/") {
    next();
  }

  if (RemakeStore.isDevelopmentMode() && RemakeStore.isMultiTenant() && !(req.appName || req.appNameFromReferrer)) {
    showConsoleError("Couldn't find an app name, even though app is in multi-tenant mode");
    return;
  }

  let shouldUseAppNameCookiePath = RemakeStore.isDevelopmentMode() && RemakeStore.isMultiTenant();
  let cookiePathWithAppName = `/app_${req.appName || req.appNameFromReferrer}`;
  let cookiePath = shouldUseAppNameCookiePath ? cookiePathWithAppName : "/";

  let middlewareFunc = expressSession({ 
    store: new FileStore({path: path.join(__dirname, './.sessions')}),
    secret: process.env.SESSION_SECRET, 
    resave: true, 
    saveUninitialized: true,
    cookie: {
      maxAge: 2628000, // one month
      // in development mode, set session cookies only for the current 
      // remake application by setting them on the first path segment
      path: cookiePath
    }
  });

  middlewareFunc(req, res, next);

});

// requires sessions
app.use(flash());


// REMAKE FRAMEWORK CORE
initUserAccounts({ app });
initApiNew({ app });
initApiSave({ app });
initRenderedRoutes({ app });


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`)

  if (process.send) {
    process.send('online');
  }
})








