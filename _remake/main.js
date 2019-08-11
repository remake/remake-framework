import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
import expressSession from "express-session";
const bcrypt = require('bcrypt');
const flash = require('connect-flash');
const jsonfile = require("jsonfile");
const util = require('util');
const fs = require('fs');
const path = require('path');
const readFile = util.promisify(fs.readFile);
const FileStore = require('session-file-store')(expressSession);
import { createUserData, getUserData, setUserData } from "./lib/user-data";
import { getRoutes, getPartials } from "./lib/get-project-info";
import { initRenderedRoutes } from "./lib/init-rendered-routes";


// console.log("routes:", getRoutes());
// console.log("partials", getPartials());

// set up
const validUsernameRegex = /^[a-zA-Z0-9_-]+$/;
dotenv.config({ path: "variables.env" });


// The local strategy require a `verify` function which receives the credentials
// passport.use(new LocalStrategy(async function(username, password, cb) {
//   try {
//     let currentUser = await usersCollection.findOne({ username });

//     if (!currentUser) { 
//       cb(null, false);
//       return;
//     }

//     let passwordMatches = await bcrypt.compare(password, currentUser.hash);

//     if (!passwordMatches) {
//       cb(null, false);
//       return;
//     }

//     cb(null, currentUser);
//     return;
//   } catch (err) {
//     console.error("Passport db error", err);
//   }
// }));

// passport.serializeUser(function(currentUser, cb) {
//   cb(null, currentUser._id);
// });

// passport.deserializeUser(async function(id, cb) {
//   let currentUser = await usersCollection.findOne({ _id: ObjectID(id) });

//   cb(null, currentUser);
// });


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

app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, './dist')));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(flash());

// app.post('/signup', async function(req, res) {
//   let username = req.body.username;
//   let password = req.body.password;

//   if (password.length < 8 || username.length < 1 || !validUsernameRegex.test(username)) {
//     if (password.length < 8) {
//       req.flash("error", "Your password must be at least 8 characters");
//     }

//     if (username.length < 1) {
//       req.flash("error", "Please enter a username");
//     }

//     if (!validUsernameRegex.test(username)) {
//       req.flash("error", `Your username can only contain letters, numbers, and certain symbols ("_" or "-")`);
//     }

//     res.redirect('/signup');
//     return;
//   }

//   let usernameTaken = await usersCollection.findOne({username});
//   if (usernameTaken) {
//     req.flash("error", "That username is taken, please try another one!");
//     res.redirect('/signup');
//     return;
//   }

//   let hash = await bcrypt.hash(password, 14);
//   let insertResult = await usersCollection.insertOne({username: username, hash: hash});
//   let user = insertResult.ops[0];

//   // attach starting data
//   let startingData;
//   try {
//     startingData = await jsonfile.readFile(path.join(__dirname, "./data/user-starting-data.json"));
    
//     // top-level keys are app namespaces - they should be regular object keys; however, the nested data should be stringified
//     Object.keys(startingData).forEach(k => {
//       startingData["appData." + k] = JSON.stringify(startingData[k]);
//       delete startingData[k];
//     });

//     // create default app namespace
//     if (!startingData["appData.default"]) {
//       startingData["appData.default"] = "{}";
//     }
//   } catch (e) {
//     startingData = {};
//   }

//   let updateResult = await usersCollection.updateOne(
//     { "_id" : user._id },
//     { $set: startingData }
//   );

//   req.login(user, function (err) {
//     if (!err){
//       res.redirect('/' + user.username);
//     } else {
//       res.redirect('/login');
//     }
//   });
// });

// app.post('/login', passport.authenticate('local', { 
//   failureRedirect: '/login',
//   failureFlash: "Invalid username or password"
// }), function(req, res) {
//   res.redirect('/' + req.user.username);
// });

// app.get('/logout', function(req, res) {
//   req.logout();
//   res.redirect('/login');
// });

initRenderedRoutes({ app });


// (async function () {
  // let dataFromCreate = await createUserData({username: "john"});
  // console.log("createUser", dataFromCreate);

  // let dataFromGet1 = await getUserData({username: "john"});
  // console.log("getUser", dataFromGet1);

  // let dataFromSet1 = await setUserData({username: "xd", data: {hello: 555}, type: "private"});
  // let dataFromSet2 = await setUserData({username: "john", data: {world: 666}, type: "public"});

  // let dataFromGet2 = await getUserData({username: "john"});
  // console.log("getUser", dataFromGet2);
// })();




const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`)

  if (process.send) {
    process.send('online');
  }
})










