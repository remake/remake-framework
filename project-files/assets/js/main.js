import { init, getDataFromRootNode } from 'remakejs/dist/bundle.es6';
import crostini from 'crostini';

init({
  debugSave: true, // to implement. should console.log data on page whenever it changes.
  defaultSaveCallback: function (res) {
    if (!res.success) {
      crostini("Can't save data on this page", {type: "error"});
    }
  }
});

// for debugging
window.getDataFromRootNode = getDataFromRootNode;