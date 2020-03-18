function ajax ({url, method, data, callback}) {
  fetch(url, {
    method: method,
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json; charset=utf-8"
    },
    body: JSON.stringify(data),
  })
  .then(res => res.json())
  .then(res => {
    callback(res);
  });
}

export function ajaxSimple (url, method, data, callback) {
  ajax({url, method, data, callback});
}

export function ajaxPost (url, data, callback) {
  ajaxSimple(url, "POST", data, callback);
}

export function ajaxGet (url, data, callback) {
  ajaxSimple(url, "GET", data, callback);
}

// ajax file upload

export function ajaxFileUpload ({fileInputElem, onProgress} = {}) {
  let xhr = new XMLHttpRequest();
  let file = fileInputElem.files[0];
  let formData = new FormData();
  formData.append(fileInputElem.name, file, fileInputElem.name);

  xhr.open("POST", "/upload", true);
  xhr.upload.onprogress = function (e) {
    if (e.lengthComputable) {
      if (onProgress) {
        let progress = Math.floor((e.loaded / e.total) * 100); // number from 0 to 100
        onProgress(progress);
      }
    }
  }

  xhr.upload.onloadstart = function (e) {
    if (onProgress) {
      onProgress(0);
    }
  }

  xhr.upload.onloadend = function (e) {
    if (onProgress) {
      onProgress(100);
    }
  }

  xhr.send(formData);
}