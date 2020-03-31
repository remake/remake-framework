import { $ } from '../queryjs';
import { camelCaseToDash } from '../hummingbird/lib/string';
import { callWatchFunctions } from './syncData';
import { callSaveFunction } from './onSave';
import { getValueFromClosestKey, setValueOfClosestKey } from 'dataUtilities';

export default function () {

  // plain choice, using a <div> or <button> or <a>
  $.on("click", "[data-i][data-i-key][data-i-value]", function (event) {
    // get key name and value we want to change
    let camelCaseKeyName = event.currentTarget.getAttribute("data-i-key");
    let attributeValue = event.currentTarget.getAttribute("data-i-value");

    // set value
    setValueOfClosestKey({elem: event.currentTarget, camelCaseKeyName, attributeValue});

    if (event.currentTarget.getAttribute("data-i") === "triggerSaveOnChange") {
      callSaveFunction({targetElement: event.currentTarget});
    }
  });

  // plain toggle, using a <div> or <button> or <a>
    // <div data-i-toggle data-i-key="done" data-i-value="true"></div>
    // finds matching data-o-key-* and alternates between setting "true" and ""
  $.on("click", "[data-i-toggle]", function (event) {
    let camelCaseKeyName = event.currentTarget.getAttribute("data-i-toggle");

    // set value
    let value = getValueFromClosestKey({elem: event.currentTarget, camelCaseKeyName});
    if (value) {
      setValueOfClosestKey({elem: event.currentTarget, camelCaseKeyName, attributeValue: ""});
    } else {
      setValueOfClosestKey({elem: event.currentTarget, camelCaseKeyName, attributeValue: "true"});
    }

    if (event.currentTarget.getAttribute("data-i") === "triggerSaveOnChange") {
      callSaveFunction({targetElement: event.currentTarget});
    }
  })

  // <radio> AND <select>
  $.on("change", "[type='radio'][data-i], select[data-i]", function (event) {
    // get key name and value we want to change
    let camelCaseKeyName = event.currentTarget.getAttribute("name");
    let attributeValue = event.currentTarget.value;

    // set value
    setValueOfClosestKey({elem: event.currentTarget, camelCaseKeyName, attributeValue});

    if (event.currentTarget.getAttribute("data-i") === "triggerSaveOnChange") {
      callSaveFunction({targetElement: event.currentTarget});
    }
  });


  // <checkbox>
  $.on("change", "[data-i][type='checkbox']", function (event) {
    // get key name and value we want to change
    let camelCaseKeyName = event.currentTarget.getAttribute("name");
    let attributeValue = event.currentTarget.checked ? event.currentTarget.value : "";

    // set value
    setValueOfClosestKey({elem: event.currentTarget, camelCaseKeyName, attributeValue});

    if (event.currentTarget.getAttribute("data-i") === "triggerSaveOnChange") {
      callSaveFunction({targetElement: event.currentTarget});
    }
  });

}








