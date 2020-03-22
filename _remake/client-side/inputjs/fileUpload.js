import { $ } from '../queryjs';
import { ajaxFileUpload } from '../hummingbird/lib/ajax';
import optionsData from './optionsData';

export default function () {
  $.on("change", "input[type='file'][data-i]", function (event) {
    let fileInputElem = event.target;
    let file = fileInputElem.files[0];

    if (file) {
      fileInputElem.disabled = true;

      ajaxFileUpload({
        fileInputElem,
        onProgress: function (percentage) {
          if (percentage === 100) {
            fileInputElem.disabled = false;
            fileInputElem.value = "";
          }

          if (optionsData.fileUploadCallback) {
            optionsData.fileUploadCallback({success: true, percentage});
          }
        },
        onError: function () {
          fileInputElem.disabled = false;
          fileInputElem.value = "";

          if (optionsData.fileUploadCallback) {
            optionsData.fileUploadCallback({success: false});
          }
        }
      });
    }


    // fileInputElem.disabled = false;
  });
}