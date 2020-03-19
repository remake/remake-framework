import { $ } from '../queryjs';
import { ajaxFileUpload } from '../hummingbird/lib/ajax';

export default function () {
  $.on("change", "input[type='file'][data-i]", function (event) {
    let fileInputElem = event.target;
    let file = fileInputElem.files[0];

    if (file) {
      fileInputElem.disabled = true;

      ajaxFileUpload({
        fileInputElem,
        onProgress: function (percentage) {
          console.log("percentage", percentage);
        }
      });
    }


    // fileInputElem.disabled = false;
  });
}