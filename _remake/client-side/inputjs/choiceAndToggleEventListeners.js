import { $ } from '../queryjs';
import { camelCaseToDash } from '../hummingbird/lib/string';
import { callSaveFunction } from './onSave';
import { getValueFromClosestKey, setValueOfClosestKey } from '../data-utilities';

export default function () {

  // plain choice, using a <div> or <button> or <a>
  $.on("click", "[data-i][data-i-key][data-i-value]", function (event) {
    // get key name and value we want to change
    let camelCaseKeyName = event.currentTarget.getAttribute("data-i-key");
    let value = event.currentTarget.getAttribute("data-i-value");

    // set value
    setValueOfClosestKey({elem: event.currentTarget, camelCaseKeyName, value});

    if (event.currentTarget.getAttribute("data-i") !== "dontTriggerSaveOnChange") {
      callSaveFunction({targetElement: event.currentTarget});
    }
  });

  // plain toggle, using a <div> or <button> or <a>
    // <div data-i-toggle data-i-key="done" data-i-value="true"></div>
    // finds matching data-o-key-* and alternates between setting "true" and ""
  $.on("click", "[data-i-toggle]", function (event) {
    let camelCaseKeyName = event.currentTarget.getAttribute("data-i-toggle");

    // set value
    let currentValue = getValueFromClosestKey({elem: event.currentTarget, camelCaseKeyName});
    if (currentValue) {
      setValueOfClosestKey({elem: event.currentTarget, camelCaseKeyName, value: ""});
    } else {
      setValueOfClosestKey({elem: event.currentTarget, camelCaseKeyName, value: "true"});
    }

    if (event.currentTarget.getAttribute("data-i") !== "dontTriggerSaveOnChange") {
      callSaveFunction({targetElement: event.currentTarget});
    }
  })

  // <radio> AND <select>
  $.on("change", "[type='radio'][data-i], select[data-i]", function (event) {
    // get key name and value we want to change
    let camelCaseKeyName = event.currentTarget.getAttribute("name");
    let value = event.currentTarget.value;

    // set value
    setValueOfClosestKey({elem: event.currentTarget, camelCaseKeyName, value});

    if (event.currentTarget.getAttribute("data-i") !== "dontTriggerSaveOnChange") {
      callSaveFunction({targetElement: event.currentTarget});
    }
  });


  // <checkbox>
  $.on("change", "[data-i][type='checkbox']", function (event) {
    // get key name and value we want to change
    let camelCaseKeyName = event.currentTarget.getAttribute("name");
    let value = event.currentTarget.checked ? event.currentTarget.value : "";

    // set value
    setValueOfClosestKey({elem: event.currentTarget, camelCaseKeyName, value});

    if (event.currentTarget.getAttribute("data-i") !== "dontTriggerSaveOnChange") {
      callSaveFunction({targetElement: event.currentTarget});
    }
  });

}








