const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const validUsernameRegex = /^[a-zA-Z0-9_-]+$/;
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
import { createUserData, getUserData, setUserData } from "./user-data";
import { showConsoleError } from "../utils/console-utils";
import { capture } from "../utils/async-utils";
import { getReservedWordInfo } from "../utils/get-reserved-word-info";
import { sendEmail } from "../utils/send-email";

function initUserAccounts({ app }) {
  app.use(passport.initialize());
  app.use(passport.session());

  // The local strategy require a `verify` function which receives the credentials
  passport.use(
    new LocalStrategy(
      {
        passReqToCallback: true,
      },
      async function (req, username, password, cb) {
        let appName = req.appName;

        try {
          let [currentUser] = await capture(getUserData({ username, appName }));

          if (!currentUser) {
            cb(null, false);
            return;
          }

          let [passwordMatches] = await capture(bcrypt.compare(password, currentUser.details.hash));

          if (!passwordMatches) {
            cb(null, false);
            return;
          }

          cb(null, currentUser);
          return;
        } catch (err) {
          showConsoleError("Error: Passport db error", err);
          cb(err);
        }
      }
    )
  );

  passport.serializeUser(function (currentUser, cb) {
    cb(null, {
      username: currentUser.details.username,
      appName: currentUser.details.appName,
    });
  });

  passport.deserializeUser(async function (currentUserData, cb) {
    let [currentUser, err] = await capture(
      getUserData({
        username: currentUserData.username,
        appName: currentUserData.appName,
      })
    );

    if (currentUser) {
      cb(null, currentUser);
    } else {
      showConsoleError("Error: Passport db error", err);
      cb(err);
    }
  });

  app.post(/(\/app_[a-z]+[a-z0-9-]*)?\/user\/signup/, async function (req, res) {
    let appName = req.appName;
    let { username = "", password = "", email = "" } = req.body;

    if (password.length < 8 || username.length < 1 || !validUsernameRegex.test(username)) {
      if (password.length < 8) {
        req.flash("error", "Your password must be at least 8 characters");
        res.redirect("/user/signup");
        return;
      }

      if (username.length < 1) {
        req.flash("error", "Please enter a username");
        res.redirect("/user/signup");
        return;
      }

      if (username.startsWith("_") || username.startsWith("-")) {
        req.flash("error", `Your username needs to start with a letter or number`);
        res.redirect("/user/signup");
        return;
      }

      if (!validUsernameRegex.test(username)) {
        req.flash(
          "error",
          `Your username can only contain letters, numbers, and certain symbols ("_" or "-")`
        );
        res.redirect("/user/signup");
        return;
      }
    }

    let reservedWordInfo = getReservedWordInfo(username);
    if (reservedWordInfo.isReserved) {
      req.flash(
        "error",
        `Your username can't contain the reserved word: "${reservedWordInfo.reservedWord}"`
      );
      res.redirect("/user/signup");
      return;
    }

    let [usernameTaken] = await capture(getUserData({ username }));
    if (usernameTaken) {
      req.flash("error", "That username is taken, please try another one!");
      res.redirect("/user/signup");
      return;
    }

    let [hash] = await capture(bcrypt.hash(password, 14));
    let [newUser, newUserError] = await capture(createUserData({ appName, username, hash, email }));

    req.login(newUser, function (err) {
      if (!err) {
        req.session.save(err => {
          res.redirect("/" + newUser.details.username);
        });
      } else {
        req.flash("error", "Error creating user account");
        res.redirect("/user/login");
      }
    });
  });

  app.post(
    /(\/app_[a-z]+[a-z0-9-]*)?\/user\/login/,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: "Invalid username or password",
    }),
    function (req, res) {
      req.session.save(err => {
        res.redirect("/" + req.user.details.username);
      });
    }
  );

  app.get(/(\/app_[a-z]+[a-z0-9-]*)?\/user\/logout/, function (req, res) {
    req.session.destroy(err => {
      req.logout();
      res.redirect("/user/login");
    });
  });

  app.post(/(\/app_[a-z]+[a-z0-9-]*)?\/user\/forgot/, async function (req, res) {
    let appName = req.appName;
    let { username } = req.body;
    let [currentUser] = await capture(getUserData({ username, appName }));

    if (!currentUser) {
      req.flash("error", "User not found");
      res.redirect("/user/forgot");
      return;
    }

    let token = crypto.randomBytes(32).toString("hex");
    let details = currentUser.details;
    details.resetPasswordToken = token;
    details.resetPasswordExpires = Date.now() + 7200000; // plus two hours

    setUserData({ appName, username, data: details, type: "details" });

    sendEmail(
      {
        email: details.email,
        subject: `Reset your password for ${req.urlData.host}`,
        body: `Hi ${username},<br><br>You can reset your password by following this link:<br><br>${
          req.protocol + "://" + req.urlData.host + "/user/reset/" + username + "/" + token
        }`,
      },
      function (err) {
        if (err) {
          req.flash("error", `Couldn't send password reset email. Please try again.`);
          res.redirect("/user/forgot");
        } else {
          req.flash("success", "An email with a link to change your password has been sent!");
          res.redirect("/user/login");
        }
      }
    );
  });

  app.get(/(\/app_[a-z]+[a-z0-9-]*)?\/user\/reset/, async function (req, res, next) {
    let appName = req.appName;

    // get username and token
    let pathnameSplit = req.urlData.urlPathname.split("/");
    let resetStringIndex = pathnameSplit.indexOf("reset");
    let username = pathnameSplit[resetStringIndex + 1];
    let token = pathnameSplit[resetStringIndex + 2];

    let [currentUser] = await capture(getUserData({ username, appName }));

    if (!currentUser) {
      req.flash("error", "User not found");
      res.redirect("/user/forgot");
      return;
    }

    let expiresDate = currentUser.details.resetPasswordExpires;
    if (typeof expiresDate !== "number" || Date.now() > expiresDate) {
      req.flash("error", "Password reset token is invalid or has expired. Please try again.");
      res.redirect("/user/forgot");
      return;
    }

    if (!token || token !== currentUser.details.resetPasswordToken) {
      req.flash("error", "Password reset token is invalid or has expired. Please try again.");
      res.redirect("/user/forgot");
      return;
    }

    next();
  });

  app.post(/(\/app_[a-z]+[a-z0-9-]*)?\/user\/reset/, async function (req, res) {
    let appName = req.appName;
    let { password } = req.body;

    // get username and token
    let pathnameSplit = req.urlData.urlPathname.split("/");
    let resetStringIndex = pathnameSplit.indexOf("reset");
    let username = pathnameSplit[resetStringIndex + 1];
    let token = pathnameSplit[resetStringIndex + 2];

    let [currentUser] = await capture(getUserData({ username, appName }));

    if (!currentUser) {
      req.flash("error", "User not found");
      res.redirect("/user/forgot");
      return;
    }

    let expiresDate = currentUser.details.resetPasswordExpires;
    if (typeof expiresDate !== "number" || Date.now() > expiresDate) {
      req.flash("error", "Password reset token is invalid or has expired. Please try again.");
      res.redirect("/user/forgot");
      return;
    }

    if (!token || token !== currentUser.details.resetPasswordToken) {
      req.flash("error", "Password reset token is invalid or has expired. Please try again.");
      res.redirect("/user/forgot");
      return;
    }

    if (!password || password.length < 8) {
      req.flash("error", "Your password must be at least 8 characters");
      res.redirect("/user/signup");
      return;
    }

    let details = currentUser.details;
    let [hash] = await capture(bcrypt.hash(password, 14));
    details.hash = hash;
    details.resetPasswordToken = null;
    details.resetPasswordExpires = null;
    setUserData({ appName, username, data: details, type: "details" });

    req.login(currentUser, function (err) {
      if (!err) {
        req.flash("success", "Your password was successfully reset!");
        res.redirect("/" + currentUser.details.username);
      } else {
        req.flash("success", "Success! Please log in with your new password");
        res.redirect("/user/login");
      }
    });
  });
}

export { initUserAccounts };
