import routeUtils from "../utils/route-utils";

export function addRemakeAppStatusToPage ({html, currentUser, username, itemId}) {
  let attributeString = createBodyAttributeString({currentUser, params});
  return html.replace("<body", attributeString);
}

function createBodyAttributeString ({currentUser, username, itemId}) {
  let str = "<body ";

  if (currentUser) {
    str += "data-user-logged-in ";
  } else {
    str += "data-user-not-logged-in ";
  }

  if (routeUtils.isBaseRoute({username, itemId})) {
    str += "data-base-route ";
  }

  if (routeUtils.isUsernameRoute({username, itemId})) {
    str += "data-username-route ";
  }

  if (routeUtils.isItemRoute({username, itemId})) {
    str += `data-item-route="${itemId}" `;
  }

  return str;
}