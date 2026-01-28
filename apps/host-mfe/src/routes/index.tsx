import React from 'react';
import {BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';


function AppRouter() {
  return (
    //  <BrowserRouter>
      <Routes>  
      
        <Route path="/" element={<Navigate to="login" replace />} />

      </Routes>
      // </BrowserRouter>
   
  );
}

export default AppRouter;
