import React from "react";
import AppRouter from "./routes";
import { QueryClient } from "./providers/QueryClient";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const App = () => {
  return (
    <QueryClient>
      
      <AppRouter />
      <ToastContainer 
        pauseOnFocusLoss={false}
        newestOnTop
        closeOnClick
      />
    </QueryClient>
  );
}

export default App;
