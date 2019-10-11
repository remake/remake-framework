const {promisify} = require('util');
const fs = require('fs');
const readFileAsync = promisify(fs.readFile);
const readdirAsync = promisify(fs.readdir);
const mkdirp = require('mkdirp');
const mkdirpAsync = promisify(mkdirp);
const statAsync = promisify(fs.stat);
const path = require('path');

// e.g. let [posts, postErr] = await capture(getUsersPosts(userId));
//   source: https://dev.to/sobiodarlington/better-error-handling-with-async-await-2e5m
const capture = (promise) => {
  return promise
    .then(data => {
      // console.log("capture data:", data);
      return [data, undefined];
    })
    .catch(error => {
      // console.log("capture error:", error);
      return Promise.resolve([undefined, error]);
    });
}

async function getAllFileContentsInDirectory ({dir, fileType}) {
  let [filesInDir] = await capture(readdirAsync(dir));

  if (filesInDir && filesInDir.length) {
    let filesInDirFiltered = filesInDir.filter(f => f.endsWith("." + fileType));
    let readPromises = filesInDirFiltered.map(fileName => {
      let fileDir = path.join(dir, fileName);
      return readFileAsync(fileDir, "utf8");
    });
    let [fileContentsArray] = await capture(Promise.all(readPromises));
    return fileContentsArray || [];
  } else {
    return [];
  }
}

export {
  capture,
  readFileAsync,
  readdirAsync,
  mkdirpAsync,
  statAsync,
  getAllFileContentsInDirectory
}