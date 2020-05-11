import { formatSpaces } from "../parse-data-attributes";

// Used for attributes like: <div data-l-key-widget-code=".widget-code innerHTML"></div>
// helper function for getLocationKeyValue() and setLocationKeyValue()
export function getDataFromLocationString (elem, dashCaseKeyName, locationString) {
  locationString = formatSpaces(locationString);
  let [selector, elemAttribute] = locationString.split(" "); // e.g. [".selector", "attr:data-x-text"]
  let targetElem;

  if (!selector) {
    let defaultTargetSelector = `[data-l-target-${dashCaseKeyName}]`;
    if (elem.matches(defaultTargetSelector)) {
      targetElem = elem;
    } else {
      targetElem = elem.querySelector(defaultTargetSelector); // e.g. dashCaseKeyName = "page-title"
    }
  }

  if (!targetElem) {
    if (!selector || selector === "." || elem.matches(selector)) {
      targetElem = elem;
    } else {
      targetElem = elem.querySelector(selector);
    }
  }

  return {elemAttribute, targetElem};
}

let attributeLookupFromNodeName = {
  IMG: "src",
  AUDIO: "src",
  VIDEO: "src",
  IFRAME: "src",
  SCRIPT: "src",
  LINK: "href"
};
let shouldGetAsAttributeInsteadOfAsProp = ["class", "src", "href", "style"];
export function getLocationKeyValue (elem, dashCaseKeyName, locationString) {
  let {elemAttribute, targetElem} = getDataFromLocationString(elem, dashCaseKeyName, locationString);

  let nodeName = targetElem.nodeName.toUpperCase();

  if (!elemAttribute) {
    elemAttribute = attributeLookupFromNodeName[nodeName];

    if (!elemAttribute) {
      elemAttribute = "innerText";
    }
  }

  let elemValue;
  if (elemAttribute.indexOf("attr:") === 0) {
    elemAttribute = elemAttribute.substring(5);
    elemValue = targetElem && targetElem.getAttribute(elemAttribute);
  } else {
    if (shouldGetAsAttributeInsteadOfAsProp.includes(elemAttribute)) {
      elemValue = targetElem && targetElem.getAttribute(elemAttribute); // e.g. elem["src"]
    } else {
      elemValue = targetElem && targetElem[elemAttribute]; // e.g. elem["innerText"]
    }
  }

  return typeof elemValue === "string" ? elemValue.trim() : "";
}

// use like this: setLocationKeyValue(elem, ".selector", "example text")
                                              // ^ this will default to setting innerText if there's no 2nd argument
export function setLocationKeyValue (elem, dashCaseKeyName, locationString, value) {
  let {elemAttribute, targetElem} = getDataFromLocationString(elem, dashCaseKeyName, locationString);

  let nodeName = targetElem.nodeName.toUpperCase();

  if (!elemAttribute) {
    elemAttribute = attributeLookupFromNodeName[nodeName];

    if (!elemAttribute) {
      elemAttribute = "innerText";
    }
  }

  if (targetElem) {
    let valueAsString = value.toString();

    if (elemAttribute.indexOf("attr:") === 0) {
      elemAttribute = elemAttribute.substring(5);
      targetElem.setAttribute(elemAttribute, valueAsString);
    } else {
      targetElem[elemAttribute] = valueAsString;
    }
  }
}

