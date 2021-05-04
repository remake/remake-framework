import { ajaxFileUpload } from "../hummingbird/lib/ajax";
import optionsData from "./optionsData";
import { setValueForClosestKey } from "../data-utilities";
import { callOnFileUploadCallbacks, callOnFileUploadProgressCallbacks } from "./callbacks";

export function handleUpload({ elem, keyName }) {
  let fileUploadStartTime;
  let fileUploadFinishTime;
  let fileInputElem = elem;
  let file = fileInputElem.files[0];

  if (file) {
    fileInputElem.disabled = true;

    if (!optionsData._defaultUploadCallback) {
      uploadFile({ fileInputElem, keyName });
    } else {
      let file = fileInputElem.files[0];
      optionsData._defaultUploadCallback({ fileInputElem, keyName, resetFileInput, file });
    }
  }
}

function uploadFile({ fileInputElem, keyName }) {
  ajaxFileUpload({
    fileInputElem,
    onProgress: function (percentage) {
      if (percentage === 0) {
        fileUploadStartTime = new Date().getTime();
      }

      setPercentageOnUploadingNotice(percentage);

      if (percentage === 100) {
        resetFileInput(fileInputElem);
      }

      callOnFileUploadProgressCallbacks({ percentage });
    },
    onSuccess: function (res) {
      setValueForClosestKey({ elem: fileInputElem, keyName, value: res.filePath });

      callOnFileUploadCallbacks({ success: true, res });
    },
    onError: function () {
      resetFileInput(fileInputElem);

      callOnFileUploadCallbacks({ success: false });
    },
  });
}

// uploading notice
function setPercentageOnUploadingNotice(percentage) {
  let uploadingNotice = document.querySelector(".uploading-notice");
  let progressCompleteElem = document.querySelector(".uploading-notice__progress-bar-complete");
  let progressStatusElem = document.querySelector(".uploading-notice__status-percentage");

  percentage = percentage || 0;

  if (percentage > 0) {
    uploadingNotice.classList.add("uploading-notice--visible");
  }

  progressCompleteElem.style.transform = `scaleX(${percentage / 100})`;
  progressStatusElem.innerText = parseInt(percentage, 10) + "%";

  if (percentage === 100) {
    fileUploadFinishTime = new Date().getTime();

    let timeoutMs = 1500;
    if (fileUploadFinishTime - fileUploadStartTime < 2500) {
      timeoutMs = 2300;
    }

    setTimeout(function () {
      uploadingNotice.classList.remove("uploading-notice--visible");
    }, timeoutMs);
  }
}

function resetFileInput(elem) {
  elem.disabled = false;
  elem.value = "";
}
