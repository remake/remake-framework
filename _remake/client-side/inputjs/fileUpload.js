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
          setPercentageOnUploadingNotice(percentage);

          if (percentage === 100) {
            resetFileInput(fileInputElem);
          }

          if (optionsData.fileUploadProgressCallback) {
            optionsData.fileUploadProgressCallback({percentage});
          }

          if (percentage === 100 && optionsData.fileUploadCallback) {
            optionsData.fileUploadCallback({success: true});
          }
        },
        onError: function () {
          resetFileInput(fileInputElem);

          if (optionsData.fileUploadCallback) {
            optionsData.fileUploadCallback({success: false});
          }
        }
      });
    }
  });

  // uploading notice
  let uploadingNotice = document.querySelector(".uploading-notice");
  let progressCompleteElem = document.querySelector(".uploading-notice__progress-bar-complete");
  let progressStatusElem = document.querySelector(".uploading-notice__status-percentage");
  function setPercentageOnUploadingNotice (percentage) {
    percentage = percentage || 0;

    if (percentage > 0) {
      uploadingNotice.classList.add("uploading-notice--visible");
    } 

    progressCompleteElem.style.transform = `scaleX(${percentage / 100})`;
    progressStatusElem.innerText = parseInt(percentage, 10) + "%";

    if (percentage === 100) {
      setTimeout(function () {
        uploadingNotice.classList.remove("uploading-notice--visible");
      }, 750);
    }
  }
}

function resetFileInput (elem) {
  elem.disabled = false;
  elem.value = "";
}




