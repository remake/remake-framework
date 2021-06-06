import lodash from 'lodash';
import deepdash from 'deepdash';
import { capture } from "./async-utils";
import { getUniqueId } from "../lib/get-unique-id";
import { setUserData } from "../lib/user-data";

const _ = deepdash(lodash);

export async function processData({ appName, res, pageAuthor, data, itemId, requestType }) {
  let itemData = { currentItem: undefined, parentItem: undefined };
  let itemDataError;

  if (pageAuthor) {
    // add unique ids to data & get currentItem and parentItem
    [itemData, itemDataError] = await capture(
      addIdsAndGetItemData({ appName, data, user: pageAuthor, itemId })
    );

    if (itemDataError) {
      if (requestType === "ajax") {
        res.json({ success: false, reason: "addingUniqueIds" });
      } else {
        res.status(500).send("500 Server Error");
      }
      return;
    }
  }

  if (itemId && !itemData.currentItem) {
    if (requestType === "ajax") {
      res.json({ success: false, reason: "noCurrentItem" });
    } else {
      res.status(404).send("404 Not Found");
    }
    return;
  }

  return itemData;
}

async function addIdsAndGetItemData({ appName, data, user, itemId }) {
  let currentItem;
  let parentItem;
  let someUniqueIdsAdded = false;

  _.forEachDeep(data, function (value, key, parentValue, context) {
    if (_.isPlainObject(value)) {
      // if an :id is specified in the route, get the data for it (currentItem and its parentItem)
      if (itemId && itemId === value.id) {
        currentItem = value;

        // loop through all parent items (objects & arrays)
        for (let i = context.parents.length - 1; i > -1; i--) {
          let currentParent = context.parents[i].value;

          // the first plain object found in parent items is parentItem
          if (_.isPlainObject(currentParent)) {
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
    await setUserData({ appName, username: user.details.username, data, type: "appData" });
  }

  return { currentItem, parentItem };
}
