import React from 'react';
import Home from '../components/Home';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
          <Route path="/visitly/*" element={<AuthMFE />} />
        </Routes>
    </BrowserRouter>
    </>
  );
}

export default AppRouter;


