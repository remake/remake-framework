// TRAVERSING & ASSEMBLING DOM UTILS

// searches elem and all its ancestors to see if they match a selector
export function forEachAncestorMatch({ elem, selector, callback }) {
  let matchingElem = elem.closest(selector);

  if (matchingElem) {
    callback(matchingElem);

    let matchingElemParent = matchingElem.parentNode;
    if (matchingElemParent) {
      forEachAncestorMatch({ elem: matchingElemParent, selector, callback });
    }
  }
}

// searches parent element and all children to see if they match a selector
export function forEachMatchingElem(parentElem, selector, callback) {
  if (parentElem.matches(selector)) {
    callback(parentElem);
  }

  let childMatches = Array.from(parentElem.querySelectorAll(selector));

  childMatches.forEach(childMatch => {
    callback(childMatch);
  });
}

export function forEachNestedElem(elem, callback) {
  callback(elem);

  for (let i = 0, l = elem.children.length; i < l; i++) {
    forEachNestedElem(elem.children[i], callback);
  }
}

export function findNestedElem(elem, testFunc) {
  let firstMatch;
  // unfortunate that this loops through all child elements even after a match is found
  forEachNestedElem(elem, function (el) {
    if (!firstMatch && testFunc(el)) {
      firstMatch = el;
    }
  });
  return firstMatch;
}

// get an element's parents, optionally filtering them by a selector
export function getParents({ elem, selector, includeCurrentElement }) {
  let parents = [];

  if (!includeCurrentElement) {
    elem = elem.parentNode;
  }

  for (; elem && elem !== document; elem = elem.parentNode) {
    if (!selector || (selector && elem.matches(selector))) {
      parents.push(elem);
    }
  }

  return parents;
}

// recursively search inside all parent elements for a selector
export function findNearest({ elem, selector }) {
  if (elem === document.documentElement) {
    return;
  }

  if (elem.matches(selector)) {
    return elem;
  }

  let matchingChildElem = elem.querySelector(selector);
  if (matchingChildElem) {
    return matchingChildElem;
  }

  return findNearest({ elem: elem.parentElement, selector });
}

// LOOPING OVER ELEMENT ATTRIBUTES

export function forEachAttr(elem, fn) {
  let attributes = elem.attributes;
  let attributesLength = attributes.length;

  for (var i = 0; i < attributesLength; i++) {
    let attrName = attributes[i].name;
    let attrValue = attributes[i].value;

    fn(attrName, attrValue);
  }
}

// ELEMENT POSITION

export function getElementOffset(el) {
  let clientRect = el.getBoundingClientRect();
  let top = clientRect.top + window.pageYOffset;
  let left = clientRect.left + window.pageXOffset;
  let right = clientRect.width + left;
  let bottom = clientRect.height + top;
  let width = right - left;
  let height = bottom - top;

  return {
    top: top,
    right: right,
    bottom: bottom,
    left: left,
    width: width,
    height: height,
  };
}

/****************************************************
 *                                                  *
 *    ON CLICK ELEMENTS WITH PARTIAL ATTRIBUTE      *
 *                                                  *
 ****************************************************/

// get names of all attributes on an element
function getAttributeNames({ elem }) {
  let elemAttributes = elem.attributes;
  let attributes = [];

  for (let i = 0; i < elemAttributes.length; i++) {
    attributes.push(elemAttributes[i].name);
  }

  return attributes;
}

// check if an element has a string in part of one of its attributes
function getAttributesThatElemMatchesPartOf({ elem, partialAttributeString }) {
  let elemAttributes = getAttributeNames({ elem });
  return elemAttributes.filter(attr => attr.indexOf(partialAttributeString) !== -1);
}

// matches elements with very specific attributes and triggers a callback on an event
// these elements can't be targeted with querySelector because we need to
// match only part of the attribute
// partialAttributeStrings is an array like: ["update:", "new:", "toggle:", "watch:"]
// by default, CALLBACK for every matching element
// to make callback group matches into an array that's called for every event type, pass in groupMatchesIntoSingleCallback:true
export function onAttributeEvent({
  eventTypes = ["click"],
  partialAttributeStrings,
  matchesSelectors,
  callback,
  groupMatchesIntoSingleCallback,
  filterOutElemsInsideAncestor,
}) {
  eventTypes.forEach(eventType => {
    document.addEventListener(eventType, function (event) {
      let targetElem = event.target;

      if (filterOutElemsInsideAncestor && targetElem.closest(filterOutElemsInsideAncestor)) {
        return;
      }

      let elemAndParents = getParents({ elem: targetElem, includeCurrentElement: true });
      let matchingElems = [];

      for (let i = 0; i < elemAndParents.length; i++) {
        let elem = elemAndParents[i];

        // e.g. partialAttributeString ===  "edit:"
        partialAttributeStrings.forEach(partialAttributeString => {
          let matchingAttributes = getAttributesThatElemMatchesPartOf({
            elem,
            partialAttributeString,
          });
          matchingAttributes.forEach(matchingAttribute => {
            if (!matchesSelectors || matchesSelectors.every(selector => elem.matches(selector))) {
              matchingElems.push({
                matchingElement: elem,
                matchingAttribute,
                value: elem.value || "",
                eventType,
                matchingPartialAttributeString: partialAttributeString,
              });
            }
          });
        });
      }

      if (matchingElems.length) {
        if (!groupMatchesIntoSingleCallback) {
          matchingElems.forEach(m => callback(m));
        } else {
          callback(matchingElems);
        }
      }
    });
  });
}
