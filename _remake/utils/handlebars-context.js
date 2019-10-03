const Handlebars = require('handlebars');

let contextLookup = {};
export function getHandlebarsContext ({appName, regenerate}) {
  let cachedContext = contextLookup[appName];

  if (regenerate || !cachedContext) {
    contextLookup[appName] = Handlebars.create();
    return contextLookup[appName];
  } else {
    return cachedContext;
  }
}



