import { getLocationKeyValue, setLocationKeyValue } from './locationKeyData';
import { callWatchFunctions } from '../inputjs';
const dashCase = require('lodash/kebabCase');

// set a value for a key
// single element
export function setValueForKeyName (elem, keyName, value) {
  let dashCaseKeyName = dashCase(camelCaseKeyName)
  let attrName = "key:" + dashCaseKeyName;
  let currentAttrValue = elem.getAttribute(attrName);
  let hasCommand = currentAttrValue.startsWith("@");

  // commands start with @
  if (hasCommand) {
    let targetElems;
    let targetDirectiveSelector;

    // @search is a special command that finds a target element (or several target elements)
    // inside the current element to modify
    if (currentAttrValue.startsWith("@search")) {
      targetDirectiveAttrName = `target:${dashCaseKeyName}`;
      targetElems = Array.from(elem.querySelectorAll(`[target\\:${dashCaseKeyName}]`));
    } else {
      targetDirectiveAttrName = attrName;
      targetElems = [elem];
    }

    targetElems.forEach(el => {
      let targetDirective = el.getAttribute(targetDirectiveAttrName);
      if (targetDirective.startsWith("@attr:")) {
        // set a custom attribute, like "data-example" to a value
        let targetDirectiveAttribute = targetDirective.substring("@attr:".length);
        elem.setAttribute(targetDirectiveAttribute, value);
      } else if (targetDirective.startsWith("@")) {
        // set a native DOM property to a value
        elem[targetDirective.substring("@".length)] = value;
      }
    });
  } else {
    elem.setAttribute(attrName, value);
  }

  callWatchFunctions({
    dashCaseKeyName, 
    value, 
    parentOfTargetElements: elem, 
    dataSourceElem: elem
  });
}

// get value from a key
// single element
export function getValueFromKeyName (elem, camelCaseKeyName) {
  // convert the key name to output and location format
  let dashCaseKeyName = dashCase(camelCaseKeyName)
  let attrName = "key:" + dashCaseKeyName;
  let currentAttrValue = elem.getAttribute(attrName);
  let hasCommand = currentAttrValue.startsWith("@");

  if (elem.hasAttribute(outputAttr)) {
    return elem.getAttribute(outputAttr);
  } else if (elem.hasAttribute(locationAttr)) {
    let locationString = elem.getAttribute(locationAttr);
    return getLocationKeyValue(elem, dashCaseKeyName, locationString);
  }
}

export function getValueFromClosestKey ({elem, camelCaseKeyName}) {
  // 1. form the output attribute key name
  let dashCaseKeyName = camelCaseToDash(camelCaseKeyName);

  // 2. look for the closest element with that output attribute
  let dataSourceElem = elem.closest(`[data-o-key-${dashCaseKeyName}], [data-l-key-${dashCaseKeyName}]`);

  return getValueFromKeyName(dataSourceElem, camelCaseKeyName);
}

export function setValueOfClosestKey ({elem, camelCaseKeyName, value}) {

  // 1. form the output attribute key name
  let dashCaseKeyName = camelCaseToDash(camelCaseKeyName);

  // 2. look for the closest element with that output attribute
  let dataSourceElem = elem.closest(`[data-o-key-${dashCaseKeyName}], [data-l-key-${dashCaseKeyName}]`);

  // 3. set value on data source element
  setValueForKeyName(dataSourceElem, camelCaseKeyName, value);

}