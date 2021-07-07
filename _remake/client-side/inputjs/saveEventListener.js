import { on, off, fire } from "../vendor/delegated-events";
import { $ } from "../queryjs";
import { getParents } from "../hummingbird/lib/dom";
import { callWatchFunctionsOnElements } from "../data-utilities";
import { callSaveFunctionNextTick } from "./onSave";

export default function () {
  on("click", "[save]", function (event) {
    let elem = event.currentTarget;

    if (elem.closest("[disable-events]")) {
      return;
    }

    // call watch functions
    let parents = getParents({ elem, includeCurrentElement: true });
    callWatchFunctionsOnElements(parents);

    // calling this on next tick gives watch functions or other click events
    // on this element a chance to set data before the data is saved
    callSaveFunctionNextTick(elem);
  });

  on("input", "[save]", function (event) {
    let elem = event.currentTarget;

    if (elem.closest("[disable-events]")) {
      return;
    }

    // call watch functions
    let parents = getParents({ elem, includeCurrentElement: true });
    callWatchFunctionsOnElements(parents);

    // calling this on next tick gives watch functions or other click events
    // on this element a chance to set data before the data is saved
    callSaveFunctionNextTick(elem);
  });
}
