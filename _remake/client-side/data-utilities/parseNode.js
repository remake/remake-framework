import { getDataFromNode } from './getDataFromNode';

// example return value:
// {elemType: "object", key: "profileInfo", value: {name: "Kate"}}
export function parseNode (elem) { 
  let elemType = elem.getAttribute("data-o-type"); // elemType can be `object` or `list`

  return {
    elemType: elemType,
    key: elem.getAttribute("data-o-key"),
    value: elemType === "list" ? [] : getDataFromNode(elem)
  };
}