import React from 'react';
import Home from '../components/Home';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AuthMFE from '../mfe/AuthMFE';
import Header from '@/components/Header';

// const AuthMFE = React.lazy(() => import('AuthM FE/AppRouter'));

function AppRouter() {
  return (
    <>
    <BrowserRouter>
    <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth/*" element={<AuthMFE />} />
        </Routes>
    </BrowserRouter>
    </>
  );
}

export default AppRouter;


