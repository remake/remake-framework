const axios = require("axios");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const extract = require("extract-zip");
const shell = require("shelljs");
const path = require("path");
const fs = require("fs");
const archiver = require("archiver");
const isValidDomain = require("is-valid-domain");

// configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, global.config.location.tmp);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({
  storage,
  limits: {
    fieldSize: 50 * 1024 * 1024,
    fileSize: 50 * 1024 * 1024,
  },
});

// check JWT token received in the header of protected requests
function checkIfAuthenticated(req, res, next) {
  const bearerHeader = req.headers["authorization"]; // get token
  if (typeof bearerHeader === "string") {
    const bearer = bearerHeader.split(" ")[1];
    // verity received token against the JWT secret used for generating it
    jwt.verify(bearer, config.jwt.secret, (err, data) => {
      if (err) {
        return res
          .status(403)
          .json({ message: "Bad request: " + err })
          .end();
      } else {
        req.user_id = data.id;
        next();
      }
    });
  } else {
    return res
      .status(403)
      .json({ message: "Bad request: authorization header not provided" })
      .end();
  }
}

function cleanEmail(email) {
  let split = email.toLowerCase().trim().split("@");
  let firstPart = split[0].replace(/\./, "");
  let cleanedEmail = firstPart + "@" + split[1];
  return cleanedEmail;
}

// validate email
async function validEmail(req, res, next) {
  // regex source: https://stackoverflow.com/a/46181
  const emailRegex = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/;
  const email = req.body.email || req.query.email;
  if (!email) {
    return res.status(400).json({ message: "Bad request: email is missing." }).end();
  } else if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Bad request: email not valid." }).end();
  } else {
    try {
      let jsonResponse = await axios.get(process.env.PAYING_USERS_JSON);
      let payingUsers = jsonResponse.data;
      let cleanedEmail = cleanEmail(email);
      if (payingUsers.find(user => user.cleanedEmail === cleanedEmail)) {
        next();
      } else {
        return res
          .status(401)
          .json({
            message:
              "Please purchase a Remake account to deploy an app this way. Or you can host Remake apps on your own server: https://docs.remaketheweb.com/hosting/",
          })
          .end();
      }
    } catch (err) {
      return res
        .status(500)
        .json({ message: "Error: couldn't validate you as a paying user." })
        .end();
    }
  }
}

// validate password
function validPass(req, res, next) {
  // at least one digit and one letter + at least 8 chars long
  const passRegex = /.{8,}/;
  const password = req.body.password;
  if (!password) {
    return res.status(400).json({ message: "Bad request: password is missing." }).end();
  } else if (!passRegex.test(req.body.password)) {
    return res
      .status(400)
      .json({
        message:
          "Bad request: The password should be at least 8 characters long and it should contain at least one digit and a letter.",
      })
      .end();
  } else {
    next();
  }
}

// validate subdomain
const validSubdomain = (req, res, next) => {
  const subdomainRegex = /^[a-z]+[a-z0-9\-]*$/;
  const subdomain = req.query.subdomain || req.body.subdomain || req.body.appName;
  if (!subdomain) {
    return res.status(400).json({ message: "Bad request: subdomain is missing" }).end();
  } else if (!subdomainRegex.test(subdomain)) {
    return res
      .status(400)
      .json({
        message:
          "Bad request: The app name / subdomain should start with a lowercase letter and should contain only lowercase letters, numbers and dashes.",
      })
      .end();
  } else {
    next();
  }
};

const validAppId = (req, res, next) => {
  const appId = req.query.appId;
  if (!appId) {
    return res.status(400).json({ message: "Bad request: appId is missing" }).end();
  }
  if (!/^[0-9]*$/.test(appId)) {
    return res.status(400).json({ message: "Bad request: appId should be a number" }).end();
  } else {
    next();
  }
};

const validDomain = (req, res, next) => {
  const domain = req.body.domain;
  if (!domain) {
    return res.status(400).json({ message: "Bad request: domain is missing" }).end();
  }
  if (!isValidDomain(domain)) {
    return res.status(400).json({ message: "Bad request: invalid domain" }).end();
  }
  const domainParts = domain.split(".");
  if (domainParts.length !== 2) {
    return res
      .status(400)
      .json({ message: "Bad request: invalid domain. We don't support subdomains" })
      .end();
  } else {
    next();
  }
};

export function initServiceRoutes({ app }) {
  // signup endpoint
  // validation callbacks: validEmail, validPass
  app.post("/service/signup", validEmail, validPass, (req, res) => {
    const { email, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 8); // hash password
    database.query(
      "INSERT INTO users (email, pwd_hash) VALUES ( ?, ?)",
      [email, hashedPassword],
      (err, results, fields) => {
        if (err) {
          if (err.code === "ER_DUP_ENTRY") {
            delete err.sql;
          }
          return res.status(500).json(err).end();
        }
        // generate JWT token based on user id and JWT_SECRET
        const token = jwt.sign({ id: results.insertId }, config.jwt.secret, {
          expiresIn: config.jwt.duration,
        });
        return res.status(200).json({ token }).end();
      }
    );
  });

  // login endpoint
  // validation callbacks: validEmail, validPass
  app.post("/service/login", validEmail, validPass, (req, res) => {
    const { email, password } = req.body;
    database.query("SELECT * FROM users WHERE email = ?", [email], (err, results, _) => {
      if (err) {
        return res.status(500).json(err).end();
      }
      if (results.length !== 1) {
        return res.status(403).json({ message: "User not found" }).end();
      }
      const user = results[0];
      // compare password with password hash
      bcrypt.compare(password, user.pwd_hash, (err, passwordIsCorrect) => {
        if (err) {
          return res.status(500).json(err).end();
        }
        if (!passwordIsCorrect) {
          return res.status(403).json({ message: "Wrong email or password" }).end();
        }
        // generate JWT token based on user id and JWT_SECRET
        const token = jwt.sign({ id: user.id }, config.jwt.secret, {
          expiresIn: config.jwt.duration,
        });
        return res.status(200).json({ token }).end();
      });
    });
  });

  // endpoint for checking if subdomain is available (not already in the DB)
  // validation callbacks: checkIfAuthenticated, validSubdomain
  // user must be authenticated to access it
  app.get("/service/subdomain/check", checkIfAuthenticated, validSubdomain, (req, res) => {
    const { subdomain } = req.query;
    database.query("SELECT * FROM apps WHERE name = ?", [subdomain], (err, result, _) => {
      if (err) {
        return res.status(500).json(err).end();
      }
      if (result.length !== 0) {
        return res.status(403).end();
      }
      return res.status(200).end();
    });
  });

  // endpoint for registering subdomain (save in DB)
  // validation callbacks: checkIfAuthenticated, validSubdomain
  // user must be authenticated to access it
  app.post("/service/subdomain/register", checkIfAuthenticated, validSubdomain, (req, res) => {
    const { subdomain } = req.body;

    database.query(
      "SELECT * FROM apps WHERE user_id = ?",
      [req.user_id],
      (err, results, fields) => {
        if (err) {
          return res.status(500).json(err).end();
        }
        if (results.length >= global.config.limits.appPerUser) {
          return res
            .status(403)
            .json({ message: `Reached ${global.config.limits.appPerUser} apps limit.` })
            .end();
        }

        database.query(
          "INSERT INTO apps (name, user_id, domain) VALUES (?, ?, ?)",
          [subdomain, req.user_id, `${subdomain}.remakeapps.com`],
          (err, results, fields) => {
            if (err) {
              if (err.code === "ER_DUP_ENTRY") {
                return res
                  .status(400)
                  .json({ message: "An app with the same name already exists." })
                  .end();
              } else {
                return res.status(500).json(err).end();
              }
            }
            return res.status(200).end();
          }
        );
      }
    );
  });

  // endpoint for deploying app
  // upload app files if the user owns the app
  // validation callbacks: checkIfAuthenticated, validSubdomain, upload.single(...)
  // user must be authenticated to access it
  app.post(
    "/service/deploy",
    checkIfAuthenticated,
    upload.single("deployment"),
    validSubdomain,
    (req, res) => {
      const { appName } = req.body;
      database.query(
        "SELECT * FROM apps WHERE user_id = ? AND name = ?",
        [req.user_id, appName],
        (err, result, _) => {
          if (err) {
            return res.status(500).json(err).end();
          }
          if (result.length === 0) {
            return res.status(403).json("Unauthorized to deploy").end();
          }
          extract(req.file.path, { dir: `${global.config.location.tmp}/${appName}` }, err => {
            if (err) {
              return res.status(500).json(err).end();
            } else {
              try {
                let remakeDirectory = global.config.location.remake;
                let appTempDirectory = global.config.location.tmp;
                shell.mkdir("-p", `${remakeDirectory}/app/${appName}/data/uploads`);
                shell.mkdir("-p", `${remakeDirectory}/app/${appName}/data/database/user-app-data`);
                shell.mkdir("-p", `${remakeDirectory}/app/${appName}/data/database/user-details`);
                shell.mkdir("-p", `${remakeDirectory}/_remake/dist/app_${appName}`);
                shell.cp(
                  "-r",
                  `${appTempDirectory}/${appName}/app/*`,
                  `${remakeDirectory}/app/${appName}/`
                );
                shell.cp(
                  "-r",
                  `${appTempDirectory}/${appName}/app/assets/*`,
                  `${remakeDirectory}/_remake/dist/app_${appName}`
                );

                if (/[a-z0-9\/\-]\.zip$/.test(req.file.path)) {
                  shell.rm(req.file.path);
                }
                return res.status(200).end();
              } catch (err) {
                return res.status(500).end();
              }
            }
          });
        }
      );
    }
  );

  // endpoint for linking custom domain to app
  app.post("/service/domain", checkIfAuthenticated, validSubdomain, validDomain, (req, res) => {
    const { appName, domain } = req.body;

    database.query(
      "SELECT * FROM apps WHERE name = ? and user_id = ?",
      [appName, req.user_id],
      (err, results, fields) => {
        if (err) {
          return res.status(500).json(err).end();
        }
        if (results.length !== 1) {
          return res.status(400).json({ message: "No apps found." }).end();
        }

        const app = results[0];
        const remakeDirectory = global.config.location.remake;

        if (fs.existsSync(`${remakeDirectory}/app/${domain}`)) {
          return res.status(200).end();
        }

        let commandOutput;
        commandOutput = shell.ln(
          "-s",
          `${remakeDirectory}/app/${app.name}`,
          `${remakeDirectory}/app/${domain}`
        );
        if (commandOutput.code !== 0) {
          return res.status(500).end();
        }

        const nginxConfigTemplate = fs.readFileSync(
          `${remakeDirectory}/_remake/templates/nginx-custom-domain.conf`,
          "utf8"
        );
        const nginxConfig = nginxConfigTemplate.replace(/\{DOMAIN\}/g, domain);
        fs.writeFileSync(`/etc/nginx/sites-available/${domain}`, nginxConfig);
        commandOutput = shell.ln(
          "-s",
          `/etc/nginx/sites-available/${domain}`,
          `/etc/nginx/sites-enabled/${domain}`
        );
        if (commandOutput.code !== 0) {
          return res.status(500).end();
        }

        commandOutput = shell.exec(
          `sudo certbot --nginx -d ${domain} -d www.${domain} > /dev/null`,
          { silent: true }
        );
        if (commandOutput.code !== 0) {
          return res.status(500).end();
        }

        commandOutput = shell.exec(`sudo nginx -t`, { silent: true });
        if (commandOutput.code !== 0) {
          return res.status(500).end();
        }

        commandOutput = shell.exec(`sudo service nginx reload`, { silent: true });
        if (commandOutput.code !== 0) {
          return res.status(500).end();
        }

        return res.status(200).end();
      }
    );
  });

  app.get("/service/apps", checkIfAuthenticated, (req, res) => {
    database.query(
      "SELECT * FROM apps WHERE user_id = ?",
      [req.user_id],
      (err, results, fields) => {
        if (err) {
          return res.status(500).json(err).end();
        }
        res
          .status(200)
          .json(results.map(a => ({ name: a.name, id: a.id })))
          .end();
      }
    );
  });

  app.get("/service/backup", checkIfAuthenticated, validAppId, validDomain, (req, res) => {
    const { appId } = req.query;

    database.query(
      "SELECT * FROM apps WHERE id = ? and user_id = ?",
      [appId, req.user_id],
      (err, results, fields) => {
        if (err) {
          return res.status(500).json(err).end();
        }
        if (results.length !== 1) {
          return res.status(400).json({ message: "No apps found." }).end();
        }
        const app = results[0];
        const deploymentLocation = path.join(global.config.location.remake, "app", app.name);

        const deploymentContent = shell.ls(deploymentLocation);

        if (deploymentContent.length === 0) {
          return res.status(400).json({ message: "Nothing deployed yet." }).end();
        }

        const outputLocation = path.join(global.config.location.tmp, app.name + ".zip");
        const output = fs.createWriteStream(outputLocation, { encoding: "base64" });
        const archive = archiver("zip", { zlib: { level: 9 } });

        output.on("warning", err => {
          return res.status(500).json(err).end();
        });
        output.on("error", err => {
          return res.status(500).json(err).end();
        });
        output.on("close", () => {
          return res.download(outputLocation, `${app.name}-${Date.now()}.zip`, err => {
            if (err) {
              console.error(err);
            } else {
              shell.rm(outputLocation);
            }
          });
        });

        archive.pipe(output);
        archive.glob(path.join("app", app.name, "/**/*"), {
          cwd: global.config.location.remake,
          absolute: false,
        });
        archive.finalize();
      }
    );
  });
}
