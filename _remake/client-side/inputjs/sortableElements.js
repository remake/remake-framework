import optionsData from "./optionsData";
import { onAddItem } from "./callbacks";
import { callSaveFunction } from "./onSave";

export default function initSortableElements() {
  // make all elements with the "sortable" attribute drag-and-drop sortable on page load
  makeSortable({ elemToSearch: document });

  // if Remake has already been initialized, don't initialize this event listener again
  if (!optionsData.alreadyInitialized) {
    // when a new item is added to the page, make it sortable if it has the "sortable" attribute
    onAddItem(function ({ success, listElem, itemElem, templateName, ajaxResponse }) {
      if (success) {
        makeSortable({ elemToSearch: itemElem });
      }
    });
  }
}

function makeSortable({ elemToSearch }) {
  const { sortablejs } = optionsData.sortable;
  let sortableElems = Array.from(elemToSearch.querySelectorAll("[sortable]"));

  sortableElems.forEach(sortableListElem => {
    if (sortableListElem.closest("[disable-events]")) {
      return;
    }

    // Check if there's already a Sortable instance on an element 
    // (this get method is part of Sortable's built-in API)
    if (sortablejs.get(sortableListElem)) {
      return;
    }


    let sortableOptions = {
      onEnd: function (event) {
        callSaveFunction(sortableListElem);
      },
    };

    let sortableGroupName = sortableListElem.getAttribute("sortable");
    if (sortableGroupName) {
      sortableOptions.group = sortableGroupName;
    }

    if (sortableListElem.querySelector("[sortable-handle]")) {
      sortableOptions.handle = "[sortable-handle]";
    }

    sortablejs.create(sortableListElem, sortableOptions);
  });
}


