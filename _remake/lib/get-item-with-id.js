const _ = require("lodash");
import forEachDeep from "deepdash-es/forEachDeep";

export function getItemWithId(data, id) {
  let currentItem;

  forEachDeep(data, function (value, key, parentValue, context) {
    // get the data for the id in the route param if there is one
    if (_.isPlainObject(value) && value.id && value.id === id) {
      currentItem = value;
    }
  });

  return currentItem;
}
