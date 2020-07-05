import { $ } from '../queryjs';
import { camelCaseToDash } from '../hummingbird/lib/string';
import { callWatchFunctions } from "./watchHelpers";
import { debouncedCallSaveFunction } from './onSave';
import { setValueOfClosestKey } from '../data-utilities';

export default function () {

  // <input> and <textarea>
  // IMPORTANT: This is ONLY for text inputs, not radio, select, or checkboxes
  $.on("input", "input[type='text'][data-i], textarea[data-i]", function (event) {
    let elem = event.currentTarget;
    let camelCaseKeyName = event.currentTarget.getAttribute("name");
    let value = event.currentTarget.value;

    setValueOfClosestKey({elem, camelCaseKeyName, value});

    if (event.currentTarget.getAttribute("data-i") !== "dontTriggerSaveOnChange") {
      debouncedCallSaveFunction({targetElement: event.currentTarget});
    }
  });

}