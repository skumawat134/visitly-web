const sharedDeps = {
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
    "@visitly/api-client": { singleton: true },
    "framer-motion":{
         singleton: true,
        requiredVersion: "^12.34.2"   
     }
};

module.exports = {
    sharedDeps,
};