const Handlebars = require("handlebars");
import RemakeStore from "../lib/remake-store";
import { initHandlebarsHelpers } from "./init-handlebars-helpers";

// available for if we ever need to use
// more than one context with Handlebars.create()
export function getHandlebarsContext({ appName, regenerate }) {
  initHandlebarsHelpers({ Handlebars });

  return Handlebars;
}
