const Handlebars = require('handlebars');
import RemakeStore from "../lib/remake-store";
import { initCustomHandlebarsHelpers } from "./init-custom-handlebars-helpers";

// available for if we ever need to use 
// more than one context with Handlebars.create()
export function getHandlebarsContext ({appName, regenerate}) {
  initCustomHandlebarsHelpers({Handlebars});

  return Handlebars;
}



