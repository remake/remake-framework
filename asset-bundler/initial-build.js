const {runInitialBuild} = require("./run-initial-build");

let isProduction = process.argv.includes("production");
runInitialBuild({isProduction});