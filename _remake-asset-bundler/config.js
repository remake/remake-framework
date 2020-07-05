const {setEnvironmentVariables} = require("../_remake/utils/setup-env");

setEnvironmentVariables();

let isMultiTenant = process.env.REMAKE_MULTI_TENANT === "true";
let globToSearch = isMultiTenant ? "app/*/assets/**" : "app/assets/**";
let frameworkGlobToSearch = "_remake/client-side/**";

module.exports = {
  isMultiTenant,
  globToSearch,
  frameworkGlobToSearch
}