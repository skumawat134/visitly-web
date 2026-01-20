const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const { ModuleFederationPlugin } = require("webpack").container;
const Dotenv = require("dotenv-webpack");
const tailwindPostcssModule = require("@tailwindcss/postcss");
const tailwindPostcssPlugin =
  (tailwindPostcssModule && tailwindPostcssModule.default) || tailwindPostcssModule;
// const envFile = `./.env.${process.env.NODE_ENV || "development"}`;
// require('dotenv').config({ path: envFile });

module.exports = (env) => {
  const nodeEnv = env.NODE_ENV || "development";
  const envPath = path.resolve(__dirname, `./.env.${nodeEnv}`);
  require('dotenv').config({ path: envPath });
  console.log('Build Context:', nodeEnv, 'Remote:', process.env.VITE_AUTH_MFE_REMOTE_URL);
  return {
    entry: "./src/index.tsx",
    output: {
      filename: "[name].[contenthash].js",
      path: path.resolve(__dirname, "dist"),
      publicPath: "/", // Important: "/" for host (relative paths work best in prod)
    },
    resolve: {
      extensions: [".tsx", ".ts", ".js"],
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    devtool: "source-map",
    module: {
      rules: [
        {
          test: /\.(ts|js)x?$/,
          exclude: /node_modules/,
          use: [
            {
              loader: "babel-loader",
              options: {
                presets: [
                  "@babel/preset-env",
                  "@babel/preset-react",
                  "@babel/preset-typescript",
                ],
              },
            },
          ],
        },
        {
          test: /\.(scss|css)$/i, // Updated to catch both .css and .scss
          use: [
            "style-loader",
            {
              loader: "css-loader",
              options: { importLoaders: 1 },
            },
            {
              loader: "postcss-loader",
              options: {
                postcssOptions: {
                  // Tailwind v4 PostCSS plugin (CJS/ESM-safe)
                  plugins: [tailwindPostcssPlugin],
                },
              },
            },
            "sass-loader",
          ],
        },
        {
          test: /\.(png|jpe?g|gif|svg)$/i,
          type: "asset/resource",
        },
      ],
    },
    plugins: [
      new CleanWebpackPlugin(),
      new HtmlWebpackPlugin({
        template: "index.html",
      }),
      new Dotenv({
        path: envPath,
        systemvars: true,
      }),
      new ModuleFederationPlugin({
        name: "shell",
        filename: "remoteEntry.js",
        remotes: {
          'AuthMFE': `auth_mfe@${process.env.VITE_AUTH_MFE_REMOTE_URL || 'http://localhost:3006'}/remoteEntry.js`,        // Add other remotes here as needed
          'visitlyAngular': 'visitlyAngular@http://localhost:4200/remoteEntry.js',
        },
        shared: {
          react: { singleton: true, requiredVersion: "^18.2.0" },
          "react-dom": { singleton: true, requiredVersion: "^18.2.0" },
          "react-router-dom": { singleton: true, requiredVersion: false },
          "react/jsx-runtime": { singleton: true, requiredVersion: false },
          zustand: { singleton: true, requiredVersion: "^5.0.10" },
          "@visitly/app-store": { singleton: true },
          "@tanstack/react-query": {
            singleton: true,
            requiredVersion: "^5.90.17"
          },
          "@visitly/api-client": { singleton: true }
        },
      }),

    ]
  }
};