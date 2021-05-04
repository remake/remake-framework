import { getUniqueId } from "../lib/get-unique-id";

// after generating a new item using the /new api endpoint
// this func will generate unique ids and put them into the template string
export function getHtmlWithUniqueIds({ htmlString }) {
  let idExpressions = htmlString.match(/__remake_unique_marker_\w*/gi) || [];
  let idVariablesUnique = [...new Set(idExpressions)]; // e.g. ["project_id", "todo", "blogPost"]
  let idVariableToIdArray = idVariablesUnique.map(idVar => ({ name: idVar, id: getUniqueId() }));
  idVariableToIdArray.forEach(idVarMap => {
    htmlString = htmlString.replace(new RegExp(idVarMap.name, "g"), idVarMap.id);
  });
  return htmlString;
}
