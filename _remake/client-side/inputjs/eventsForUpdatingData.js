import { onAttributeEvent } from "../hummingbird/lib/dom";
import { handleUpload } from "./fileUpload";
import { getValueForClosestKey, setValueForClosestKey } from "../data-utilities";

export default function () {
  /* 
    Support for the "update:" attribute for these elements:
    - buttons
    - input[type="radio"]
    - input[type="checkbox"]
    - select

    Notes:
    - These elements might be on the page OR inside an inline edit popover

    For example:

    <div object key:example-key>
      <button update:example-key="example value"></button>
    </div>

    <div object key:example-key="dog">
      <input type="radio" update:example-key value="dog" checked></input>
      <input type="radio" update:example-key value="cat"></input>
      <input type="radio" update:example-key value="bunny"></input>
    </div>

    <div object key:example-key="">
      <input type="checkbox" update:example-key value="example value"></input>
    </div>

    <div object key:example-key="dog">
      <select>
        <option update:example-key value="dog" checked>dog</option>
        <option update:example-key value="cat">cat</option>
        <option update:example-key value="bunny">bunny</option>
      </select>
    </div>
  */
  onAttributeEvent({
    eventTypes: ["input", "click", "change"],
    partialAttributeStrings: ["update:"],
    filterOutElemsInsideAncestor: "[disable-events]",
    callback: ({
      eventType,
      matchingElement,
      matchingAttribute,
      matchingPartialAttributeString,
    }) => {
      let keyName = matchingAttribute.substring(matchingPartialAttributeString.length);
      let nodeName = matchingElement.nodeName && matchingElement.nodeName.toLowerCase();
      let inputType = matchingElement.type ? matchingElement.type.toLowerCase() : "";
      let elem = matchingElement;
      let value = null;

      // textarea and input[type='text']
      if (eventType === "input") {
        if (
          nodeName === "textarea" ||
          inputType === "text" ||
          inputType === "color" ||
          inputType === ""
        ) {
          value = matchingElement.value;
          setValueForClosestKey({ elem, keyName, value });
        }
      }

      // checkbox, radio, select, file upload
      if (eventType === "change") {
        // checkbox
        if (inputType === "checkbox") {
          value = matchingElement.checked ? true : false;
        }

        // radio, select
        if (inputType === "radio" || nodeName === "select") {
          value = matchingElement.value;
        }

        // file upload
        if (inputType === "file") {
          handleUpload({ elem: matchingElement, keyName });
        }
      }

      // click a normal element to set a value, e.g. <div update:example-key="example-value"></div>
      if (eventType === "click" && !matchingElement.closest("input, textarea, select")) {
        value = matchingElement.getAttribute(matchingAttribute);
      }

      if (value !== null) {
        setValueForClosestKey({ elem: matchingElement, keyName, value });
      }
    },
  });

  /* 
    For example:
    <div object key:example-key="on">
      <button toggle:example-key></button>
    </div>
  */
  onAttributeEvent({
    eventTypes: ["click"],
    partialAttributeStrings: ["toggle:"],
    filterOutElemsInsideAncestor: "[disable-events]",
    callback: ({ matchingElement, matchingAttribute, matchingPartialAttributeString }) => {
      let keyName = matchingAttribute.substring(matchingPartialAttributeString.length);
      let currentValue = getValueForClosestKey({ elem: matchingElement, keyName }) || "";
      if (currentValue.toLowerCase() !== "true") {
        setValueForClosestKey({ elem: matchingElement, keyName, value: true });
      } else {
        setValueForClosestKey({ elem: matchingElement, keyName, value: false });
      }
    },
  });
}
