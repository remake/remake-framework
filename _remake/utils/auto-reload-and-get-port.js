const reload = require("reload");
const net = require("net");
import { showConsoleError } from "./console-utils";
import RemakeStore from "../lib/remake-store";
const portSearchStartsAt = process.env.PORT || 3000;

export default function autoReloadAndGetPort(app) {
  if (RemakeStore.isDevelopmentMode()) {
    return new Promise((resolve, reject) => {
      reload(app)
        .then(function (reloadReturned) {
          getAvailablePort(portSearchStartsAt).then(availablePort => {
            resolve(availablePort);
          });
        })
        .catch(function (err) {
          showConsoleError("reload didn't start", err);
        });
    });
  } else {
    return new Promise((resolve, reject) => {
      resolve(portSearchStartsAt);
    });
  }
}

function getAvailablePort(startingAt = 3030) {
  function getNextAvailablePort(currentPort, cb) {
    currentPort = parseInt(currentPort, 10);
    const server = net.createServer();
    server.listen(currentPort, _ => {
      server.once("close", _ => {
        cb(currentPort);
      });
      server.close();
    });
    server.on("error", _ => {
      let randomNumber = Math.floor(Math.random() * 100) + 1;
      getNextAvailablePort(currentPort + randomNumber, cb);
    });
  }

  return new Promise(resolve => {
    getNextAvailablePort(startingAt, resolve);
  });
}
