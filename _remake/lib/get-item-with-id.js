import lodash from 'lodash';
import deepdash from 'deepdash';

const _ = deepdash(lodash);

export function getItemWithId(data, id) {
  let currentItem;

  _.forEachDeep(data, function (value, key, parentValue, context) {
    // get the data for the id in the route param if there is one
    if (_.isPlainObject(value) && value.id && value.id === id) {
      currentItem = value;
    }
  });

  return currentItem;
}
