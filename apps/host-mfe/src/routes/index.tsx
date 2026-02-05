import CompanyDirectory from '@/features/company-directory/pages/CompanyDirectory';
import { MyDeliveryLogs } from '@/features/my-deliveries';
import { PastVisitors } from '@/features/past-visitors';
import { UpcomingVisitors } from '@/features/upcomming-visitors';
import HostLayout from '@/layout';
import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { MySignInLog } from '@/features/signin-log';
import { ChangePassword } from '@/features/change-password';
import { Profile } from '@/features/profile'


function AppRouter() {
  return (
    <div data-test-id="host-mfe-app-router-root">
      <Routes>
        <Route path="/upcoming-visitors" index element={<UpcomingVisitors />} />
         <Route path="/past-visitors" element={<PastVisitors />} />
        <Route path="/my-sign-in-log" element={<MySignInLog />} />
        <Route path="/my-deliveries" element={<MyDeliveryLogs />} />
        <Route path="/directory" element={<CompanyDirectory />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/profile" element={<Profile />} />

      </Routes>
    </div>
  );
}

export default AppRouter;
