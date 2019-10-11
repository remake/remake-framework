import { getDirForAllPartials } from "./directory-helpers";
import { capture, getAllFileContentsInDirectory } from "./async-utils";

export async function getPartialsAsInlinePartials ({appName}) {
  let partialsDir = getDirForAllPartials({appName});
  let [fileContentsArray] = await capture(getAllFileContentsInDirectory({dir: partialsDir, fileType: "hbs"}));
  let inlinePartialsArray = fileContentsArray.map(obj => {
    return `{{#*inline "${obj.fileName}"}}\n${obj.contents}\n{{/inline}}`;
  });
  let inlinePartialsString = inlinePartialsArray.join("\n");

  return inlinePartialsString;
}