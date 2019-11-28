import optionsData from './optionsData';
import { callSaveFunction } from './onSave';

export default function initSortableElements () {
  let {sortablejs} = optionsData.sortable;

  // make all elements that match the selectors sortable on page load
  makeSortable({elemToSearch: document});

  // after a new element is added to the page, make it sortable
  let addItemCallbackTemp = optionsData.addItemCallback;
  optionsData.addItemCallback = function (options) {
    let {itemElem} = options;
    makeSortable({elemToSearch: itemElem});
    addItemCallbackTemp(options);
  }

  function makeSortable ({elemToSearch}) {
    let sortableElems = Array.from(elemToSearch.querySelectorAll("[data-i-sortable]"));
    sortableElems.forEach(sortableListElem => {
      sortablejs.create(sortableListElem, {
        group: sortableListElem.getAttribute("data-i-sortable") || getRandomId(),
        onEnd: function (event) {
          callSaveFunction({targetElement: sortableListElem})
        }
      });
    });
  }
}


function getRandomId () {
  return "sortable-" + Math.floor(Math.random() * 10000000000);
}