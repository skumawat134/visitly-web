import React from 'react';
import { createRoot } from 'react-dom/client';
import AppRouter from './App'; // The component you are exposing

const root = createRoot(document.getElementById('root')!);
root.render(<AppRouter />);