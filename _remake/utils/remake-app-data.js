const jsonfile = require("jsonfile");
import { capture } from "../utils/async-utils";
import { getDirForRemakeAppData } from "../utils/directory-helpers";

export async function getCacheBustString({appName, shouldRegenerate} = {}) {
  let remakeAppDataDir = getDirForRemakeAppData({ appName });
  let cacheBustString = (new Date).getTime();

  let [appData] = await capture(jsonfile.readFile(remakeAppDataDir));
  if (!appData) {
    appData = {cacheBustString};
  }

  if (!appData.cacheBustString || shouldRegenerate) {
    appData.cacheBustString = cacheBustString;
  }

  await capture(jsonfile.writeFile(remakeAppDataDir, appData, { spaces: 2 }));

  return appData.cacheBustString;
}