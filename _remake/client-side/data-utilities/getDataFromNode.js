import { forEachAttr } from '../hummingbird/lib/dom';
import { dashToCamelCase } from '../hummingbird/lib/string';
import { getLocationKeyValue } from './locationKeyData';

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
