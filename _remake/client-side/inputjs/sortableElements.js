import optionsData from './optionsData';
import { callSaveFunction } from './onSave';

export default function initSortableElements () {
  let {sortablejs, selectors} = optionsData.sortable;

  selectors.forEach(selector => {  
    let sortableListElems = document.querySelectorAll(selector);
    Array.from(sortableListElems).forEach(sortableListElem => {
      let sortable = sortablejs.create(sortableListElem, {
        group: selector,
        onEnd: function (event) {
          callSaveFunction({targetElement: sortableListElem})
        }
      });
    });
  });

}