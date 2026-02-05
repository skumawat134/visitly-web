import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthMFE from '../mfe/AuthMFE';
import LegacyMFE from '@/mfe/LegacyMFE';
import { RequireCapability } from '@/providers/RequireCapability';
import AppLayout from '@/providers/AppLayout';
import AuthInitializer from '@/providers/AuthInitializer';
import { NavigationResolver } from '@/providers/NavigationResolver';
import NotFound from '@/shared/components/NotFound';
import { PermaVisitsRedirect, SamlRedirect } from '@/redirects';
import HostMFE from '@/mfe/HostMFE';
import HostLayout from '@/layout/HostLayout';
import  SwitchRole  from '../shared/components/SwitchRole'

// const AuthMFEggg = React.lazy(() => import('AuthM FE/AppRouter'));

function AppRouter() {
  console.warn("process.env.VITE_ANGULAR_MFE_REMOTE_URL", process.env.VITE_ANGULAR_MFE_REMOTE_URL)
    console.warn("process.env.VITE_HOST_MFE_REMOTE_URL", process.env.VITE_HOST_MFE_REMOTE_URL)
  return (
    <>
      <BrowserRouter>
        <AuthInitializer />
        <NavigationResolver />
        <Routes>
          <Route path="/" element={<Navigate to="/visitly" replace />} />
          <Route path="/visitly/*" element={<AuthMFE />} />
          <Route element={<AppLayout />}>
            <Route path="/admin/*" element={
              <RequireCapability cap="ADMIN_ACCESS">
                <LegacyMFE />
              </RequireCapability>
            } />
          </Route>
          <Route element={<HostLayout />}>
          <Route path="/host/*" element ={<HostMFE />} />
          </Route>
          
          <Route path='/dashboard/wallboard' element={<Navigate to="/admin/dashboard/wallboard" replace />} />
          <Route path='/impersonate/user' element={<Navigate to="/admin/impersonate/user" replace />} />
          <Route path="/saml" element={<SamlRedirect />} />
          <Route path="/permaVisits/*" element={<PermaVisitsRedirect />} />
          <Route path="/switch" element={<SwitchRole />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default AppRouter;


