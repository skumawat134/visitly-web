import React from 'react';
import ReactDOM from 'react-dom';
import * as JSXRuntime from 'react/jsx-runtime';

// Ensure globals are set immediately (before other imports in bootstrap)
(window as any).React = React;
(window as any).ReactDOM = ReactDOM;
(window as any).JSXRuntime = JSXRuntime;

console.log('[Shell] Globals initialized');
