export default function runWatchFunctions() {
  // run watch functions that have "run:watch" on them when page loads
  let watchElems = Array.from(document.querySelectorAll("[run\\:watch]"));
  Remake.callWatchFunctionsOnElements(watchElems);
}
