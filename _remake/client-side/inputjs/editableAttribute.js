import { on, off, fire } from "../vendor/delegated-events";
import { $ } from "../queryjs";
import { forEachAttr, onAttributeEvent } from "../hummingbird/lib/dom";
import { copyLayout } from "../copy-layout";
import { getClosestElemWithKey, setValueForKeyName, getKeyNamesFromElem } from "../data-utilities";
import { syncDataNextTick } from "./syncData";
import { showError } from "../common/show-error";
import autosize from "../vendor/autosize";

// matches: [{eventType, matchingElement, matchingAttribute, matchingPartialAttributeString}]
export function openEditCallback(matches) {
  // editableConfig: [{keyName, formType, removeOption, eventType, matchingElement, matchingAttribute, matchingPartialAttributeString}]
  let editableConfig = matches.map(
    ({ eventType, matchingElement, matchingAttribute, matchingPartialAttributeString }) => {
      let attributeParts = matchingAttribute.split(":");
      // attributeParts could be:
      // ["edit", "example-key"]
      // ["edit", "example-key", "without-remove"]
      // ["edit", "example-key", "textarea", "without-remove"]
      // -> first two items are requireed, the last two are optional
      let [_, keyName, ...otherOptions] = attributeParts;

      let validRemoveOptions = ["with-remove", "without-remove", "with-erase"];
      let validFormTypes = ["text", "textarea"];

      // if `otherOptions` includes includes a valid remove option, use that. Otherwise, use default value.
      let removeOption =
        validRemoveOptions.find(str => otherOptions.includes(str)) || "with-remove";
      // if `otherOptions` includes includes a valid form type option, use that. Otherwise, use default value.
      let formType = validFormTypes.find(str => otherOptions.includes(str)) || "text";

      return {
        keyName,
        formType,
        removeOption,
        eventType,
        matchingElement,
        matchingAttribute,
        matchingPartialAttributeString,
      };
    }
  );

  // get first matching element for positioning popover
  let firstMatch = editableConfig[0];
  let firstMatchElem = firstMatch.matchingElement;
  let firstMatchKeyName = firstMatch.keyName;
  let firstMatchRemoveOption = firstMatch.removeOption;
  let firstMatchTargetElem = getClosestElemWithKey({
    elem: firstMatchElem,
    keyName: firstMatchKeyName,
  });

  if (!firstMatchElem || !firstMatchKeyName || !firstMatchTargetElem) {
    showError(
      `Problem with the 'edit:' attribute on one of these elements:`,
      matches.map(m => m.matchingElement)
    );
    return;
  }

  let editablePopoverElem = document.querySelector(".remake-edit");

  // reset popover: remove old keys
  removeObjectKeysFromElem({ elem: editablePopoverElem });

  // open popover
  let hasRemove = firstMatchRemoveOption === "with-remove";
  let hasErase = firstMatchRemoveOption === "with-erase";
  editablePopoverElem.setAttribute(`temporary:key:remake-edit-popover`, "");
  editablePopoverElem.setAttribute(`temporary:key:remake-edit-option-has-remove`, "");
  editablePopoverElem.setAttribute(`temporary:key:remake-edit-option-has-erase`, "");
  setValueForKeyName({ elem: editablePopoverElem, keyName: "remake-edit-popover", value: "on" });
  setValueForKeyName({
    elem: editablePopoverElem,
    keyName: "remake-edit-option-has-remove",
    value: hasRemove ? "on" : "off",
  });
  setValueForKeyName({
    elem: editablePopoverElem,
    keyName: "remake-edit-option-has-erase",
    value: hasErase ? "on" : "off",
  });

  // keep track of the source of the data on the popover element
  $.data(editablePopoverElem, "source", firstMatchTargetElem);

  // add object keys for storing data that's being edited in the popover
  addObjectKeysToElem({ elem: editablePopoverElem, config: editableConfig });

  // sync data from the page into the popover
  syncDataNextTick({
    sourceElement: firstMatchElem,
    targetElement: editablePopoverElem,
    keyNames: editableConfig.map(obj => obj.keyName),
    shouldSyncIntoUpdateElems: true,
  });

  // render html inside the edit popover
  let remakeEditAreasElem = editablePopoverElem.querySelector(".remake-edit__edit-areas");
  remakeEditAreasElem.innerHTML = generateRemakeEditAreas({ config: editableConfig });

  // copy the layout
  copyLayout({
    sourceElem: firstMatchElem,
    targetElem: editablePopoverElem,
    dimensionsName: "width",
    xOffset: 0,
    yOffset: 0,
  });

  // autosize textareas -- not sure why or even if this needs to be in a setTimeout
  setTimeout(function () {
    let textareas = Array.from(editablePopoverElem.querySelectorAll("textarea"));
    textareas.forEach(el => autosize(el));
  });

  // focus first focusable element
  let firstFormInput = editablePopoverElem.querySelector("textarea, input");
  if (firstFormInput) {
    firstFormInput.focus();
  }
}

// USAGE EXAMPLES:
// edit:example-key
// edit:example-key:text
// edit:example-key:textarea
export default function () {
  onAttributeEvent({
    eventTypes: ["click"],
    partialAttributeStrings: ["edit:"],
    groupMatchesIntoSingleCallback: true,
    filterOutElemsInsideAncestor: "[disable-events]",
    callback: openEditCallback,
  });

  // sync data from popover into the page
  on("submit", "[sync]", event => {
    event.preventDefault();
    let syncElement = event.currentTarget.closest("[sync]");
    syncDataNextTick({
      sourceElement: syncElement,
      targetElement: $.data(syncElement, "source"),
      keyNames: getKeyNamesFromElem(syncElement),
    });
  });

  // this was causing a bug before. i think the form was submitting when it shouldn't have.
  on("click", ".remake-edit__button:not([type='submit'])", function (event) {
    event.preventDefault();
  });

  document.addEventListener("keydown", event => {
    // esc key
    if (event.keyCode === 27) {
      let turnedOnEditablePopover = document.querySelector('[key:remake-edit-popover="on"]');

      if (turnedOnEditablePopover) {
        setValueForKeyName({
          elem: turnedOnEditablePopover,
          keyName: "remake-edit-popover",
          value: "off",
        });
      }
    }
  });
}

function removeObjectKeysFromElem({ elem }) {
  let attributesToRemove = [];
  forEachAttr(elem, (attrName, attrValue) => {
    if (attrName.startsWith("key:") || attrName.startsWith("temporary:key:")) {
      attributesToRemove.push(attrName);
    }
  });
  // this is outside the loop because you can't remove items from an array when you're looping through it
  attributesToRemove.forEach(attrName => elem.removeAttribute(attrName));
}

// config: [{keyName, formType, removeOption, eventType, matchingElement, matchingAttribute, matchingPartialAttributeString}]
function addObjectKeysToElem({ elem, config }) {
  config.forEach(obj => {
    elem.setAttribute(`temporary:key:${obj.keyName}`, "");
  });
}

// config: [{keyName, formType, removeOption, eventType, matchingElement, matchingAttribute, matchingPartialAttributeString}]
function generateRemakeEditAreas({ config }) {
  let outputHtml = "";

  // formType can be "text" or "textarea" or something else that's not implemented yet
  config.forEach(({ formType, keyName }) => {
    let formFieldHtml;

    if (formType === "text") {
      formFieldHtml = `<input class="remake-edit__input" update:${keyName} type="text">`;
    }

    if (formType === "textarea") {
      formFieldHtml = `<textarea class="remake-edit__textarea" update:${keyName}></textarea>`;
    }

    outputHtml += `<div class="remake-edit__edit-area">${formFieldHtml}</div>`;
  });

  return outputHtml;
}
