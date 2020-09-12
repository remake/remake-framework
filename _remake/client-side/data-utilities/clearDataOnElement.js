import { dashToCamelCase } from '../hummingbird/lib/string';
import { setValueForKeyName } from './getAndSetKeyValues';

// used for the remove/hide editable component
export function setAllDataToEmptyStringsExceptIds (elem) {
  forEachAttr(elem, function (attrName, attrValue) {
    if (attrName !== "key:id" && attrName.startsWith("key:")) {
      let dashCaseKeyName = attrName.substring("key:".length);
      let camelCaseKeyName = dashToCamelCase(dashCaseKeyName);

      setValueForKeyName(elem, camelCaseKeyName, "");
    }
  });
}