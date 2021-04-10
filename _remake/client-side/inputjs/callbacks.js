import optionsData from "./optionsData";

// Called by user

export function onSave(cb) {
  optionsData.onSaveCallbacks.push(cb);
}

export function onFileUpload(cb) {
  optionsData.onFileUploadCallbacks.push(cb);
}

export function onFileUploadProgress(cb) {
  optionsData.onFileUploadProgressCallbacks.push(cb);
}

export function onAddItem(cb) {
  optionsData.onAddItemCallbacks.push(cb);
}

export function onRemoveItem(cb) {
  optionsData.onRemoveItemCallbacks.push(cb);
}

export function onSync(cb) {
  optionsData.onSyncCallbacks.push(cb);
}

// Called by framework

export function callOnSaveCallbacks(...args) {
  optionsData.onSaveCallbacks.forEach(cb => cb(...args));
}

export function callOnFileUploadCallbacks(...args) {
  optionsData.onFileUploadCallbacks.forEach(cb => cb(...args));
}

export function callOnFileUploadProgressCallbacks(...args) {
  optionsData.onFileUploadProgressCallbacks.forEach(cb => cb(...args));
}

export function callOnAddItemCallbacks(...args) {
  optionsData.onAddItemCallbacks.forEach(cb => cb(...args));
}

export function callOnRemoveItemCallbacks(...args) {
  optionsData.onRemoveItemCallbacks.forEach(cb => cb(...args));
}

export function callOnSyncCallbacks(...args) {
  optionsData.onSyncCallbacks.forEach(cb => cb(...args));
}
