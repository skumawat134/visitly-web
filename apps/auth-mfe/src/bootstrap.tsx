import React from 'react';
import { createRoot } from 'react-dom/client';
import AppRouter from './App'; // The component you are exposing
import "./styles/global.css";
// import "@repo/ui/styles.css";
const root = createRoot(document.getElementById('root')!);
root.render(<AppRouter />);