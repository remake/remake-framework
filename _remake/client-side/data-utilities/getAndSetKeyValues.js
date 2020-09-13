import { callWatchFunctions } from '../inputjs';
import { getValidElementProperties } from '../common/get-valid-element-properties';
const dashCase = require('lodash/kebabCase');
const validPropertyCommands = getValidElementProperties().map(p => "@" + p);

function _valueForKeyName ({method, elem, keyName, value}) {
  let dashCaseKeyName = dashCase(keyName)
  let attrName = "key:" + dashCaseKeyName;
  let currentAttrValue = elem.getAttribute(attrName);
  let hasValidCommand = validPropertyCommands.includes(currentAttrValue) || currentAttrValue === "@search" || currentAttrValue.startsWith("@attr:");

  if (!hasValidCommand) {
    if (method === "set") {
      elem.setAttribute(attrName, value);
    } else {
      return elem.getAttribute(attrName);
    }
  } else {
    // possible commands: @search, @attr:, or a native property

    let targetAttr;
    let targetElems;

    // @search is a special command that gets/sets the value on a matching target elem
    if (currentAttrValue === "@search") {
      targetAttr = `target:${dashCaseKeyName}`;
      targetElems = Array.from(elem.querySelectorAll(`[target\\:${dashCaseKeyName}]`));
    } else {
      targetAttr = attrName;
      targetElems = [elem];
    }

    for (let i = 0; i < targetElems.length; i++) {
      let targetElem = targetElems[i];
      // the target's command e.g. @innerText or @attr:data-example
      // every target needs a command as its value
      let targetCommand = targetElem.getAttribute(targetAttr);
      let targetHasValidCommand = validPropertyCommands.includes(targetCommand) || targetCommand.startsWith("@attr:");

      if (targetHasValidCommand) {
        if (targetCommand.startsWith("@attr:")) {
          // CUSTOM ATTRIBUTES
          let referencedAttr = targetCommand.substring("@attr:".length);
          if (method === "set") {
            targetElem.setAttribute(referencedAttr, value);
          } else {
            return targetElem.getAttribute(referencedAttr);
          }
        } else {
          // NATIVE DOM PROPERTIES
          let referencedProp = targetCommand.substring("@".length);
          if (method === "set") {
            targetElem[referencedProp] = value;
          } else {
            return targetElem[referencedProp];
          }
        }
      }
    }
  }

  if (method === "set") {
    callWatchFunctions({
      dashCaseKeyName, 
      value, 
      parentOfTargetElements: elem, 
      dataSourceElem: elem
    });
  }
}

// set a value for a key 
// called on single element
// can affet multiple child elements
export function setValueForKeyName ({elem, keyName, value}) {
  _valueForKeyName({method: "set", elem, keyName, value});
}

// get a value for a key 
// called on single element
// gets value from a single child element (the first one it finds)
export function getValueForKeyName ({elem, keyName}) {
  return _valueForKeyName({method: "get", elem, keyName});
}


function _valueForClosestKey ({method, elem, keyName, value}) {
  let dashCaseKeyName = dashCase(keyName);
  let closestElem = elem.closest(`[key\\:${dashCaseKeyName}]`);

  if (method === "set") {
    setValueForKeyName({elem: closestElem, keyName, value});
  } else {
    return getValueForKeyName({elem: closestElem, keyName});
  }
}

export function getValueForClosestKey ({elem, keyName}) {
  return _valueForClosestKey({method: "get", elem, keyName});
}

export function setValueForClosestKey ({elem, keyName}) {
  _valueForClosestKey({method: "set", elem, keyName});
}




