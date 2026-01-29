const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");
const Dotenv = require("dotenv-webpack");
const path = require("path");
module.exports = (env) => {
  return merge(common(env), {
    mode: "development",
    devtool: "eval-source-map", // faster rebuilds
    devServer: {
      proxy: [
        {
          context: ['/assets', '/styles.css', '/data-table.woff', '/data-table.ttf'],
          target: 'http://localhost:4200', // Redirect requests for /assets to the Auth MFE
          changeOrigin: true,
        },
      ],
      static: [
        {
          directory: path.join(__dirname, "dist"),
        },
        {
          directory: path.join(__dirname, "public"),
          publicPath: "/",
        },
      ],
      hot: true,
      historyApiFallback: true,
      port: 4201,
      open: true,
      host: 'localhost',
    },
    plugins: [
      new Dotenv({
        path: path.resolve(__dirname, `./.env.${process.env.APP_ENV || 'development'}`),
      }),
    ],
  }
  )
}