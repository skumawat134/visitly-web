const baseConfig = require("./webpack.base");
const { sharedDeps } = require("./federation.shared");

module.exports = {
  baseConfig,
  sharedDeps,
};