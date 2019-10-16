const chokidar = require("chokidar");
const shell = require("shelljs");
const path = require("upath");
const mkdirp = require("mkdirp");
const fs = require("fs");

// files will be compiled if they're
const watcher = chokidar.watch(["app/*/assets/**/!(_)*.*", "app/assets/**/!(_)*.*"]);

watcher.on("all", (event, filePath) => {
  
  filePath = "./" + filePath;

  let isJs = path.extname(filePath) === ".js";
  let isSass = path.extname(filePath) === ".sass";
  let {distDir, distFilePath, distFileName, distMinFileName} = getValidDestinationPath({filePath, isSass, isJs});

  // DEBUG:  
  // console.log("path:", filePath);
  // console.log({isJs, isSass, distFilePath, distFileName, distMinFileName});

  if (isJs) {
    // using npx here to ensure babel is in our path
    shell.exec(`npx parcel build ${filePath} --out-dir ${distDir} --out-file ${distFileName} --no-minify --no-source-maps --no-content-hash`);

    // minified build:
    // shell.exec(`npx parcel build ${filePath} --out-dir ${distDir} --out-file ${distMinFileName} --no-source-maps --no-content-hash`);
  }

  if (isSass) {
    shell.exec(`npx sass ${filePath} ${distFilePath} --no-source-map`);
  } 

  if (!isJs && !isSass) {
    fs.copyFileSync(filePath, distFilePath);
  }

});

function getValidDestinationPath ({filePath, isSass, isJs}) {
  let distFilePath = filePath.replace("./app/", "./_remake/dist/");
  if (isSass) {
    distFilePath = distFilePath.replace(".sass", ".css");
  }

  let distDir = path.dirname(distFilePath);

  // make the directory if it doesn't exist yet
  mkdirp.sync(distDir);

  let distFileName = path.basename(distFilePath);
  let distMinFileName = distFileName.replace(/\.([^\.]*)$/, ".min.$1");

  return {distDir, distFilePath, distFileName, distMinFileName};
}





