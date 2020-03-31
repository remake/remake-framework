import { dashToCamelCase } from '../hummingbird/lib/string';
import { setValueForKeyName } from './getAndSetKeyValues';

// used for the remove/hide editable component
export function setAllDataToEmptyStringsExceptIds (elem) {
  forEachAttr(elem, function (attrName, attrValue) {
    if (attrName !== "data-o-key-id" && (attrName.startsWith("data-o-key-") || attrName.startsWith("data-l-key-"))) {
      let dashCaseKeyName = attrName.substring("data-?-key-".length);
      let camelCaseKeyName = dashToCamelCase(dashCaseKeyName);

      setValueForKeyName(elem, camelCaseKeyName, "");
    }
  });
}