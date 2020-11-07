import { $ } from '../queryjs';
import { callSaveFunctionNextTick } from './onSave';
import { syncDataNextTick } from "./syncData";
import { setAllDataToEmptyStringsExceptIds, getKeyNamesFromElem } from "../data-utilities";

export function initRemoveAndHideEventListeners () {

  // useful for permanently removing items, especially from a list of similar items
  $.on("click", "[remove]", function (event) {

    if (event.target.closest("[disable-events]")) {
      return;
    }

    // 1. find the nearest ancestor element that has the attribute `sync`
    let syncElement = event.currentTarget.closest("[sync]");

    // 2. get the closest element with data on it
    let sourceElement;
    if (syncElement) {
      // handle the case where we're in an editable popover
      sourceElement = $.data(syncElement, "source");
    } else {
      // handle the case where we're clicking a "remove" button on the page (not in a popover)
      sourceElement = event.currentTarget;
    }

    let elemWithData = sourceElement.closest("[object]");

    // 3. get parent element (because we can't call the save function on an elem that doesn't exist)
    let parentElement = elemWithData.parentElement;

    // 4. remove the data element
    elemWithData.remove();

    // calling this on next tick gives other click events on this element that
    // might set data time to fire before the data is saved
    callSaveFunctionNextTick({targetElem: parentElement});

  });

  // useful for hiding items the user doesn't want visible, but allowing them to add them back later
  $.on("click", "[erase]", function (event) {

    if (event.target.closest("[disable-events]")) {
      return;
    }

    // 1. find the nearest ancestor element that has the attribute `sync`
    let syncElement = event.currentTarget.closest("[sync]");

    if (syncElement) {
      // handle the case where we're in an editable popover

      // look through the data keys and set ALL their values to empty strings
      setAllDataToEmptyStringsExceptIds(syncElement);

      // save all the data back into the actual page as empty strings (could probably do this sync with a secondary submit button instead of manually calling syncData)
      syncDataNextTick({
        sourceElement: syncElement,
        targetElement: $.data(syncElement, "source"),
        keyNames: getKeyNamesFromElem(syncElement)
      });
    } else {
      // handle the case where we're clicking a "remove(ERASE)" button on the page (not in a popover)
      
      // look through the data keys and set ALL their values to empty strings
      let elemWithData = event.currentTarget.closest("[object]");

      // this will trigger a save
      setAllDataToEmptyStringsExceptIds(elemWithData);
    }

  });

}




