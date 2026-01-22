import React from 'react';
import Home from '../components/Home';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthMFE from '../mfe/AuthMFE';
import Header from '@/components/Header';
import { useState } from 'react';
import LegacyMFE from '@/mfe/LegacyMFE';
import  { RequireCapability } from '@/providers/RequireCapability';
import AppLayout from '@/providers/AppLayout';
import AuthInitializer from '@/providers/AuthInitializer';
import { NavigationResolver } from '@/providers/NavigationResolver';

// const AuthMFEggg = React.lazy(() => import('AuthM FE/AppRouter'));

function AppRouter() {
  return (
    <>
      <BrowserRouter>
        {/* <Header />  */}
         <AuthInitializer />      
        <NavigationResolver />     
        <Routes>
          {/* <Route path="/visitly/" element={<LegacyMFE />} /> */}
          <Route path="/" element={<Navigate to="/visitly" replace />} />
          <Route path="/visitly/*" element={<AuthMFE />} />
          <Route element={<AppLayout />}>
            <Route path="/admin/*" element={
              <RequireCapability  cap="ADMIN_ACCESS">
                <LegacyMFE />
              </RequireCapability>
            } />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default AppRouter;


