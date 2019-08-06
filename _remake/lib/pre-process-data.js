import { set, isPlainObject } from 'lodash-es';
import forEachDeep from "deepdash-es/forEachDeep";
import getUniqueId from "./get-unique-id";

export async function preProcessData ({data, user, params, appName}) {
  let someUniqueIdsAdded = false;
  let currentItem;
  let parentItem;

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

        for (let i = context.parents.length - 1; i > -1; i--) {
          let currentParent = context.parents[i].value;

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
    let updateCommand = {$set: {}};
    updateCommand["$set"][`appData.${appName}`] = JSON.stringify(data);

    let updateResult = await usersCollection.updateOne(
      { "_id" : user._id },
      updateCommand
    );
  }

  return { currentItem, parentItem };
}


