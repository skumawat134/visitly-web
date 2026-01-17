// shell-app/src/index.tsx

// shell-app/src/bootstrap.tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import "./styles/global.css";
import "@visitly/ui/styles.css";
import App from '@/App';
const root = createRoot(document.getElementById('root')!);
root.render(<App />)