import routeUtils from "../utils/route-utils";

export function addRemakeAppStatusToPage ({html, data, currentUser, username, itemId}) {
  let attributeString = createBodyAttributeString({data, currentUser, username, itemId});
  return html.replace("<body", attributeString);
}

function createBodyAttributeString ({data, currentUser, username, itemId}) {
  let str = "<body ";

  if (currentUser) {
    str += "data-user-is-logged-in ";
  } else {
    str += "data-user-is-not-logged-in ";
  }

  if (data.isPageAuthor) {
    str += "data-user-is-page-author ";
  } else {
    str += "data-user-is-not-page-author ";
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