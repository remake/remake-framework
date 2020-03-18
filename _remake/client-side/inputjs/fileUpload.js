import { $ } from '../queryjs';
import { ajaxFileUpload } from '../hummingbird/lib/ajax';

export default function () {
  $.on("change", "input[type='file'][data-i]", function (event) {
    let fileInputElem = event.target;

    fileInputElem.disabled = true;

    ajaxFileUpload({
      fileInputElem,
      onProgress: function (percentage) {

      }
    });


    // fileInputElem.disabled = false;
  });
}