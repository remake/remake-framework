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

export function initServiceRoutes({app}) {
  app.post('/service/signup', (req, res) => {
    if (!req.body.email || !req.body.password)
      return res.status(400).json({ message: 'Bad request: email or password is missing' }).end();
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

  app.post('/service/login', (req, res) => {
    if (!req.body.email || !req.body.password)
      return res.status(400).json({ message: 'Bad request: email, password is missing' }).end();
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

  app.get('/service/subdomain/availability', checkJWT, (req, res) => {
    if (!req.query.subdomain || !req.query.email)
      return res.status(400).json({ message: 'Bad request: subdomain or email params are missing' }).end();
    // TODO write logic for checking subdomain availability
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
  })

  app.post('/service/deploy', checkJWT, upload.single('deployment'), (req, res) => {
    console.log(req.file);
    const projectName = (req.file.filename.split('.'))[0];
    shell.exec(`mkdir ${projectName}`);
    extract(req.file.path, { dir: `${global.config.location.tmp}/${projectName}` }, (err) => {
      if (err) {
        return res.status(200).end();
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
  })

  // app.post('/service/backup', (req, res) => {})
}