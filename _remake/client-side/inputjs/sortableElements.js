import optionsData from './optionsData';
import { callSaveFunction } from './onSave';

export default function initSortableElements () {
  let {sortablejs, selectors} = optionsData.sortable;

  // make all elements that match the selectors sortable on page load
  makeSortable({selectors, elemToSearch: document});

  // after a new element is added to the page, make all 
  // elements INSIDE it that match the selectors sortable
  let addItemCallbackTemp = optionsData.addItemCallback;
  optionsData.addItemCallback = function (options) {
    let {itemElem} = options;
    makeSortable({selectors, elemToSearch: itemElem});
    addItemCallbackTemp(options);
  }

  // util function used by both cases above
  function makeSortable ({selectors, elemToSearch}) {
    selectors.forEach(selector => {  
      let sortableListElems = elemToSearch.querySelectorAll(selector);
      Array.from(sortableListElems).forEach(sortableListElem => {
        sortablejs.create(sortableListElem, {
          group: selector,
          onEnd: function (event) {
            callSaveFunction({targetElement: sortableListElem})
          }
        });
      });
    });
  }
}
