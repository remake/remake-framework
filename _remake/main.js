import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import expressSession from "express-session";
const flash = require('connect-flash');
const path = require('upath');
const FileStore = require('session-file-store')(expressSession);
import { initApiRoutes } from "./lib/init-api-routes";
import { initServiceRoutes } from "./lib/init-service-routes";
import { initRenderedRoutes } from "./lib/init-rendered-routes";
import { initUserAccounts } from "./lib/init-user-accounts";

const mysql = require("mysql");
const bodyParser = require("body-parser");
const morgan = require("morgan");

// set up vars
dotenv.config({ path: "variables.env" });

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

app.use(morgan('dev'));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, './dist')));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(flash());


// REMAKE FRAMEWORK CORE
initUserAccounts({ app });
initApiRoutes({ app });
initRenderedRoutes({ app });

// ??? only in multi tenant ???
// REMAKE DEPLOYMENT SERVICE
global.config = {
  db: {
    name: 'remake-service',
    port: 3307,
    host: 'localhost',
    user: 'remake',
    password: 'ekamer'
  },
  jwt: {
    secret: 'GPeNhMHPB9XUvTEXgbkQNyGzQueYV57U',
    duration: 365 * 24 * 3600 // 1 year
  }
}

app.use((req, res, next) => {
  global.connection = mysql.createConnection({
    host : config.db.host,
    user : config.db.user,
    password : config.db.password,
    database : config.db.name,
    port: config.db.port
  });

  connection.connect((err) => {
    if (err) throw err;
    next();
  });
});

initServiceRoutes({ app });
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// ??? only in multi tenant ???

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`)

  if (process.send) {
    process.send('online');
  }
})




