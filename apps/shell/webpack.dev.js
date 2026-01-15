const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");
const Dotenv = require("dotenv-webpack");
const path = require("path");
module.exports = (env) => {
    return merge(common(env), {
        mode: "development",
        devtool: "eval-source-map", // faster rebuilds
        devServer: {
            static: "./dist",
            hot: true,
            historyApiFallback: true,
            port: 3000,
            open: true,
            // Optional: proxy API calls to backend
            // proxy: { "/api": "http://localhost:5000" },
            headers: {
                "Access-Control-Allow-Origin": "*",
            },
        },
        plugins: [
            new Dotenv({
                path: path.resolve(__dirname, `./.env.${process.env.APP_ENV || 'development'}`),
            }),
        ],
    }
    )
}