const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const Dotenv = require("dotenv-webpack");
const { postcssTailwindPlugin } = require("./postcss.tailwind");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const appRoot = process.cwd();
module.exports = (env = {}) => {
    const nodeEnv = env.NODE_ENV || "development";
    const envPath = path.resolve(process.cwd(), `.env.${nodeEnv}`);
    return {
        entry: "./src/index.tsx", // most will override this

        output: {
            filename: "[name].[contenthash].js",
            path: path.resolve(process.cwd(), "dist"),
            publicPath: "auto",
        },

        resolve: {
            extensions: [".tsx", ".ts", ".js"],
            alias: {
                "@": path.resolve(process.cwd(), "src"),
            },
        },

        devtool: "source-map",

        module: {
            rules: [
                {
                    test: /\.(js|jsx|ts|tsx)$/,
                    type: "javascript/auto",
                    include: [
                      path.join(appRoot, "src"),
                      path.join(appRoot, "../../packages")
                    ],
                    exclude: /node_modules/,
                    use: {
                      loader: "babel-loader",
                      options: {
                        presets: [
                          ["@babel/preset-env", { modules: false }],
                          "@babel/preset-react",
                          "@babel/preset-typescript"
                        ],
                        cacheDirectory: true,
                        cacheCompression: false
                      }
                    }
                  },
                {
                    test: /\.(scss|css)$/i,
                    use: [
                        process.env.NODE_ENV === "production"
                            ? MiniCssExtractPlugin.loader
                            : "style-loader",
                        {
                            loader: "css-loader",
                            options: { importLoaders: 1 },
                        },
                        {
                            loader: "postcss-loader",
                            options: {
                                postcssOptions: {
                                    plugins: [postcssTailwindPlugin],
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
                template: "./index.html", // apps can override via merge
            }),
            new Dotenv({
                path: envPath,
                systemvars: true,
            }),
        ],
    };
};