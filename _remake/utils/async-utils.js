// e.g. let [posts, postErr] = await capture(getUsersPosts(userId));
const capture = (promise) => {
  return promise
    .then(data => ([data, undefined]))
    .catch(error => Promise.resolve([undefined, error]));
}

export {
  capture
}