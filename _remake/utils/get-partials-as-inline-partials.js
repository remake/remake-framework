import { getDirForAllPartials } from "./directory-helpers";
import { capture, getAllFileContentsInDirectory } from "./async-utils";

export async function getPartialsAsInlinePartials ({appName}) {
  let partialsDir = getDirForAllPartials({appName});
  let [fileContentsArray] = await capture(getAllFileContentsInDirectory({dir: partialsDir, fileType: "hbs"}));

  
}