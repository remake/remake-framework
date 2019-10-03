const Handlebars = require('handlebars');
import RemakeStore from "../lib/remake-store";
const isMultiTenant = RemakeStore.isMultiTenant();

let contextLookup = {};
export function getHandlebarsContext ({appName, regenerate}) {
  if (!isMultiTenant) {
    appName = "singleApp";
  }

  let cachedContext = contextLookup[appName];

  if (regenerate || !cachedContext) {
    contextLookup[appName] = Handlebars.create();
    return contextLookup[appName];
  } else {
    return cachedContext;
  }
}



