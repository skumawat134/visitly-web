const { baseConfig } = require("@visitly/webpack-config");
const { ModuleFederationPlugin } = require("webpack").container;
const { sharedDeps } = require("@visitly/webpack-config");

module.exports = (env) => {
  const base = baseConfig(env);
  return {
    ...base,
    entry: "./src/index.tsx", // can keep or override
    "externals": {
      "react": "React",
      "react-dom": "ReactDOM",
      "react/jsx-runtime": "JSXRuntime"
    },
    plugins: [
      ...base.plugins,
        new ModuleFederationPlugin({
          name: "auth_mfe",
          filename: "remoteEntry.js",
          exposes: {
            './AppRouter': './src/App',
          },
        shared: sharedDeps,
      }),
    ],
    devServer: {
      // proxy: [
      //   {
      //     context: ['/assets', '/styles.css', '/data-table.woff', '/data-table.ttf'],
      //     target: 'http://localhost:4200', // Redirect requests for /assets to the Auth MFE
      //     changeOrigin: true,
      //   },
      // ],
      static: "./dist",
      hot: true,
      historyApiFallback: true,
      port: 3006,
      open: true,
    },
    "mode" : "development"
  };
};