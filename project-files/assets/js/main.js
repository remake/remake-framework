import { init, getDataFromRootNode } from 'remakejs/dist/bundle.es6';

init({
  debugSave: true // to implement. should console.log data on page whenever it changes.
});

// for debugging
window.getDataFromRootNode = getDataFromRootNode;