import Remake from '../client-side';

Remake.init({
  logDataOnSave: true, // to implement. should console.log data on page whenever it changes.
  defaultSaveCallback: function (res) {
    if (!res.success) {
    }
  },
  addItemCallback: function ({templateName, ajaxResponse}) {
    if (!ajaxResponse.success) {
    }
  }
});

// for debugging
window.getDataFromRootNode = Remake.getDataFromRootNode;