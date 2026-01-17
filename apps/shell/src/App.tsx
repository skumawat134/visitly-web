import React from "react";
import AppRouter from "./routes";
import { QueryClient } from "./providers/QueryClient";

const App = () => {
  return (
    <QueryClient>
      <AppRouter />
    </QueryClient>
  );
}

export default App;
