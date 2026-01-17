// shell-app/src/index.tsx

// shell-app/src/bootstrap.tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import AppRouter from './routes/index';
import "./styles/global.css";
import "@visitly/ui/styles.css";
const root = createRoot(document.getElementById('root')!);
root.render(<AppRouter/>);