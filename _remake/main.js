import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import expressSession from "express-session";
const flash = require('connect-flash');
const path = require('upath');
const FileStore = require('session-file-store')(expressSession);
import { initApiRoutes } from "./lib/init-api-routes";
import { initRenderedRoutes } from "./lib/init-rendered-routes";
import { initUserAccounts } from "./lib/init-user-accounts";
import RemakeStore from "./lib/remake-store";


// set up environment variables
dotenv.config({ path: "variables.env" });
if (process.env.REMAKE_MULTI_TENANT === "true") {
  RemakeStore.enableMultiTenantArchitecture();
}


const app = express();

// express session
app.use(expressSession({ 
  store: new FileStore({path: path.join(__dirname, './.sessions')}),
  secret: process.env.SESSION_SECRET, 
  resave: true, 
  saveUninitialized: true,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 30
  }
}));

// attach appName to request object and session if multi-tenant mode enabled
if (RemakeStore.isMultiTenant()) {
  app.get(/\/app_([a-z]+[a-z0-9-]*)/, function (req, res, next) {
    let appName = req.params[0];

    if (appName) {
      req.appName = appName;
      req.session.appName = appName;
    }

    next();
  });
}

app.use(function (req, res, next) {
  // attach all url data to the request
  req.urlData = {};
  req.urlData.url = req.protocol + '://' + req.get('host') + req.originalUrl;
  req.urlData.referrerUrl = req.get('Referrer');

  req.urlData.urlObj = new URL(req.urlData.url);
  req.urlData.urlPathname = req.urlData.urlObj.pathname;

  req.urlData.referrerUrlObj = req.urlData.referrerUrl && new URL(req.urlData.referrerUrl);
  req.urlData.referrerUrlPathname = req.urlData.referrerUrl && req.urlData.referrerUrlObj.pathname;
  next();
})

app.use(cookieParser());
app.use(express.static(path.join(__dirname, './dist')));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(flash());

// REMAKE FRAMEWORK CORE
initUserAccounts({ app });
initApiRoutes({ app });
initRenderedRoutes({ app });


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`)

  if (process.send) {
    process.send('online');
  }
})








