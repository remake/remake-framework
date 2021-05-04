const { promisify } = require("util");
const fs = require("fs");
const readFileAsync = promisify(fs.readFile);
const readdirAsync = promisify(fs.readdir);
const mkdirp = require("mkdirp");
const mkdirpAsync = promisify(mkdirp);
const statAsync = promisify(fs.stat);
const path = require("path");

// e.g. let [posts, postErr] = await capture(getUsersPosts(userId));
//   source: https://dev.to/sobiodarlington/better-error-handling-with-async-await-2e5m
const capture = promise => {
  return promise
    .then(data => {
      // console.log("capture data:", data);
      return [data, undefined];
    })
    .catch(error => {
      // console.log("capture error:", error);
      return Promise.resolve([undefined, error]);
    });
};

async function getAllFileContentsInDirectory({ dir, fileType }) {
  let [filesInDir] = await capture(readdirAsync(dir));
  let fileExtension = "." + fileType;

  if (filesInDir && filesInDir.length) {
    let filesInDirFiltered = filesInDir.filter(f => f.endsWith(fileExtension));

    let readPromises = filesInDirFiltered.map(fileName => {
      let fileDir = path.join(dir, fileName);
      return readFileAsync(fileDir, "utf8");
    });

    let [fileContentsArray] = await capture(Promise.all(readPromises));

    if (fileContentsArray && fileContentsArray.length) {
      let fileExtensionRegex = new RegExp(`${fileExtension}$`, "i");

      let files = fileContentsArray.map((contents, index) => {
        let fileName = filesInDirFiltered[index].replace(fileExtensionRegex, "");
        return { contents, fileName };
      });

      return files;
    } else {
      return [];
    }
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
  getAllFileContentsInDirectory,
};
