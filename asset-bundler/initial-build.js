const fs = require("fs");
const glob = require("glob");
const processFile = require("./process-file");


let initialFilePaths = glob.sync(globToSearch);
initialFilePaths.forEach(function (filePath) {
  let stats = fs.statSync(filePath);
  processFile({filePath, stats});
});