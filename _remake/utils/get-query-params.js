export function getQueryParams({ req, fromReferrer }) {
  let queryObj = {};
  let searchParams;

  if (!fromReferrer) {
    searchParams = req.urlData.urlObj.searchParams.entries();
  } else {
    searchParams = req.urlData.referrerUrlObj.searchParams.entries();
  }

  for (let searchParamsPair of searchParams) {
    queryObj[searchParamsPair[0]] = searchParamsPair[1];
  }

  return queryObj;
}
