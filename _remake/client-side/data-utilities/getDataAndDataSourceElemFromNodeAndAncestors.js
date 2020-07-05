import { forEachAncestorMatch } from '../hummingbird/lib/dom';
import { getDataFromNode } from './getDataFromNode';

// Used by syncData.js to get all data on or above an element, so it can be synced into 
// another element.
// 1. Find the CLOSEST `[data-o-type="object"]`
// 2. Get this element's data keys and their values
// 3. Add these key/values into an object (lower/earlier keys always overwrite higher ones)
// 4. Start again at (a) until it returns null and you have a full object
export function getDataAndDataSourceElemFromNodeAndAncestors (elem) {
  let collectedData = {};
  let selector = '[data-o-type="object"]';

  forEachAncestorMatch({
    elem: elem,
    selector: selector, 
    callback: function (matchingElem) {
      let nodeData = getDataFromNode(matchingElem);

      // add source element
      Object.keys(nodeData).forEach((camelCaseKeyName) => {
        let value = nodeData[camelCaseKeyName];
        nodeData[camelCaseKeyName] = {value, dataSourceElem: matchingElem};
      });

      // earlier data, i.e. collectedData, always overwrites new data
      // this is because keys closer to the search source are more likely to belong to it
      collectedData = Object.assign(nodeData, collectedData);
    }
  });

  return collectedData; // e.g. {exampleTitle: {value: "Hello There!", dataSourceElem}}
}

