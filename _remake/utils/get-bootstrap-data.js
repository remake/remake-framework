const jsonfile = require("jsonfile");
import { getDirForBootstrapDataFile } from "./directory-helpers";
import { capture } from "./async-utils";

export async function getBootstrapData({ fileName, appName }) {
  let bootstrapDataDir = getDirForBootstrapDataFile({ fileName, appName });
  let [bootstrapData, bootstrapDataError] = await capture(jsonfile.readFile(bootstrapDataDir));
  return bootstrapData || {};
}
