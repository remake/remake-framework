const express = require("express");
const cookieParser = require("cookie-parser");
const expressSession = require("express-session");
const flash = require("connect-flash");
const path = require("upath");
const FileStore = require("session-file-store")(expressSession);
const shell = require("shelljs");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const pathMatch = require("path-match")({});

import { initApiNew } from "./lib/init-api-new";
import { initApiSave } from "./lib/init-api-save";
import { initApiUpload } from "./lib/init-api-upload";
import { initRenderedRoutes } from "./lib/init-rendered-routes";
import { initUserAccounts } from "./lib/init-user-accounts";
import { initServiceRoutes } from "./lib/init-service-routes";
import { getParams } from "./utils/get-params";
import { capture } from "./utils/async-utils";
import { setEnvironmentVariables } from "./utils/setup-env";
import RemakeStore from "./lib/remake-store";

// set up environment variables
setEnvironmentVariables();

const app = express();
// trust nginx and X-Forwarded-* headers
// needed for logging the user's IP addresses
app.enable("trust proxy", "127.0.0.1");

// static assets middleware comes before other routes, so they don't get asset requests
app.use(express.static(path.join(__dirname, "./dist")));
app.use(express.static(path.join(__dirname, "../_remake-uploads")));

app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// add better logging
app.use(morgan("common"));

// extract appName from host and attach it to request object
// important: show error if multi-tenant is enabled and there's no app name
if (RemakeStore.isMultiTenant()) {
  app.use(function (req, res, next) {
    // handle service routes
    // service routes don't belong to any app, hence no subdomain check
    if (/^\/service\/[a-z\/]*/.test(req.url)) {
      next();
    } else {
      // handle api endpoints, rendered routes and resources
      let splitString = req.get("host").split(".");
      let validSplit = splitString.length === 3;
      let appName = splitString[0] || "";
      let validAppName = /^[a-z]+[a-z0-9-]*$/.test(appName);
  
      if (!validSplit || !validAppName) {
        res.status(500).send("500 Server Error - No App Found");
        return;
      }
      req.appName = appName;
      next();
    }
  });
}

// detect ajax request
app.use(function (req, res, next) {
  req.isAjax = req.xhr || /json/i.test(req.headers.accept);
  next();
});

// attach url data to the request
app.use(async function (req, res, next) {

  req.urlData = {};
  req.urlData.host = req.get("host");
  req.urlData.url = req.protocol + "://" + req.urlData.host + req.originalUrl;
  req.urlData.referrerUrl = req.get("Referrer") || "";

  req.urlData.urlObj = new URL(req.urlData.url) || {};
  req.urlData.urlPathname = req.urlData.urlObj.pathname || {};

  req.urlData.referrerUrlObj = (req.urlData.referrerUrl && new URL(req.urlData.referrerUrl)) || {};
  req.urlData.referrerUrlPathname = (req.urlData.referrerUrl && req.urlData.referrerUrlObj.pathname) || "";

  // attach params to urlData (e.g. firstParam, secondParam, thirdParam, fourthParam)
  let routeMatcher = pathMatch("/:firstParam?/:secondParam?/:thirdParam?/:fourthParam?/:fifthParam?");
  let pageParamsGeneric, pageParams, pageParamsError;
  if (req.isAjax) {
    // for ajax requests:
    // - we get the path segments from the referrer
    // - there will always be a max of 3 path segments in the referrer
    req.urlData.pageParamsGeneric = routeMatcher(req.urlData.referrerUrlPathname) || {};
    [pageParams, pageParamsError] = await capture(getParams({req}));
  } else if (!RemakeStore.isMultiTenant()) {
    // when single-tenant is enabled, there will always be a max of 3 path segments
    req.urlData.pageParamsGeneric = routeMatcher(req.urlData.urlPathname) || {};
    [pageParams, pageParamsError] = await capture(getParams({req}));
  } else {
    // this case is for a multi-tenant, non-ajax request (i.e. a page render)
    // there will always be a max of 4 path segments in this case.
    // the first segment is the app name and simply needs to be stripped out
    let {firstParam, secondParam, thirdParam, fourthParam, fifthParam} = routeMatcher(req.urlData.urlPathname);
    req.urlData.pageParamsGeneric = {firstParam: secondParam, secondParam: thirdParam, thirdParam: fourthParam, fourthParam: fifthParam} || {};
    [pageParams, pageParamsError] = await capture(getParams({req}));
  }

  if (pageParamsError) {
    res.status(500).send("500 Server Error - No Params");
    return;
  }

  req.urlData.pageParams = pageParams || {};

  next();
});


// express session
let thirtyDaysInMs = 2592000000;
let thirtyDaysInSec = 2592000000 / 1000;
app.use(expressSession({ 
  store: new FileStore({
    path: path.join(__dirname, "../.sessions"),
    ttl: thirtyDaysInSec
  }),
  secret: process.env.SESSION_SECRET, 
  resave: true, 
  saveUninitialized: true,
  cookie: {
    maxAge: thirtyDaysInMs
  }
}));

// flash message middleware
app.use(flash());

// if app is multi tenant
// open MySQL connection
// and use bodyParser (needed for post requests in lib/init-service-routes.js)
if (RemakeStore.isMultiTenant()) {
  const mysql = require("mysql");
  global.config = {
    db: {
      name: "remake-service",
      port: 3306,
      host: "localhost",
      user: "remake",
      password: "ekamer"
    },
    jwt: {
      // JWT_SECRET is generated by CLI and
      // exported as an env var by setEnvironmentVariables();
      // Each multi tenant instance should have a unique JWT secret
      secret: process.env.JWT_SECRET, 
      duration: 365 * 24 * 3600 // 1 year
    },
    location: {
      remake: "/opt/remake/remake-deployment",
      tmp: "/tmp/remake"
    },
    limits: {
      appPerUser: 10,
    }
  }
  
  // open MySQL connection
  global.connection = mysql.createConnection({
    host : config.db.host,
    user : config.db.user,
    password : config.db.password,
    database : config.db.name,
    port: config.db.port
  });

  connection.connect((err) => {
    if (err) throw err;
  });
}

// if app is multi tenant
// init deploy service routes
// and create temporary location used for unzipping deployment archives
if (RemakeStore.isMultiTenant()) {
  initServiceRoutes({ app });
  shell.mkdir('-p', global.config.location.tmp);
}

// REMAKE CORE FRAMEWORK
initUserAccounts({ app });
initApiNew({ app });
initApiSave({ app });
initApiUpload({ app });
initRenderedRoutes({ app });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`)

  if (process.send) {
    process.send("online");
  }
});
