const chokidar = require("chokidar");
const {deleteFile, deleteDir, processFile} = require("./process-file");
const {runInitialBuild} = require("./run-initial-build");
const config = require("./config");
const {globToSearch, frameworkGlobToSearch} = config;


// FILE WATCHER

const watcher = chokidar.watch(globToSearch, {
  ignoreInitial: true,
  alwaysStat: true
});

watcher.on("all", (event, filePath, stats) => {
  const fileInfo = {filePath, stats, shouldRecompute: true};
  switch (event) {
    case 'unlink':
      deleteFile(fileInfo);
      break;
    case 'unlinkDir':
      deleteDir(fileInfo);
      break;
    default:
      processFile(fileInfo);
  }
});



// FILE WATCHER FOR FRAMEWORK CODE

const watcherForFramework = chokidar.watch(frameworkGlobToSearch, {
  ignoreInitial: true,
  alwaysStat: true
});

watcherForFramework.on("all", (event, filePath, stats) => {
  runInitialBuild();
});





