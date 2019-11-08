const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const extract = require('extract-zip');
const shell = require('shelljs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, global.config.location.tmp);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
})

const upload = multer({ storage });

function checkJWT(req, res, next) {
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader !== 'undefined') {
    const bearer = bearerHeader.split(" ")[1];
    jwt.verify(bearer, config.jwt.secret, (err, data) => {
      if (err) {
        return res.status(403).json({ message: 'Bad request: ' + err }).end();
      } else {
        req.user_id = data.id;
        next();
      }
    })
  } else {
    return res.status(403).json({ message: 'Bad request: authorization header not provided' }).end();
  }
}

function validEmail(req, res, next) {
  // regex source: https://stackoverflow.com/a/46181
  const emailRegex = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/
  const email = req.body.email || req.query.email;
  if (!email)
    return res.status(400).json({ message : 'Bad request: email is missing.' }).end();
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message : 'Bad request: email not valid.' }).end();
  }
  else next();
}

function validPass(req, res, next) {
  // at least one digit and one letter + at least 8 chars long
  const passRegex = /^(?=.*\d)(?=.*[a-z])[a-zA-Z0-9]{8,}$/
  const password = req.body.password;
  if (!password)
    return res.status(400).json({ message : 'Bad request: password is missing.' }).end();
  if (!passRegex.test(req.body.password))
    return res.status(400).json({ message : 'Bad request: The password should be at least 8 characters long and it should contain at least one digit and a letter.' }).end();
  else next();
}

const validSubdomain = (req, res, next) => {
  const subdomainRegex = /^[a-z]+[a-z0-9\-]*$/
  const subdomain = req.query.subdomain || req.body.appName;
  if (!subdomain)
    return res.status(400).json({ message: 'Bad request: subdomain is missing' }).end();
  if (!subdomainRegex.test(subdomain)) 
    return res.status(400).json({ message : 'Bad request: The app name / subdomain should start with a lowercase letter and should contain only lowercase letters, numbers and dashes.' }).end();
  else next();
}

export function initServiceRoutes({app}) {
  app.post('/service/signup', validEmail, validPass, (req, res) => {
    const { email, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 8);
    connection.query('INSERT INTO users (email, pwd_hash) VALUES ( ?, ?)',
      [email, hashedPassword],
      (err, results, fields) => {
        if (err) {
          if (err.code === "ER_DUP_ENTRY")
            delete err.sql;
          return res.status(500).json(err).end();
        }
        const token = jwt.sign({ id: results.insertId }, config.jwt.secret, {
          expiresIn: config.jwt.duration
        });
        return res.status(200).json({ token }).end();
      });
  })

  app.post('/service/login', validEmail, validPass, (req, res) => {
    const { email, password } = req.body;
    connection.query('SELECT * FROM users WHERE email = ?',
      [email],
      (err, result, _) => {
        if (err) return res.status(500).json(err).end();
        const user = result[0];
        bcrypt.compare(password, user.pwd_hash, (err, passwordIsCorrect) => {
          if (err) return res.status(500).json(err).end();
          if (!passwordIsCorrect)
            return res.status(403).json({ message: 'Wrong email or password' }).end();
          const token = jwt.sign({ id: user.id }, config.jwt.secret, {
            expiresIn: config.jwt.duration
          });
          return res.status(200).json({ token }).end();
        });
      });
  })

  app.get('/service/subdomain/register', checkJWT, validEmail, validSubdomain, (req, res) => {
    const { subdomain, email } = req.query;
    connection.query('SELECT * FROM users WHERE email = ?',
      [email],
      (err, result, _) => {
        if (err) return res.status(500).json(err).end();
        const user = result[0];

        connection.query('INSERT INTO apps (name, user_id, domain) VALUES (?, ?, ?)',
          [subdomain, user.id, `${subdomain}.remakeapps.com`],
          (err, results, fields) => {
            if (err) {
              if (err.code === "ER_DUP_ENTRY")
                return res.status(400).json({ m: "duplicate_app_name"}).end();
              else return res.status(500).json(err).end();
            }
            return res.status(200).end();
          });
      });
  });

  app.post('/service/deploy', checkJWT, upload.single('deployment'), validEmail, validSubdomain, (req, res) => {
    const projectName = (req.file.filename.split('.'))[0];
    const { email, appName } = req.body;
    connection.query('SELECT * FROM users WHERE email = ?',
      [email],
      (err, result, _) => {
        if (err) return res.status(500).json(err).end();
        const user = result[0];

        connection.query('SELECT * FROM apps WHERE user_id = ? AND name = ?',
          [user.id, appName],
          (err, result, _) => {
            if (err) return res.status(500).json(err).end();
            if (result.length === 0) {
              return res.status(403).json('Unauthorized to deploy').end();
            }
            extract(req.file.path, { dir: `${global.config.location.tmp}/${projectName}` }, (err) => {
              if (err) {
                return res.status(500).json(err).end();
              } else {
                shell.exec(`mkdir -p ${global.config.location.remake}/app/${projectName}`)
                shell.exec(`mkdir -p ${global.config.location.remake}/app/${projectName}/data`)
                shell.exec(`rm ${global.config.location.remake}/app/${projectName}/*`)
                shell.exec(`cp -r ${global.config.location.tmp}/${projectName}/project-files/* ${global.config.location.remake}/app/${projectName}/`)
                shell.exec(`cp ${global.config.location.tmp}/${projectName}/_remake-data/user-app-data/*.json ${global.config.location.remake}/app/${projectName}/data/_user-app-data.json`)
                shell.exec(`rm ${req.file.path}`)
                shell.exec(`rm -r ${(req.file.path.split('.'))[0]}`)
                return res.status(200).end();
              }
            })
          });
      }
    );
  })

  // app.post('/service/backup', (req, res) => {})
}