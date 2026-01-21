const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const { ModuleFederationPlugin } = require("webpack").container;
const tailwindPostcssModule = require("@tailwindcss/postcss");
const tailwindPostcssPlugin =
  (tailwindPostcssModule && tailwindPostcssModule.default) || tailwindPostcssModule;

module.exports = {
  entry: "./src/index.tsx",
  output: {
    filename: "[name].[contenthash].js",
    path: path.resolve(__dirname, "dist"),
    publicPath: "/",
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
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
        test: /\.css$/i,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              importLoaders: 1 // Crucial: passes @imports back to postcss-loader
            },
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
    new ModuleFederationPlugin({
      name: "auth_mfe",
      filename: "remoteEntry.js",
      remotes: {
        // 'LoginInHost': 'auth_mfe@http://localhost:3006/remoteEntry.js',
        // './About': './src/components/About',
        'AuthMFE': 'auth_mfe@http://localhost:3006/remoteEntry.js',

      },
      shared: {
        react: { singleton: true, requiredVersion: '^18.2.0' },
        "react-dom": { singleton: true, requiredVersion: '^18.2.0' },
        'react-router-dom': { singleton: true, requiredVersion: false },
        'react/jsx-runtime': {
          singleton: true,
          requiredVersion: false,
        },
        zustand: { singleton: true, requiredVersion: '^5.0.10' },
        "@visitly/app-store": { singleton: true }
      },
    }),
  ],
  devServer: {
    static: "./dist",
    hot: true,
    historyApiFallback: true,
    port: 3000,
    open: true,
  },
  mode: "development",
};
