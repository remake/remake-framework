import { $ } from '../queryjs';
import { callSaveFunctionNextTick } from './onSave';

export default function () {
  $.on("click", "[save]", function (event) {
    let clickedElem = event.currentTarget;

    if (clickedElem.closest("[disable-events]")) {
      return;
    }

    // calling this on next tick gives other click events on this element that
    // might set data time to fire before the data is saved
    callSaveFunctionNextTick(clickedElem);
  });
}