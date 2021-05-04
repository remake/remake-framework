const fs = require("fs");
const path = require("path");
const process = require("process");

const log = console.log;

// write fields to .remake
function writeDotRemake(content) {
  const cwd = process.cwd();
  const dotRemakePath = path.join(cwd, ".remake");
  try {
    fs.writeFileSync(dotRemakePath, JSON.stringify(content, null, 4));
    return true;
  } catch (err) {
    log(chalk.bgRed("Error: Couldn't create .remake file"));
    return false;
  }
}

// read .remake in memory
function readDotRemake() {
  const cwd = process.cwd();
  const dotRemakePath = path.join(cwd, ".remake");

  // check if .remake file exists
  const dotRemakeExists = fs.existsSync(dotRemakePath);
  if (!dotRemakeExists) {
    return false;
  }
  try {
    const dotRemake = fs.readFileSync(dotRemakePath, "utf8");
    const dotRemakeObj = JSON.parse(dotRemake);
    return dotRemakeObj;
  } catch (err) {
    log(err);
    return false;
  }
}

module.exports = { writeDotRemake, readDotRemake };
