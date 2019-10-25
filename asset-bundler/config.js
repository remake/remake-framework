const dotenv = require("dotenv");

dotenv.config({ path: "variables.env" });
let isMultiTenant = process.env.REMAKE_MULTI_TENANT === "true";
let globToSearch = isMultiTenant ? "app/*/assets/**" : "app/assets/**";

module.exports = {
  isMultiTenant,
  globToSearch
}