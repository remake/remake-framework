import { $ } from '../queryjs';
import { ajaxFileUpload } from '../hummingbird/lib/ajax';
import optionsData from './optionsData';
import { callSaveFunction } from './onSave';
import { setValueOfClosestKey } from '../data-utilities';

export default function () {
  let fileUploadStartTime;
  let fileUploadFinishTime;

  $.on("change", "input[type='file'][data-i]", function (event) {
    let fileInputElem = event.target;
    let file = fileInputElem.files[0];

    if (file) {
      fileInputElem.disabled = true;

      ajaxFileUpload({
        fileInputElem,
        onProgress: function (percentage) {
          if (percentage === 0) {
            fileUploadStartTime = (new Date()).getTime();
          }

          setPercentageOnUploadingNotice(percentage);

          if (percentage === 100) {
            resetFileInput(fileInputElem);
          }

          if (optionsData.fileUploadProgressCallback) {
            optionsData.fileUploadProgressCallback({percentage});
          }
        },
        onSuccess: function (res) {
          if (optionsData.fileUploadCallback) {
            setFileData(fileInputElem, res.filePath);

            optionsData.fileUploadCallback({success: true, res});
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
      fileUploadFinishTime = (new Date()).getTime();

      let timeoutMs = 1500;
      if ((fileUploadFinishTime - fileUploadStartTime) < 2500) {
        timeoutMs = 2300;
      }

      setTimeout(function () {
        uploadingNotice.classList.remove("uploading-notice--visible");
      }, timeoutMs);
    }
  }
}

function resetFileInput (elem) {
  elem.disabled = false;
  elem.value = "";
}

function setFileData (elem, value) {
  let camelCaseKeyName = elem.getAttribute("name");

  if (camelCaseKeyName) {
    setValueOfClosestKey({elem, camelCaseKeyName, value});
  }

  if (elem.getAttribute("data-i") !== "dontTriggerSaveOnChange") {
    callSaveFunction({targetElement: elem});
  }
}




