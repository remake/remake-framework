// THIS FILE INITIALIZES REMAKE'S FRONT END CODE
import Remake from 'remake-framework';
import crostini from 'crostini';
import sortablejs from 'sortablejs';

Remake.init({
  logDataOnSave: true,
  sortable: {sortablejs},
  // called after data is saved
  defaultSaveCallback: function (res) {
    if (!res.success) {
      crostini("Error saving data", {type: "error"});
    }
  },
  // called when file upload completes or fails
  fileUploadCallback: function (res) {
    if (res.success) {
      crostini("File upload successful");
    } else {
      crostini("Error uploading file", {type: "error"});
    }
  },
  // called whenever a new item is rendered to the page
  addItemCallback: function ({templateName, ajaxResponse}) {
    if (!ajaxResponse.success) {
      crostini("Error adding new item", {type: "error"});
    }
  }
});


// for debugging & development
window.getDataFromRootNode = Remake.getDataFromRootNode;

// for debugging only. 
//   calls the save function on every page load.
//   not recommended for production. use data-i-* attributes to trigger a save instead
// Remake.callSaveFunction({targetElement: document.body});




