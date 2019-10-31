import Remake from 'remake-framework';
import './helpers/_event-helpers';
import crostini from 'crostini';
import sortablejs from 'sortablejs';

Remake.init({
  sortable: {
    sortablejs: sortablejs,
    // assumption: each name is a selector AND a group name
    selectors: [".todo-lists"]
  },
  logDataOnSave: true, // to implement. should console.log data on page whenever it changes.
  defaultSaveCallback: function (res) {
    if (!res.success) {
      crostini("Error saving data", {type: "error"});
    }
  },
  addItemCallback: function ({templateName, ajaxResponse}) {
    if (!ajaxResponse.success) {
      crostini("Error adding new item", {type: "error"});
    }
  }
});

// for debugging
window.getDataFromRootNode = Remake.getDataFromRootNode;