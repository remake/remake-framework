const chokidar = require("chokidar");
const {processFile} = require("./process-file");
const config = require("./config");
const {globToSearch} = config;


// FILE WATCHER

const watcher = chokidar.watch(globToSearch, {
  ignoreInitial: true,
  alwaysStat: true
});

watcher.on("all", (event, filePath, stats) => {
  processFile({filePath, stats, shouldRecompute: true});
});





