import React from "react";
import AppRouter from "./routes";
import { QueryClient } from "./providers/QueryClient";
import { ToastProvider } from "./providers/ToastProvider";

const App = () => {
  return (
    <QueryClient>
      <AppRouter />
      <ToastProvider />
    </QueryClient>
  );
}

export default App;
