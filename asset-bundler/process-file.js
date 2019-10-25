const shell = require("shelljs");
const path = require("upath");
const mkdirp = require("mkdirp");
const fs = require("fs");
const glob = require("glob");

function processFile ({filePath, stats, shouldRecompute}) {
  filePath = "../" + filePath;

  let isJsFile = path.extname(filePath) === ".js";
  let isSassFile = path.extname(filePath) === ".sass";
  let {distDir, distFilePath, distFileName, distMinFileName} = getValidDestinationPath({filePath, isJsFile, isSassFile});
  let isUnderscoreFile = distFileName.startsWith("_");
  let isFileToBeCopied = !stats.isDirectory() && !isJsFile && !isSassFile;

  // DEBUG:  
  // console.log("bundle file path:", filePath);
  // console.log({isJsFile, isSassFile, isUnderscoreFile, isFileToBeCopied, filePath, distFilePath, distFileName, distMinFileName});

  if (isJsFile && !isUnderscoreFile) {
    // using npx here to ensure babel is in our path
    shell.exec(`npx parcel build ${filePath} --out-dir ${distDir} --out-file ${distFileName} --no-minify --no-source-maps --no-content-hash`);
  }

  if (isSassFile && !isUnderscoreFile) {
    shell.exec(`npx sass ${filePath} ${distFilePath} --no-source-map`);
  }

  if (isFileToBeCopied) {
    fs.copyFileSync(filePath, distFilePath);
  }

  // recompile all files of the same type if file starts with an underscore
  if ((isJsFile || isSassFile) && isUnderscoreFile && shouldRecompute) {
    recompileFilesForApp({filePath, isJsFile, isSassFile});
  }
}


function recompileFilesForApp ({filePath, isJsFile, isSassFile}) {
  let indexOfAssetsString = filePath.indexOf("/assets/");
  let dirToSearch = filePath.slice(0, indexOfAssetsString + 8);

  let globToSearch;
  if (isJsFile) {
    globToSearch = dirToSearch + "**/!(_)*.js";
  } else {
    globToSearch = dirToSearch + "**/!(_)*.sass";
  }

  let recompileFilePaths = glob.sync(globToSearch);
  recompileFilePaths.forEach(fp => {
    let {distDir, distFilePath, distFileName, distMinFileName} = getValidDestinationPath({filePath: fp, isSassFile, isJsFile});
    
    // DEBUG:
    // console.log("Recompile file:", {fp, distDir, distFilePath, distFileName, distMinFileName});

    if (isJsFile) {
      shell.exec(`npx parcel build ${fp} --out-dir ${distDir} --out-file ${distFileName} --no-minify --no-source-maps --no-content-hash`);
    } else {
      shell.exec(`npx sass ${fp} ${distFilePath} --no-source-map`);
    }
  });
}

function getValidDestinationPath ({filePath, isSassFile, isJsFile}) {
  let distFilePath = filePath
                        .replace("../app/", "../_remake/dist/")
                        .replace("/assets/", "/");

  if (isMultiTenant) {
    distFilePath = distFilePath.replace("/dist/", "/dist/app_");
  }

  if (isSassFile) {
    distFilePath = distFilePath.replace(".sass", ".css").replace("/sass/", "/css/");
  }

  let distDir = path.dirname(distFilePath);

  // make the directory if it doesn't exist yet
  mkdirp.sync(distDir);

  let distFileName = path.basename(distFilePath);
  let distMinFileName = distFileName.replace(/\.([^\.]*)$/, ".min.$1");

  return {distDir, distFilePath, distFileName, distMinFileName};
}

module.exports = {
  processFile
}