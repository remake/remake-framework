import optionsData from './optionsData';

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
  optionsData.onSaveCallbacks.forEach((cb) => cb(...args));
}

export function callOnFileUploadCallbacks(...args) {
  optionsData.onFileUploadCallbacks.forEach((cb) => cb(...args));
}

export function callOnFileUploadProgressCallbacks(...args) {
  optionsData.onFileUploadProgressCallbacks.forEach((cb) => cb(...args));
}

export function callOnAddItemCallbacks(...args) {
  optionsData.onAddItemCallbacks.forEach((cb) => cb(...args));
}

export function callOnRemoveItemCallbacks(...args) {
  optionsData.onRemoveItemCallbacks.forEach((cb) => cb(...args));
}

export function callOnSyncCallbacks(...args) {
  optionsData.onSyncCallbacks.forEach((cb) => cb(...args));
}

// USAGE EXAMPLES:
// edit:example-key
// edit:example-key:text
// edit:example-key:textarea
export const openEditCallback = (matches) => {
  // matches: [{eventType, matchingElement, matchingAttribute, matchingPartialAttributeString}]

  // editableConfig: [{keyName, formType, removeOption, eventType, matchingElement, matchingAttribute, matchingPartialAttributeString}]
  let editableConfig = matches.map(
    ({ eventType, matchingElement, matchingAttribute, matchingPartialAttributeString }) => {
    let attributeParts = matchingAttribute.split(':');
      // attributeParts could be:
      // ["edit", "example-key"]
      // ["edit", "example-key", "without-remove"]
      // ["edit", "example-key", "textarea", "without-remove"]
      // -> first two items are requireed, the last two are optional
      let [_, keyName, ...otherOptions] = attributeParts;

      let validRemoveOptions = ['with-remove', 'without-remove', 'with-erase'];
      let validFormTypes = ['text', 'textarea'];

      // if `otherOptions` includes includes a valid remove option, use that. Otherwise, use default value.
      let removeOption =
        validRemoveOptions.find((str) => otherOptions.includes(str)) || 'with-remove';
      // if `otherOptions` includes includes a valid form type option, use that. Otherwise, use default value.
      let formType = validFormTypes.find((str) => otherOptions.includes(str)) || 'text';

      return {
        keyName,
        formType,
        removeOption,
        eventType,
        matchingElement,
        matchingAttribute,
        matchingPartialAttributeString,
      };
    }
  );

  // get first matching element for positioning popover
  let firstMatch = editableConfig[0];
  let firstMatchElem = firstMatch.matchingElement;
  let firstMatchKeyName = firstMatch.keyName;
  let firstMatchRemoveOption = firstMatch.removeOption;
  let firstMatchTargetElem = getClosestElemWithKey({
    elem: firstMatchElem,
    keyName: firstMatchKeyName,
  });

  if (!firstMatchElem || !firstMatchKeyName || !firstMatchTargetElem) {
    showError(
      `Problem with the 'edit:' attribute on one of these elements:`,
      matches.map((m) => m.matchingElement)
    );
    return;
  }

  let editablePopoverElem = document.querySelector('.remake-edit');

  // reset popover: remove old keys
  removeObjectKeysFromElem({ elem: editablePopoverElem });

  // open popover
  let hasRemove = firstMatchRemoveOption === 'with-remove';
  let hasErase = firstMatchRemoveOption === 'with-erase';
  editablePopoverElem.setAttribute(`temporary:key:remake-edit-popover`, '');
  editablePopoverElem.setAttribute(`temporary:key:remake-edit-option-has-remove`, '');
  editablePopoverElem.setAttribute(`temporary:key:remake-edit-option-has-erase`, '');
  setValueForKeyName({ elem: editablePopoverElem, keyName: 'remake-edit-popover', value: 'on' });
  setValueForKeyName({
    elem: editablePopoverElem,
    keyName: 'remake-edit-option-has-remove',
    value: hasRemove ? 'on' : 'off',
  });
  setValueForKeyName({
    elem: editablePopoverElem,
    keyName: 'remake-edit-option-has-erase',
    value: hasErase ? 'on' : 'off',
  });

  // keep track of the source of the data on the popover element
  $.data(editablePopoverElem, 'source', firstMatchTargetElem);

  // add object keys for storing data that's being edited in the popover
  addObjectKeysToElem({ elem: editablePopoverElem, config: editableConfig });

  // sync data from the page into the popover
  syncDataNextTick({
    sourceElement: firstMatchElem,
    targetElement: editablePopoverElem,
    keyNames: editableConfig.map((obj) => obj.keyName),
    shouldSyncIntoUpdateElems: true,
  });

  // render html inside the edit popover
  let remakeEditAreasElem = editablePopoverElem.querySelector('.remake-edit__edit-areas');
  remakeEditAreasElem.innerHTML = generateRemakeEditAreas({ config: editableConfig });

  // copy the layout
  copyLayout({
    sourceElem: firstMatchElem,
    targetElem: editablePopoverElem,
    dimensionsName: 'width',
    xOffset: 0,
    yOffset: 0,
  });

  // autosize textareas -- not sure why or even if this needs to be in a setTimeout
  setTimeout(function() {
    let textareas = Array.from(editablePopoverElem.querySelectorAll('textarea'));
    textareas.forEach((el) => autosize(el));
  });

  // focus first focusable element
  let firstFormInput = editablePopoverElem.querySelector('textarea, input');
  if (firstFormInput) {
    firstFormInput.focus();
  }
};
