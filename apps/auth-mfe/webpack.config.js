// const path = require('path');
// const HtmlWebpackPlugin = require('html-webpack-plugin');
// const WorkboxWebpackPlugin = require('workbox-webpack-plugin');

// const isProduction = process.env.NODE_ENV === 'production';
// const stylesHandler = 'style-loader';

// const config = {
//   entry: './src/index.tsx',

//   output: {
//     path: path.resolve(__dirname, 'dist'),
//     publicPath: 'auto',
//     clean: true,
//   },

//   devServer: {
//     open: true,
//     host: 'localhost',
//     port: 8080,
//     historyApiFallback: true,
//   },

//   plugins: [
//     new HtmlWebpackPlugin({
//       template: 'index.html',
//     }),
//   ],

//   module: {
//     rules: [
//       {
//         test: /\.(js|jsx)$/,
//         exclude: /node_modules/,
//         use: {
//           loader: 'babel-loader',
//           options: {
//             presets: ['@babel/preset-env', '@babel/preset-react'],
//           },
//         },
//       },
//       {
//         test: /\.(ts|tsx)$/,
//         exclude: /node_modules/,
//         use: {
//           loader: 'ts-loader',
//           options: {
//             transpileOnly: true,
//           },
//         },
//       },
//       {
//         test: /\.css$/i,
//         use: [stylesHandler, 'css-loader'],
//       },
//       {
//         test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
//         type: 'asset',
//       },
//     ],
//   },

//   resolve: {
//     alias: {
//       '@': path.resolve(__dirname, './src/'),
//       react: path.resolve(__dirname, 'node_modules/react'),
//       'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
//     },
//     extensions: ['.ts', '.tsx', '.js', '.jsx'],
//   },
// };

// module.exports = () => {
//   config.mode = isProduction ? 'production' : 'development';

//   if (isProduction) {
//     config.plugins.push(new WorkboxWebpackPlugin.GenerateSW());
//   }

//   return config;
// };

const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const {ModuleFederationPlugin} = require("webpack").container;
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
module.exports = {
  entry: "./src/index.tsx",
  output: {
    filename: "[name].[contenthash].js",
    path: path.resolve(__dirname, "dist"),
    publicPath: "auto",
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
            
        ],
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: "asset/resource",
        generator: {
          filename: 'assets/[hash][ext][query]'
        }
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
      exposes: {
          // './Login': './src/Login',
          // './About': './src/components/About',
          './AppRouter': './src/App',
      },
      shared: {
          react: { singleton: true, requiredVersion: '^18.2.0' },
          'react-router-dom': { singleton: true, requiredVersion: false },
          "react-dom": { singleton: true, requiredVersion: '^18.2.0' },
          'react/jsx-runtime': {
            singleton: true,
            requiredVersion: false,
          },
          zustand: { singleton: true, requiredVersion: '^5.0.10'},
          "@visitly/app-store" : {singleton : true},
          "@visitly/api-client": { singleton: true },
          "@tanstack/react-query": {
            singleton: true,
            requiredVersion: "^5.90.17"
          },
      },
  }),
  new BundleAnalyzerPlugin({
    analyzerMode: 'static',           // or 'server'
    openAnalyzer: true,
    reportFilename: 'bundle-report.html'
  })
  ],
  devServer: {
     proxy: [
             {
               context: ['/assets', '/styles.css','/data-table.woff','/data-table.ttf'],
               target: 'http://localhost:4200', // Redirect requests for /assets to the Auth MFE
               changeOrigin: true,
             },
           ],
    static: "./dist",
    hot: true,
    historyApiFallback: true,
    port: 3006,
    open: true,
  },
  
  mode: "development",
};