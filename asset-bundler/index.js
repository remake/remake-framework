const chokidar = require("chokidar");
const {processFile} = require("./process-file");
const {runInitialBuild} = require("./run-initial-build");
const config = require("./config");
const {globToSearch, frameworkGlobToSearch} = config;


// FILE WATCHER

const watcher = chokidar.watch(globToSearch, {
  ignoreInitial: true,
  alwaysStat: true
});

watcher.on("all", (event, filePath, stats) => {
  processFile({filePath, stats, shouldRecompute: true});
});



// FILE WATCHER FOR FRAMEWORK CODE

const watcherForFramework = chokidar.watch(frameworkGlobToSearch, {
  ignoreInitial: true,
  alwaysStat: true
});

watcherForFramework.on("all", (event, filePath, stats) => {
  runInitialBuild();
});





