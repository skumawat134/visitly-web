import React from 'react';
import {BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import About from '@/shared/components/About';
import { LoginPage } from '@/features/auth';
import  SignupPage  from '../features/auth/pages/SignupPage';
import ConfirmationPage from '../features/auth/pages/confirmation';
import  {ForgotPassword}  from '../features/auth/pages/ForgotPassword';
import  ResetPassword  from '../features/auth/pages/ResetPassword';
import { MailInbox } from '../features/auth/pages/MailInbox';
import { VerifyEmail } from '../features/auth/pages/VerifyEmail';

function AppRouter() {
  return (
    //  <BrowserRouter>
      <Routes>  
        {/* <Route path="/" element={<Home />} /> */}
        <Route path="/" element={<Navigate to="login" replace />} />
        <Route path="login" element={<LoginPage />} />
         <Route path="signup" element={<SignupPage />} />
         <Route path="confirmation" element={<ConfirmationPage />} />
         <Route path="forgot-password" element={<ForgotPassword />} />
         <Route path="reset-password" element={<ResetPassword />} />
         <Route path='mail-inbox' element={ <MailInbox /> } />
         <Route path='verify-email' element={ <VerifyEmail /> } />
      </Routes>
      // </BrowserRouter>
   
  );
}

export default AppRouter;
