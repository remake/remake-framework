const net = require("net");

export default function getAvailablePort(startingAt = 3030) {
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
