const jsonfile = require("jsonfile");

export async function getBootstrapData ({fileName, appName}) {
  let bootstrapDataDir = getDirForBootstrapDataFile({fileName, appName});
  let [bootstrapData] = await capture(jsonfile.readFile(bootstrapDataDir));

  return bootstrapData || {};
}