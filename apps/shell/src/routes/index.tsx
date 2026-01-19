import React from 'react';
import Home from '../components/Home';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthMFE from '../mfe/AuthMFE';
import Header from '@/components/Header';
import { useState } from 'react';
import LegacyMFE from '@/mfe/LegacyMFE';

// const AuthMFEggg = React.lazy(() => import('AuthM FE/AppRouter'));

function AppRouter() {
  return (
    <>
    <BrowserRouter>
     {/* <Header />  */}
        <Routes>
          {/* <Route path="/visitly/" element={<LegacyMFE />} /> */}
          <Route path="/" element={<Navigate to="/visitly" replace />} />
          <Route path="/visitly/*" element={<AuthMFE />} />
          <Route path="/admin/*" element={<LegacyMFE />} />
        </Routes>
    </BrowserRouter>
    </>
  );
}

export default AppRouter;


