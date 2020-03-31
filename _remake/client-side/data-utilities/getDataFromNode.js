import { forEachAttr, forEachAncestorMatch } from '../hummingbird/lib/dom';
import { dashToCamelCase } from '../hummingbird/lib/string';
import { getLocationKeyValue } from 'locationKeyData';

// Converts:
// <div data-o-key-example-one="1" data-o-key-example-two="2"></div>
// Into:
// {exampleOne: "1", exampleTwo: "2"}
export function getDataFromNode (elem) {
  let keyPrefix = "data-o-key-";
  let locationKeyPrefix = "data-l-key-";
  let keyPrefixLength = keyPrefix.length;

  let returnObj = {};

  forEachAttr(elem, (attrName, attrValue) => {
    if (attrName.indexOf(keyPrefix) === 0) {

      let keyName = attrName.substring(keyPrefixLength);
      let camelCaseKeyName = dashToCamelCase(keyName);

      returnObj[camelCaseKeyName] = attrValue;
      
    } else if (attrName.indexOf(locationKeyPrefix) === 0) {

      let keyName = attrName.substring(keyPrefixLength);
      let camelCaseKeyName = dashToCamelCase(keyName);
      
      attrValue = getLocationKeyValue(elem, keyName, attrValue);
      returnObj[camelCaseKeyName] = attrValue;

    }
  });

  return returnObj;
}

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

