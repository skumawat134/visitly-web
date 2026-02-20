import React from "react";
import { RouterProvider } from "react-router-dom";
import { QueryClient } from "./providers/QueryClient";
import { ToastProvider } from "./providers/ToastProvider";
import { router } from "./router";

const App = () => {
  console.log("shell v3")
  console.log("shell-v4")
  return (
    <QueryClient>
      <RouterProvider router={router} />
      <ToastProvider />
    </QueryClient>
  );
}

export default App;
