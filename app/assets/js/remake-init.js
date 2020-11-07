// THIS FILE INITIALIZES REMAKE'S FRONT END CODE
import crostini from 'crostini';
import sortablejs from 'sortablejs';

Remake.init({
  logDataOnSave: true,
  sortable: {sortablejs}
});

Remake.onSave(function (res) {
  if (!res.success) {
    crostini("Error saving data", {type: "error"});
  }
});

Remake.onFileUpload(function (res) {
  if (res.success) {
    crostini("File upload successful");
  } else {
    crostini("Error uploading file", {type: "error"});
  }
});

Remake.onAddItem(function (res) {
  if (!res.ajaxResponse.success) {
    crostini("Error adding new item", {type: "error"});
  }
});



