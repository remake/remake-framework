import { set, isPlainObject } from 'lodash-es';
import forEachDeep from "deepdash-es/forEachDeep";
import getUniqueId from "./get-unique-id";
import { setUserData } from "./user-data";

export async function preProcessData ({data, user, params}) {
  let currentItem;
  let parentItem;
  let someUniqueIdsAdded = false;

  forEachDeep(data, function (value, key, parentValue, context) {

    if (isPlainObject(value)) {

      // generate unique ids for every object item
      if (!value.id) {
        value.id = getUniqueId();
        someUniqueIdsAdded = true;
      }

      // get the data for the id in the route param if there is one
      if (params.id && value.id === params.id) {
        currentItem = value;

        // loop through all parent items (objects & arrays)
        for (let i = context.parents.length - 1; i > -1; i--) {
          let currentParent = context.parents[i].value;

          // the first plain object found in parent items is parentItem
          if (isPlainObject(currentParent)) {
            parentItem = currentParent;
            break;
          }
        }
      }

    }

  });

  // save the data if some new ids have been added to it
  if (someUniqueIdsAdded) {
    let updateResult = await setUserData({username: user.details.username, data, type: "appData"});
  }

  return { currentItem, parentItem };
}


