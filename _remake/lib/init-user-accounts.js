const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const validUsernameRegex = /^[a-zA-Z0-9_-]+$/;
const bcrypt = require('bcrypt');
const jsonfile = require("jsonfile");
import { createUserData, getUserData, setUserData } from "./user-data";
import { showConsoleError } from "../utils/console-utils";

function initUserAccounts ({ app }) {
  app.use(passport.initialize());
  app.use(passport.session());

  // The local strategy require a `verify` function which receives the credentials
  passport.use(new LocalStrategy(async function(username, password, cb) {
    try {
      let currentUser = await getUserData({ username });

      if (!currentUser) { 
        cb(null, false);
        return;
      }

      let passwordMatches = await bcrypt.compare(password, currentUser.user.hash);

      if (!passwordMatches) {
        cb(null, false);
        return;
      }

      cb(null, currentUser);
      return;
    } catch (err) {
      showConsoleError("Error: Passport db error", err);
    }
  }));

  passport.serializeUser(function(currentUser, cb) {
    cb(null, currentUser.user.username);
  });

  passport.deserializeUser(async function(username, cb) {
    let currentUser = await getUserData({ username });

    cb(null, currentUser);
  });

  app.post('/signup', async function(req, res) {
    let username = req.body.username;
    let password = req.body.password;

    if (password.length < 8 || username.length < 1 || !validUsernameRegex.test(username)) {
      if (password.length < 8) {
        req.flash("error", "Your password must be at least 8 characters");
      }

      if (username.length < 1) {
        req.flash("error", "Please enter a username");
      }

      if (username.startsWith("_") || username.startsWith("-")) {
        req.flash("error", `Your username needs to start with a letter or number`);
      }

      if (!validUsernameRegex.test(username)) {
        req.flash("error", `Your username can only contain letters, numbers, and certain symbols ("_" or "-")`);
      }

      res.redirect('/signup');
      return;
    }

    let usernameTaken = await getUserData({ username });
    if (usernameTaken) {
      req.flash("error", "That username is taken, please try another one!");
      res.redirect('/signup');
      return;
    }

    let hash = await bcrypt.hash(password, 14);
    let newUser = await createUserData({ username, hash });

    req.login(newUser, function (err) {
      if (!err){
        res.redirect('/' + newUser.username);
      } else {
        res.redirect('/login');
      }
    });
  });

  app.post('/login', passport.authenticate('local', { 
    failureRedirect: '/login',
    failureFlash: "Invalid username or password"
  }), function(req, res) {
    res.redirect('/' + req.user.username);
  });

  app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/login');
  });
}

export {
  initUserAccounts
}