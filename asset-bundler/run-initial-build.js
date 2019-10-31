const fs = require("fs");
const glob = require("glob");
const {processFile} = require("./process-file");
const config = require("./config");
const {globToSearch} = config;

function runInitialBuild () {
  let initialFilePaths = glob.sync(globToSearch);
  initialFilePaths.forEach(function (filePath) {
    let stats = fs.statSync(filePath);
    let isProduction = process.argv.includes("production");

    processFile({filePath, stats, isProduction});
  });
}

module.exports = {
  runInitialBuild
};