import { forEachAttr } from "../hummingbird/lib/dom";
import { getValueForKeyName } from "../data-utilities";
const camelCase = require("lodash/camelCase");

export function createDataObjectFromElement(elem) {
  let nodeData = parseNodeForSave(elem);

  if (nodeData.key) {
    let innerData = nodeData.value;
    let outerData = {};
    outerData[nodeData.key] = innerData;

    return [innerData, outerData];
  } else {
    return [nodeData.value, nodeData.value];
  }
}

export function addDataFromElementToDataObject(elem, parentData) {
  let isParentDataAnObject = !Array.isArray(parentData);
  let nodeData = parseNodeForSave(elem);

  if (isParentDataAnObject) {
    if (nodeData.key) {
      parentData[nodeData.key] = nodeData.value;
      return nodeData.value;
    } else {
      Object.assign(parentData, nodeData.value);
      return parentData;
    }
  } else {
    if (nodeData.key) {
      let wrapperObj = {};
      wrapperObj[nodeData.key] = nodeData.value;
      parentData.push(wrapperObj);
      return nodeData.value;
    } else {
      parentData.push(nodeData.value);
      return nodeData.value;
    }
  }
}

// example return value:
// {key: "profileInfo", value: {name: "Kate"}}
function parseNodeForSave(elem) {
  return {
    key: elem.getAttribute("key"),
    value: elem.hasAttribute("array") ? [] : getSaveDataFromElement(elem),
  };
}

// Only get saveable data (i.e. no temporary keys/values)
// E.g.
// Converts this element:
// <div object key:example-one="1" key:example-two="2"></div>
// Into:
// {exampleOne: "1", exampleTwo: "2"}
function getSaveDataFromElement(elem) {
  let keyPrefix = "key:";
  let data = {};

  forEachAttr(elem, attrName => {
    if (attrName.indexOf(keyPrefix) === 0) {
      let keyName = attrName.substring(keyPrefix.length);
      let camelCaseKeyName = camelCase(keyName);
      data[camelCaseKeyName] = getValueForKeyName({ elem, keyName });
    }
  });

  return data;
}
