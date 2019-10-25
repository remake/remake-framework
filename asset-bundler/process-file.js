const shell = require("shelljs");
const path = require("upath");
const mkdirp = require("mkdirp");
const fs = require("fs");
const glob = require("glob");
const config = require("./config");
const {globToSearch, isMultiTenant} = config;

function processFile ({filePath, stats, shouldRecompute, isProduction}) {
  filePath = "./" + filePath;

  let isJsFile = path.extname(filePath) === ".js";
  let isSassFile = [".sass", ".scss"].includes(path.extname(filePath));
  let isDirectory = stats.isDirectory();
  let {distDir, distFilePath, distFileName, distMinFileName, fileStartsWithUnderscore} = getValidDestinationPath({filePath, isJsFile, isSassFile, isDirectory});
  let isFileToBeCopied = !fileStartsWithUnderscore && !isDirectory && !isJsFile && !isSassFile;

  // DEBUG:  
  // console.log("bundle file path:", filePath);
  // console.log({isJsFile, isSassFile, fileStartsWithUnderscore, isFileToBeCopied, filePath, distFilePath, distFileName, distMinFileName});

  if (isJsFile && !fileStartsWithUnderscore) {
    // using npx here to ensure babel is in our path
    if (isProduction) {
      shell.exec(`npx parcel build ${filePath} --out-dir ${distDir} --out-file ${distFileName} --no-source-maps --no-content-hash`);
    } else {
      shell.exec(`npx parcel build ${filePath} --out-dir ${distDir} --out-file ${distFileName} --no-minify --no-source-maps --no-content-hash`);
    }
  }

  if (isSassFile && !fileStartsWithUnderscore) {
    if (isProduction) {
      shell.exec(`npx sass ${filePath} ${distFilePath} --no-source-map --style compressed`);
    } else {
      shell.exec(`npx sass ${filePath} ${distFilePath} --no-source-map`);
    }
  }

  if (isFileToBeCopied) {
    fs.copyFileSync(filePath, distFilePath);
  }

  // recompile all files of the same type if file starts with an underscore
  if ((isJsFile || isSassFile) && fileStartsWithUnderscore && shouldRecompute) {
    recompileFilesForApp({filePath, isJsFile, isSassFile, isProduction});
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
      if (isProduction) {
        shell.exec(`npx parcel build ${fp} --out-dir ${distDir} --out-file ${distFileName} --no-source-maps --no-content-hash`);
      } else {
        shell.exec(`npx parcel build ${fp} --out-dir ${distDir} --out-file ${distFileName} --no-minify --no-source-maps --no-content-hash`);
      }
    } else {
      if (isProduction) {
        shell.exec(`npx sass ${fp} ${distFilePath} --no-source-map`);
      } else {
        shell.exec(`npx sass ${fp} ${distFilePath} --no-source-map --style compressed`);
      }
    }
  });
}

function getValidDestinationPath ({filePath, isSassFile, isJsFile, isDirectory}) {
  let distFilePath = filePath
                        .replace("./app/", "./_remake/dist/")
                        .replace("/assets/", "/");

  if (isMultiTenant) {
    distFilePath = distFilePath.replace("/dist/", "/dist/app_");
  }

  if (isSassFile) {
    distFilePath = distFilePath.replace(".sass", ".css").replace("/sass/", "/css/");
  }

  let distFileName = path.basename(distFilePath);
  let distMinFileName = distFileName.replace(/\.([^\.]*)$/, ".min.$1");
  let fileStartsWithUnderscore = distFileName.startsWith("_");

  let distDir = path.dirname(distFilePath);

  // make the directory if it doesn't exist yet
  if (!fileStartsWithUnderscore && !isDirectory) {
    mkdirp.sync(distDir);
  }

  return {distDir, distFilePath, distFileName, distMinFileName, fileStartsWithUnderscore};
}

module.exports = {
  processFile
}