
import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';



function AppRouter() {
  return (
    <div data-test-id="integration-mfe-app-router-root">
      <Routes>
        <Route path="/notifications" index  element ={<div>NotificaitonMfe</div>} />
      </Routes>
    </div>

  );
}

export default AppRouter;
