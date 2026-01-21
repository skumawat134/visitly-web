// apps/shell/webpack.prod.js
const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");
const Dotenv = require("dotenv-webpack");
const path = require("path");

module.exports = (env) => {
  return (merge(common(env), {
    mode: "production",
    output: {
      publicPath: "auto",
      filename: "[name].[contenthash].js", // Content hash for caching
      clean: true,
    },
    optimization: {
      minimize: true,
      splitChunks: {
        chunks: 'all',
      },
    },
  }))
}