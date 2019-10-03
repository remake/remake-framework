import { set, isPlainObject } from 'lodash-es';
import forEachDeep from "deepdash-es/forEachDeep";
import getUniqueId from "../lib/get-unique-id";
import { setUserData } from "../lib/user-data";

export async function processData ({res, pageAuthor, data, itemId, requestType}) {
  let itemData, itemDataError;

  if (pageAuthor) {
    // add unique ids to data & get currentItem and parentItem
    [itemData, itemDataError] = await capture(addIdsAndGetItemData({data, user: pageAuthor, itemId}));

    if (itemDataError) {
      if (requestType === "ajax") {
        res.json({success: false, reason: "addingUniqueIds"});
      } else {
        res.status(500).send("500 Server Error");
      }
      return;
    }
  }

  if (itemId && !itemData.currentItem) {
    if (requestType === "ajax") {
      res.json({success: false, reason: "noCurrentItem"});
    } else {
      res.status(404).send("404 Not Found");
    }
    return;
  }

  return itemData;
}

async function addIdsAndGetItemData ({data, user, itemId}) {
  let currentItem;
  let parentItem;
  let someUniqueIdsAdded = false;

  forEachDeep(data, function (value, key, parentValue, context) {

    if (isPlainObject(value)) {

      // if an :id is specified in the route, get the data for it (currentItem and its parentItem)
      if (itemId && itemId === value.id) {
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

      // generate unique ids for every object item
      if (!value.id) {
        value.id = getUniqueId();
        someUniqueIdsAdded = true;
      }

    }

  });

  // save the data if some new ids have been added to it
  if (someUniqueIdsAdded) {
    // let higher-level functions capture this if it errors
    await setUserData({username: user.details.username, data, type: "appData"});
  }

  return { currentItem, parentItem };
}


