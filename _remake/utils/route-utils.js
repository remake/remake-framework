function isBaseRoute ({username, itemId}) {
  return !itemId && !username;
}
function isUsernameRoute ({username, itemId}) {
  return !!username;
}
function isItemRoute ({username, itemId}) {
  return !!itemId;
}

export default {
  isBaseRoute,
  isUsernameRoute,
  isItemRoute
}