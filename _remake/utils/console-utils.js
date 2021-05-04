export function showConsoleError(...msg) {
  console.log("\x1b[31m", ...msg);
}

export function showConsoleSuccess(...msg) {
  console.log("\x1b[32m", ...msg);
}
