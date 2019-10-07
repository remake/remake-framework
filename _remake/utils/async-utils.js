const {promisify} = require('util');
const fs = require('fs');
const readFileAsync = promisify(fs.readFile);
const readdirAsync = promisify(fs.readdir);
const mkdirp = require('mkdirp');
const mkdirpAsync = promisify(mkdirp);

// e.g. let [posts, postErr] = await capture(getUsersPosts(userId));
//   source: https://dev.to/sobiodarlington/better-error-handling-with-async-await-2e5m
const capture = (promise) => {
  return promise
    .then(data => ([data, undefined]))
    .catch(error => {
      // console.log({error});
      Promise.resolve([undefined, error]);
    });
}

export {
  capture,
  readFileAsync,
  readdirAsync,
  mkdirpAsync
}