export default {
  watchFunctions: {
    // exampleWatchFunction: function ({watchElem,watchAttrName,watchAttrValue,dashCaseKeyName,camelCaseKeyName,value,watchFuncName,watchFuncArgs,dataSourceElem,dataTargetElems}) {}
    setMailToLink: ({ watchElem, value }) => {
      watchElem.href = "mailto:" + value;
    },
    setLink: ({ watchElem, value }) => {
      watchElem.href = value.startsWith("http") ? value : `https://${value}`;
    },
    countKeys: ({ dashCaseKeyName, watchFuncArgs }) => {
      let [selector] = watchFuncArgs;
      let targetElem = document.querySelector(selector);

      if (targetElem) {
        let elemsThatMatchKey = Array.from(document.querySelectorAll(`[key\\:${dashCaseKeyName}]`));
        let count = elemsThatMatchKey.reduce((count, el) => {
          let keyValue = el.getAttribute(`key:${dashCaseKeyName}`);
          if (keyValue !== "false" && keyValue !== "off") {
            count++;
          }

          return count;
        }, 0);

        targetElem.innerText = count;
      }
    },
    sumKeyValues: ({ dashCaseKeyName, watchFuncArgs }) => {
      let [selector] = watchFuncArgs;
      let targetElem = document.querySelector(selector);

      if (targetElem) {
        let elemsThatMatchKey = Array.from(document.querySelectorAll(`[key\\:${dashCaseKeyName}]`));
        let sum = elemsThatMatchKey.reduce((sum, elem) => {
          let keyValue = Remake.getValueForKeyName({ elem, keyName: dashCaseKeyName });
          let keyAsNumber = parseInt(keyValue) || 0;

          sum += keyAsNumber;
          return sum;
        }, 0);

        targetElem.innerText = sum;
      }
    },
  },
  onSaveCallbacks: [],
  onFileUploadCallbacks: [],
  onFileUploadProgressCallbacks: [],
  onAddItemCallbacks: [],
  onRemoveItemCallbacks: [],
  onSyncCallbacks: [],
};
