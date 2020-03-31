import { $ } from './queryjs';

import { copyLayout } from './copy-layout';

import Switches from './switchjs';

import { 
  initInputEventListeners,
  initSaveFunctions,
  callSaveFunction,
  callMultipleWatchFunctions,
  getValueAndDataSourceElemFromKeyName
} from './inputjs';

import { 
  getDataFromRootNode,
  getLocationKeyValue,
  setLocationKeyValue,
  setValueForKeyName,
  getDataFromNode,
  getDataAndDataSourceElemFromNodeAndAncestors 
} from './data-utilities';

let init = initInputEventListeners;

export default {
  init,
  $,
  copyLayout,
  Switches,
  initInputEventListeners,
  initSaveFunctions,
  callSaveFunction,
  callMultipleWatchFunctions,
  getValueAndDataSourceElemFromKeyName,
  getDataFromRootNode,
  getLocationKeyValue,
  setLocationKeyValue,
  setValueForKeyName,
  getDataFromNode,
  getDataAndDataSourceElemFromNodeAndAncestors 
}

