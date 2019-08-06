const path = require('path');
const nunjucks = require("nunjucks");

nunjucks.configure(path.join(__dirname, "../apps"), { autoescape: true });

export { nunjucks };