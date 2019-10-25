const fs = require("fs");
const glob = require("glob");
const {processFile} = require("./process-file");
const config = require("./config");
const {globToSearch} = config;


let initialFilePaths = glob.sync(globToSearch);
initialFilePaths.forEach(function (filePath) {
  let stats = fs.statSync(filePath);
  processFile({filePath, stats});
});