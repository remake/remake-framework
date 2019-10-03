const Handlebars = require('handlebars');
import RemakeStore from "../lib/remake-store";

let contextLookup = {};
export function getHandlebarsContext ({appName, regenerate}) {
  if (!RemakeStore.isMultiTenant()) {
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



