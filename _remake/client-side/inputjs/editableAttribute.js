import { $ } from '../queryjs';
import { forEachAttr, onAttributeEvent } from '../hummingbird/lib/dom';
import { copyLayout } from '../copy-layout';
import { getClosestElemWithKey, setValueForKeyName, getKeyNamesFromElem } from '../data-utilities';
import { openEditCallback } from './callbacks';
import { syncDataNextTick } from './syncData';
import { showError } from '../common/show-error';
import autosize from '../vendor/autosize';

// USAGE EXAMPLES:
// edit:example-key
// edit:example-key:text
// edit:example-key:textarea
export default function() {
  onAttributeEvent({
    eventTypes: ['click'],
    partialAttributeStrings: ['edit:'],
    groupMatchesIntoSingleCallback: true,
    filterOutElemsInsideAncestor: '[disable-events]',
    callback: openEditCallback,
  });

  // sync data from popover into the page
  $.on('submit', '[sync]', (event) => {
    event.preventDefault();
    let syncElement = event.currentTarget.closest('[sync]');
    syncDataNextTick({
      sourceElement: syncElement,
      targetElement: $.data(syncElement, 'source'),
      keyNames: getKeyNamesFromElem(syncElement),
    });
  });

  // this was causing a bug before. i think the form was submitting when it shouldn't have.
  $.on('click', ".remake-edit__button:not([type='submit'])", function(event) {
    event.preventDefault();
  });

  document.addEventListener('keydown', (event) => {
    // esc key
    if (event.keyCode === 27) {
      let turnedOnEditablePopover = document.querySelector('[key:remake-edit-popover="on"]');

      if (turnedOnEditablePopover) {
        setValueForKeyName({
          elem: turnedOnEditablePopover,
          keyName: 'remake-edit-popover',
          value: 'off',
        });
      }
    }
  });
}

function removeObjectKeysFromElem({ elem }) {
  let attributesToRemove = [];
  forEachAttr(elem, (attrName, attrValue) => {
    if (attrName.startsWith('key:') || attrName.startsWith('temporary:key:')) {
      attributesToRemove.push(attrName);
    }
  });
  // this is outside the loop because you can't remove items from an array when you're looping through it
  attributesToRemove.forEach((attrName) => elem.removeAttribute(attrName));
}

// config: [{keyName, formType, removeOption, eventType, matchingElement, matchingAttribute, matchingPartialAttributeString}]
function addObjectKeysToElem({ elem, config }) {
  config.forEach((obj) => {
    elem.setAttribute(`temporary:key:${obj.keyName}`, '');
  });
}

// config: [{keyName, formType, removeOption, eventType, matchingElement, matchingAttribute, matchingPartialAttributeString}]
function generateRemakeEditAreas({ config }) {
  let outputHtml = '';

  // formType can be "text" or "textarea" or something else that's not implemented yet
  config.forEach(({ formType, keyName }) => {
    let formFieldHtml;

    if (formType === 'text') {
      formFieldHtml = `<input class="remake-edit__input" update:${keyName} type="text">`;
    }

    if (formType === 'textarea') {
      formFieldHtml = `<textarea class="remake-edit__textarea" update:${keyName}></textarea>`;
    }

    outputHtml += `<div class="remake-edit__edit-area">${formFieldHtml}</div>`;
  });

  return outputHtml;
}
