import { camelCaseToDash } from '../hummingbird/lib/string';
import { getLocationKeyValue, setLocationKeyValue } from './locationKeyData';
import { callWatchFunctions } from '../inputjs';

// utility function for setting a value on a data attribute
// using a key name that could be EITHER a location key or an output key
export function setValueForKeyName (elem, camelCaseKeyName, value) {
  // convert the key name to output and location format
  let dashCaseKeyName = camelCaseToDash(camelCaseKeyName)
  let outputAttr = "data-o-key-" + dashCaseKeyName;
  let locationAttr = "data-l-key-" + dashCaseKeyName;

  if (elem.hasAttribute(outputAttr)) {
    elem.setAttribute(outputAttr, value);
  } else if (elem.hasAttribute(locationAttr)) {
    let locationString = elem.getAttribute(locationAttr);
    setLocationKeyValue(elem, dashCaseKeyName, locationString, value);
  }

  callWatchFunctions({
    dashCaseKeyName, 
    value, 
    parentOfTargetElements: elem, 
    dataSourceElem: elem
  });
}

export function getValueFromKeyName (elem, camelCaseKeyName) {
  // convert the key name to output and location format
  let dashCaseKeyName = camelCaseToDash(camelCaseKeyName)
  let outputAttr = "data-o-key-" + dashCaseKeyName;
  let locationAttr = "data-l-key-" + dashCaseKeyName;

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