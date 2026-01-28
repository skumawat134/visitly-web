const tailwindPostcssModule = require("@tailwindcss/postcss");
const tailwindPlugin = tailwindPostcssModule?.default || tailwindPostcssModule;

module.exports = {
  postcssTailwindPlugin: tailwindPlugin,
};