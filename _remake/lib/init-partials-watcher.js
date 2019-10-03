const chokidar = require('chokidar');

export function initPartialsWatcher () {
  const watcher = chokidar.watch("app/**/partials/*.hbs", {
    ignoreInitial: true
  });

  let appNames = new Set();
  let timeout;
  watcher.on('all', (event, path) => {
    let match = path.match(/app\/([a-z]*[a-z0-9-]+)/);
    let appName = match && match[1];

    appNames.add(appName);
    clearTimeout(timeout);

    timeout = setTimeout(function () {
      reloadPartialsForApps();
    }, 300);
  });

  function reloadPartialsForApps () {
    console.log("reload partials for:", Array.from(appNames));
  }
}