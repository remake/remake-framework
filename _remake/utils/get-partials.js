import { getDirForAllPartials, getDirForPartialTemplate } from "./directory-helpers";
import { capture, readFileAsync, getAllFileContentsInDirectory } from "./async-utils";
import { forInLoopRegex } from "./common";

export async function getPartial({ appName, partialName }) {
  let partialTemplateDir = getDirForPartialTemplate({ partialName, appName });
  let [partialTemplateString] = await capture(readFileAsync(partialTemplateDir, "utf8"));
  return partialTemplateString;
}

export async function getPartialsAsInlinePartials({ appName }) {
  let partialsDir = getDirForAllPartials({ appName });
  let [fileContentsArray] = await capture(
    getAllFileContentsInDirectory({ dir: partialsDir, fileType: "hbs" })
  );
  let inlinePartialsArray = fileContentsArray.map(obj => {
    let contentsWithoutForInLoop = obj.contents.replace(forInLoopRegex, '{{#for $2 itemName="$1"');
    return `{{#*inline "${obj.fileName}"}}\n${contentsWithoutForInLoop}\n{{/inline}}`;
  });
  let inlinePartialsString = inlinePartialsArray.join("\n");

  return inlinePartialsString;
}
