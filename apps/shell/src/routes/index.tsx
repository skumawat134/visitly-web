import React from 'react';
import Home from '../components/Home';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthMFE from '../mfe/AuthMFE';
import Header from '@/components/Header';
import { useState } from 'react';
import LegacyMFE from '@/mfe/LegacyMFE';
import NotFound from '@/components/NotFound';

// const AuthMFEggg = React.lazy(() => import('AuthM FE/AppRouter'));

function AppRouter() {
  return (
    <>
    <BrowserRouter>
     {/* <Header />  */}
        <Routes>
          <Route path="/" element={<Navigate to="/visitly" replace />} />
          <Route path="/visitly/*" element={<AuthMFE />} />
          <Route path="/admin/*" element={<LegacyMFE />} />
          <Route path="/saml" element={<Navigate to="/visitly/saml" replace />} />
          <Route path="*" element = {<NotFound />} />
        </Routes>
    </BrowserRouter>
    </>
  );
}

export default AppRouter;


