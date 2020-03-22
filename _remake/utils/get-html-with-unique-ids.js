import { getUniqueId } from "../lib/get-unique-id";

// after generating a new item using the /new api endpoint
// this func will generate unique ids and put them into the template string
export function getHtmlWithUniqueIds ({htmlString}) {
  let indecesOfBrackets = getIndecesOfBrackets({htmlString});
  let replaceIteration = 0;
  let id;
  let newHtmlString = htmlString.replace(/_remake_random_id_/g, function (match, offset, string) {
    if (indecesOfBrackets[replaceIteration] !== indecesOfBrackets[replaceIteration - 1]) {
      id = getUniqueId();
    }

    replaceIteration++;
    return id;
  });

  return newHtmlString;
}

// description:
// ------------
// get the index of the closing bracket ">" after each instance
// of the substring "_remake_random_id_"
// output: [indexOfBracket, indexOfBracket, etc.]
function getIndecesOfBrackets ({htmlString, startingIndex, indecesOfBrackets}) {
  indecesOfBrackets = indecesOfBrackets || [];
  startingIndex = startingIndex || 0;

  let indexToInsertId = htmlString.indexOf("_remake_random_id_", startingIndex);
  let indexOfNextBracket = htmlString.indexOf(">", indexToInsertId);

  if (indexToInsertId >= 0) {
    indecesOfBrackets.push(indexOfNextBracket);

    return getIndecesOfBrackets({
      htmlString, 
      startingIndex: indexToInsertId + 1, 
      indecesOfBrackets
    });
  } else {
    return indecesOfBrackets;
  }
}




