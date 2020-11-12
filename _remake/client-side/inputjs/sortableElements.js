import optionsData from './optionsData';
import { onAddItem } from './callbacks';
import { callSaveFunction } from './onSave';

export default function initSortableElements () {
  let {sortablejs} = optionsData.sortable;

  // make all elements that match the selectors sortable on page load
  makeSortable({elemToSearch: document});

  // when a new item is added to the page, make it sortable if it has the "sortable" attribute
  onAddItem(function ({success, listElem, itemElem, templateName, ajaxResponse}) {
    if (success) {
      makeSortable({elemToSearch: itemElem});
    }
  });

  function makeSortable ({elemToSearch}) {
    let sortableElems = Array.from(elemToSearch.querySelectorAll("[sortable]"));
    sortableElems.forEach(sortableListElem => {
      sortablejs.create(sortableListElem, {
        group: sortableListElem.getAttribute("sortable") || getRandomId(),
        onEnd: function (event) {
          callSaveFunction(sortableListElem)
        }
      });
    });
  }
}


function getRandomId () {
  return "sortable-" + Math.random().toString().substring(2);
}