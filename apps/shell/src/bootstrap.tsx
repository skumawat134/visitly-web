// shell-app/src/index.tsx

// shell-app/src/bootstrap.tsx
import './init-globals';
import React from 'react';
import ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';
import * as JSXRuntime from 'react/jsx-runtime';

import "./styles/global.css";
import "@visitly/ui/styles.css";
import App from '@/App';
import { middlewareService } from './shared/services/middleware.service';
import { registerServiceWorker } from './serviceWorkerRegistration';

// Initialize Middleware RUM for tracing
middlewareService.initialize();

const root = createRoot(document.getElementById('root')!);
root.render(<App />)

// Register service worker (production only, mirrors Angular's registerWhenStable:30000)
registerServiceWorker();