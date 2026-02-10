// apps/shell/webpack.prod.js
const { merge } = require("webpack-merge");
const common = require("./webpack.dev.js");


module.exports = (env) => {
  return (merge(common(env), {
    mode: "production",
    output: {
      publicPath: "auto",
      filename: "[name].[contenthash].js", // Content hash for caching
      clean: true,
    },
    "externals": {
      "react": "React",
      "react-dom": "ReactDOM",
      "react/jsx-runtime": "JSXRuntime"
    },
    optimization: {
      minimize: true,
      splitChunks: {
        chunks: 'all',
      },
    },
    "mode" :"production"
  }))
}