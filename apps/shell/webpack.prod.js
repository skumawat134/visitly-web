// apps/shell/webpack.prod.js
const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");
const Dotenv = require("dotenv-webpack");
const path = require("path");
const { InjectManifest } = require("workbox-webpack-plugin");

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
    plugins: [
      new InjectManifest({
        swSrc: path.resolve(__dirname, "src/service-worker.ts"),
        swDest: "service-worker.js",
        exclude: [/\.map$/, /remoteEntry\.js$/, /^manifest.*\.js$/, /\.gitkeep$/],
      }),
    ],
  }))
}