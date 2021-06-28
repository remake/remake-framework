import { isValidCommand } from "../common/get-valid-element-properties";
import { parseStringWithIndefiniteNumberOfParams } from "../parse-data-attributes";
import {
  getValueForClosestKey,
  getClosestElemWithKey,
  getTargetElemsForKeyName,
  getValueForKeyName,
} from "./getAndSetKeyValues";
import { forEachAttr } from "../hummingbird/lib/dom";
import { showWarning } from "../common/show-error";
import optionsData from "../inputjs/optionsData";
const camelCase = require("lodash/camelCase");
const difference = require("lodash/difference");

// useful for running watch functions when the page loads
// e.g. callWatchFunctionsOnElements(document.querySelectorAll("[watch]"))
export function callWatchFunctionsOnElements(elems) {
  elems.forEach(elem => {
    forEachAttr(elem, (attrName, attrValue) => {
      if (attrName.indexOf("watch:") === 0) {
        let dashCaseKeyName = attrName.substring("watch:".length);
        let closestElemWithKey = getClosestElemWithKey({ elem, keyName: dashCaseKeyName });
        let value = getValueForKeyName({ elem: closestElemWithKey, keyName: dashCaseKeyName });
        let targetElems = getTargetElemsForKeyName({ elem, keyName: dashCaseKeyName });
        triggerWatchAttributes({ elem, dashCaseKeyName, value, targetElems });
      }
    });
  });
}

// trigger watch attributes inside an element
// note: this allows for watching multiple keys with the same name as long as they're at different levels
export function triggerWatchAttributes({ elem, dashCaseKeyName, value, targetElems }) {
  let selector = `[watch\\:${dashCaseKeyName}]`;
  let attr = `watch:${dashCaseKeyName}`;
  // nested watch elements with second-level elements filtered out
  let watchElems = difference(
    elem.querySelectorAll(selector),
    elem.querySelectorAll(`:scope [key\\:${dashCaseKeyName}] [watch\\:${dashCaseKeyName}]`)
  );
  if (elem.matches(selector)) {
    watchElems.unshift(elem);
  }

  watchElems.forEach(watchElem => {
    let watchAttrValue = watchElem.getAttribute(attr);
    // e.g. [{funcName: "@innerText", args: []}, {funcName: "customFunc", args: [1,2,3]}]
    let listOfCommands = parseStringWithIndefiniteNumberOfParams(watchAttrValue);
    listOfCommands.forEach(({ funcName, args }) => {
      if (isValidCommand({ commandName: funcName })) {
        executeCommand({ elem: watchElem, commandName: funcName, value, method: "set" });
      } else {
        // call custom watch function
        let watchFunc = optionsData.watchFunctions && optionsData.watchFunctions[funcName];
        if (typeof watchFunc === "function") {
          watchFunc({
            watchElem, // e.g. <div watch:example-key="@innerText exampleFunc(on, 36)">
            watchAttrName: attr, // e.g. "watch:example-key"
            watchAttrValue: watchAttrValue, // e.g. "@innerText exampleFunc(on, 36)"
            dashCaseKeyName, // e.g. "example-key"
            camelCaseKeyName: camelCase(dashCaseKeyName), // "exampleKey"
            value, // the original value passed into setValueForKeyName(), e.g. "someExampleValue"
            watchFuncName: funcName, // name of the current watch function being called
            watchFuncArgs: args, // any args passed to a custom func, e.g. ["on", "36"]
            dataSourceElem: elem, // the element that setValueForKeyName() was called on, but maybe not the element data was set on (because of @search)
            dataTargetElems: targetElems, // the elements that data was set on, but maybe not the original element setValueForKeyName() was called on (because of @search)
          });
        }
      }
    });
  });
}

// handle commands
//     1. loop through target elements
//     2. execute a command on each one
// possible commands: @search, @attr:, or a native elem property (e.g. innerText)
//     @search: find a target element and get/set the value to its command
//              if using "get", it will return the value from the FIRST element only
//     @attr: get the named attribute and get/set it on the current element
//     native prop: get/set a property on the current element
export function executeCommandOnMultipleElements({ targetElems = [], targetAttr, value, method }) {
  for (let i = 0; i < targetElems.length; i++) {
    let targetElem = targetElems[i];
    // the target's command e.g. "@innerText" or "@attr:data-example"
    // every target needs a command as the value of the passed in attribute
    let commandName = targetElem.getAttribute(targetAttr);

    if (isValidCommand({ commandName })) {
      if (method === "set") {
        executeCommand({ elem: targetElem, commandName, value, method });
      } else {
        return executeCommand({ elem: targetElem, commandName, value, method });
      }
    }
  }
}

// the target for a command will usually be the element that has the command
// with one exception: @search, which causes us to look one level deeper to find
// the elements and their commands
export function getTargetsForCommand({ elem, dashCaseKeyName, attrName, attrValue }) {
  let targetAttr;
  let targetElems;

  // @search is a special command that gets/sets the value on a matching target elem
  if (attrValue === "@search") {
    let selector = `[target\\:${dashCaseKeyName}]`;
    targetAttr = `target:${dashCaseKeyName}`;
    targetElems = Array.from(elem.querySelectorAll(selector));

    if (elem.matches(selector)) {
      targetElems.unshift(elem);
    }
  } else {
    // not searching, just use the current element and key name to set/get the value
    targetAttr = attrName; // e.g. just keep the normal "key:example"
    targetElems = [elem];
  }

  return { targetElems, targetAttr };
}

// executes a named command on a target element
function executeCommand({ elem, commandName, value, method }) {
  if (commandName.indexOf("@attr:") === 0) {
    // CUSTOM ATTRIBUTES (e.g. "@attr:data-example")
    let attr = commandName.substring("@attr:".length);
    if (method === "set") {
      elem.setAttribute(attr, value);
    } else {
      return elem.getAttribute(attr);
    }
  } else {
    // NATIVE DOM PROPERTIES
    let prop = commandName.substring("@".length);
    if (prop.toLowerCase() === "src" && elem.tagName.toLowerCase() === "img") {
      showWarning(
        "Please use @attr:src instead of @src for a better experience.\n  @attr:src will get an empty string if there's no value for img.src (ideal), while @src will get the current page's url (not ideal).",
        elem
      );
    }
    if (method === "set") {
      elem[prop] = value;
    } else {
      return elem[prop];
    }
  }
}
