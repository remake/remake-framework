import { createDataObjectFromElement, addDataFromElementToDataObject } from "./getSaveDataHelpers";

// special properties:
// * object (converts element into a nested JSON object)
// * array (converts element into a nested JSON array)
// * key (for nesting objects and arrays inside each other under a label)
// * key:example-key-name (for storing single pieces of data from the page as strings inside objects)

export function getSaveData(rootNode) {
  let rootData;

  function getDataFromDom(currentElement, parentData) {
    // can this element's data be parsed?
    let canElementDataBeParsed =
      currentElement.hasAttribute("object") || currentElement.hasAttribute("array");

    // should we skip this element?
    let skipElemAndChildren = currentElement.hasAttribute("ignore-data");

    if (skipElemAndChildren) {
      return;
    }

    // if element's data can be parsed, add its data to the current tree of data
    // otherwise, skip it
    if (canElementDataBeParsed) {
      // if there's parent data, add the element's data to it
      // and re-assign parentData to this new iteration's data
      if (parentData) {
        parentData = addDataFromElementToDataObject(currentElement, parentData);
      }

      // if there's no parent data, create new parent data
      if (!parentData && !rootData) {
        // create new parent and root data
        [parentData, rootData] = createDataObjectFromElement(currentElement);
      } else if (!parentData && rootData) {
        // special orphaned data case:
        //   instead of letting orphan data (i.e. two or more objects that don't share
        //   a single parent) overwrite the root data, merge it in with the current root data
        parentData = addDataFromElementToDataObject(currentElement, rootData);
      }
    }

    // pass all the collected data to the next iteration
    let children = currentElement.children;
    for (var i = 0; i < children.length; i++) {
      getDataFromDom(children[i], parentData);
    }

    // after all the iterations, the original data should have all the parsed data from the DOM
    return rootData;
  }

  return getDataFromDom(rootNode);
}
