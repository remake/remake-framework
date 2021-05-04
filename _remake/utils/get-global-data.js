const jsonfile = require("jsonfile");
import { getDirForGlobalData } from "./directory-helpers";
import { capture } from "./async-utils";

export async function getGlobalData({ appName }) {
  let globalDataDir = getDirForGlobalData({ appName });
  let [globalData] = await capture(jsonfile.readFile(globalDataDir));
  return globalData || {};
}
