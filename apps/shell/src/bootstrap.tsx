// shell-app/src/index.tsx

// shell-app/src/bootstrap.tsx
import React from 'react';
import ReactDOM from 'react-dom';
import * as JSXRuntime from 'react/jsx-runtime';
import { createRoot } from 'react-dom/client';
(window).React = React;
(window).ReactDOM = ReactDOM;
(window as any).JSXRuntime = JSXRuntime;

import "./styles/global.css";
import "@visitly/ui/styles.css";
import App from '@/App';
import { middlewareService } from './shared/services/middleware.service';

// Initialize Middleware RUM for tracing
middlewareService.initialize();

const root = createRoot(document.getElementById('root')!);
root.render(<App />)