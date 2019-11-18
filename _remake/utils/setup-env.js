const process = require('process');
const changeCase = require('change-case');

import { readDotRemake } from './dot-remake';

// parse .remake and sent its entries
// as environment variables
function setEnvironmentVariables() {
  const dotRemakeObj = readDotRemake();
  Object.keys(dotRemakeObj).forEach(key => {
    // change camelCase to SNAKE_CASE_UPPER
    const skuKey = changeCase.snakeCase(key).toUpperCase()
    process.env[skuKey] = dotRemakeObj[key]
  })

  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = "development";
  }
}

export { setEnvironmentVariables };