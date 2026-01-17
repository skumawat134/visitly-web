import React from 'react';
import {BrowserRouter, Route, Routes } from 'react-router-dom';
import About from '@/shared/components/About';
import { LoginPage } from '@/features/auth';

function AppRouter() {
  return (
    //  <BrowserRouter>
      <Routes>
        {/* <Route path="/" element={<Home />} /> */}
        <Route path="login" element={<LoginPage />} />
        <Route path="about" element={<About msg="React" />} />
      </Routes>
      // </BrowserRouter>
   
  );
}

export default AppRouter;
