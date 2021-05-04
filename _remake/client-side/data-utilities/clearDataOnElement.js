import { setValueForKeyName } from "./getAndSetKeyValues";
import { forEachAttr } from "../hummingbird/lib/dom";
const camelCase = require("lodash/camelCase");

// used for the remove/hide inside the inline edit popover
// needs to work on temporary keys because that's what the popover uses to store data
export function setAllDataToEmptyStringsExceptIds(elem) {
  forEachAttr(elem, function (attrName, attrValue) {
    let keyPrefix = "key:";
    if (attrName.startsWith(keyPrefix) && attrName !== "key:id") {
      let keyName = attrName.substring(keyPrefix.length);
      setValueForKeyName({ elem, keyName, value: "" });
    }
    let temporaryKeyPrefix = "temporary:key:";
    if (attrName.startsWith(temporaryKeyPrefix) && attrName !== "key:id") {
      let keyName = attrName.substring(temporaryKeyPrefix.length);
      setValueForKeyName({ elem, keyName, value: "" });
    }
  });
}
