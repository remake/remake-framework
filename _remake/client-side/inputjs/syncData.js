import {
  setValueForClosestKey,
  getValueForClosestKey,
  setValueForKeyName,
} from "../data-utilities";
import { callOnSyncCallbacks } from "./callbacks";
const dashCase = require("lodash/kebabCase");

export function syncData({
  keyNames = [],
  sourceElement,
  targetElement,
  shouldSyncIntoUpdateElems = false,
}) {
  keyNames.forEach(keyName => {
    let value = getValueForClosestKey({ elem: sourceElement, keyName });
    setValueForClosestKey({ elem: targetElement, keyName, value, dontSave: true });

    if (shouldSyncIntoUpdateElems) {
      syncIntoUpdateElem({ targetElement, keyName, value });
    }
  });

  callOnSyncCallbacks({ keyNames, sourceElement, targetElement, shouldSyncIntoUpdateElems });
}

// used when clicking an element/button that might want to set data ahead of the sync
export function syncDataNextTick(...args) {
  setTimeout(() => {
    syncData(...args);
  });
}

function syncIntoUpdateElem({ targetElement, keyName, value }) {
  let dashCaseKeyName = dashCase(keyName);
  let elem = targetElement.querySelector(`[update\\:${dashCaseKeyName}]`);

  if (elem) {
    let tagName = elem.tagName.toLowerCase(); // select, textarea, div, input, other

    if (tagName === "input") {
      let inputType = elem.getAttribute("type"); // radio, checkbox, text, other

      if (inputType === "radio") {
        let matchingRadioElem = targetElement.querySelector(
          `[type='radio'][update\\:'${dashCaseKeyName}'][value='${value}']`
        );

        if (matchingRadioElem) {
          matchingRadioElem.checked = true;
        }
      } else if (inputType === "checkbox") {
        if (value !== "false" && value !== "") {
          elem.checked = false;
        } else {
          elem.checked = true;
        }
      } else if (inputType === "text" || !inputType) {
        elem.value = value;
      }
    } else if (tagName === "select" || tagName === "textarea") {
      elem.value = value;
    }
  }
}
