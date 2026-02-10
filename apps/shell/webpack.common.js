const { baseConfig } = require("@visitly/webpack-config");
const { ModuleFederationPlugin } = require("webpack").container;
const { sharedDeps } = require("@visitly/webpack-config");
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require("path");
module.exports = (env) => {
  const base = baseConfig(env);
  const nodeEnv = env.NODE_ENV || "development";
  const envPath = path.resolve(__dirname, `./.env.${nodeEnv}`);
  require('dotenv').config({ path: envPath });
  
  return {
    ...base,
    entry: "./src/index.tsx", // can keep or override
    plugins: [
      ...base.plugins,
      new ModuleFederationPlugin({
        name: "shell",
        filename: "remoteEntry.js",
        remotes: {
          AuthMFE: `auth_mfe@${process.env.VITE_AUTH_MFE_REMOTE_URL}`,
          visitlyAngular: `visitlyAngular@${process.env.VITE_ANGULAR_MFE_REMOTE_URL}`,
          HOSTMFE : `host_mfe@${process.env.VITE_HOST_MFE_REMOTE_URL}`,
          INTEGRATIONMFE : `integration_mfe@${process.env.VITE_INTEGRATION_MFE_REMOTE_URL}`
        },
        shared: sharedDeps,
      }),
      new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'src/assets'),
          to: 'assets'   // 👈 appears as /assets in dist
        }
      ]
    }),
    ],
  };
};