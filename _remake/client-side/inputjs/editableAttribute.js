import { $ } from '../queryjs';
import { camelCaseToDash } from '../hummingbird/lib/string';
import { forEachAttr } from '../hummingbird/lib/dom';
import { processAttributeString } from '../parse-data-attributes';
import { copyLayout } from '../copy-layout';
import Switches from '../switchjs';
import { getDataFromNode } from '../data-utilities';
import autosize from '../vendor/autosize';

// data-i-editable: trigger popover with three buttons (remove, cancel, and save)
// data-i-editable-without-remove: trigger popover with two buttons (cancel and save)
// data-i-editable-with-hide: trigger popover with three buttons (remove, cancel, and save), 
//                            but the remove button is special: it doesn't remove an element, 
//                            it just sets all its data keys to empty strings
export default function () {
  $.on("click", "[data-i-editable], [data-i-editable-without-remove], [data-i-editable-with-hide]", function (event) {
    let editableTriggerElem = event.currentTarget;
    let [ switchName, editableConfigString ] = getEditableInfo(editableTriggerElem);
    let editablePopoverElem = document.querySelector(".remake-edit");
    let editableConfigArr;

    if (editableConfigString) {
      // "profileName(text-single-line: someOption)" => [{name: "profileName", modifier: "text-single-line", args: ["someOption"]}]
      editableConfigArr = processAttributeString(editableConfigString); 
      
      editableConfigArr.forEach(editableConfig => {
        if (!editableConfig.modifier) {
          editableConfig.modifier = "text-single-line"
        }
      });
    } else {
      // auto-generate the editable config if none is present
      //   note: we strip out the id key because it's not editable
      editableConfigArr = generateEditableConfigFromClosestElemWithData(editableTriggerElem);
    }

    // remove old output key attributes
    removeOutputDataAttributes({
      elem: editablePopoverElem,
      keep: []
    });

    // add output key attributes defined in the editable config
    addDataOutputKeys({
      elem: editablePopoverElem, 
      config: editableConfigArr
    });

    // add form field types to single attribute from editable config
    addFormFieldsBeingEdited({
      elem: editablePopoverElem, 
      config: editableConfigArr
    });
    
    // render html inside the edit popover
    let remakeEditAreasElem = editablePopoverElem.querySelector(".remake-edit__edit-areas");
    remakeEditAreasElem.innerHTML = generateRemakeEditAreas({config: editableConfigArr});

    // copy the layout
    copyLayout({
      sourceElem: editableTriggerElem, 
      targetElem: editablePopoverElem, 
      dimensionsName: "width", 
      xOffset: 0, 
      yOffset: 0
    });

    // trigger the switch on
    let switchObj = {name: switchName, elem: editablePopoverElem};
    let actionObj = {name: switchName, elem: editableTriggerElem, type: "on"};
    Switches.turnOn(switchObj, actionObj);

    // autosize textarea
    let textareaElems = Array.from(remakeEditAreasElem.querySelectorAll("textarea"));
    setTimeout(function () {
      textareaElems.forEach(el => autosize(el));
    });

    // focus input
    let firstFormInput = editablePopoverElem.querySelector("textarea, input")
    if (firstFormInput) {
      firstFormInput.focus();
    }
  });

  $.on("click", ".remake-edit__button:not([type='submit'])", function (event) {
    event.preventDefault();
  });

  document.addEventListener("keydown", event => {
    if (event.keyCode === 27) {
      let turnedOnEditablePopovers = Array.from(document.querySelectorAll("[data-switched-on='remakeEdit'], [data-switched-on='remakeEditWithoutRemove'], [data-switched-on='remakeEditWithHide']"));
      
      if (turnedOnEditablePopovers.length > 0) {
        turnedOnEditablePopovers.forEach(el => {
          Switches.turnOff({name: "remakeEdit", elem: el});
          Switches.turnOff({name: "remakeEditWithoutRemove", elem: el});
          Switches.turnOff({name: "remakeEditWithHide", elem: el});
        });
      }
    }
  });
}

function getEditableInfo (elem) {
  if (elem.hasAttribute("data-i-editable")) {
    return [ "remakeEdit", elem.getAttribute("data-i-editable") ];
  } else if (elem.hasAttribute("data-i-editable-without-remove")) {
    return [ "remakeEditWithoutRemove", elem.getAttribute("data-i-editable-without-remove") ];
  } else if (elem.hasAttribute("data-i-editable-with-hide")) {
    return [ "remakeEditWithHide", elem.getAttribute("data-i-editable-with-hide") ];
  }
}

function removeOutputDataAttributes({elem, keep}) {
  let attributesToRemove = [];

  forEachAttr(elem, function (attrName, attrValue) {
    if (attrName.startsWith("data-o-key-")) {
      if (!keep.includes(attrName)) {
        attributesToRemove.push(attrName);
      }
    }
  });

  attributesToRemove.forEach(attrName => elem.removeAttribute(attrName));
}

function addDataOutputKeys ({elem, config}) {
  config.forEach(obj => {
    elem.setAttribute("data-o-key-" + camelCaseToDash(obj.name), "")
  });
}

function addFormFieldsBeingEdited ({elem, config}) {
  let attrValue = config.map(obj => obj.modifier).join(" ");
  elem.setAttribute("data-remake-edit-fields", attrValue)
}

function generateRemakeEditAreas ({config}) { // e.g. {name: "blogTitle", modifier: "text-single-line", args: []}
  let outputHtml = "";

  config.forEach(({modifier, name}) => {
    let formFieldHtml;

    if (modifier === "text-single-line") {
      formFieldHtml = `<input class="remake-edit__input" data-i="dontTriggerSaveOnChange" name="${name}" type="text">`;
    }

    if (modifier === "text-multi-line") {
      formFieldHtml = `<textarea class="remake-edit__textarea" data-i="dontTriggerSaveOnChange" name="${name}"></textarea>`;
    }

    outputHtml += `<div class="remake-edit__edit-area">${formFieldHtml}</div>`;
  });

  return outputHtml;
}

// example output: [{name: "text", modifier: "text-single-line", args: []}]
function generateEditableConfigFromClosestElemWithData (elem) {
  let elemWithData = elem.closest("[data-o-type]");

  if (!elemWithData) {
    return;
  }

  let dataFromElem = getDataFromNode(elemWithData);
  let objectKeys = Object.keys(dataFromElem);
  // strip out the id key because it's not editable
  let objectKeysWithoutIdKey = objectKeys.filter(keyName => keyName !== "id");

  return objectKeysWithoutIdKey.map(keyName => {
    return {name: keyName, modifier: "text-single-line"}
  });
}






