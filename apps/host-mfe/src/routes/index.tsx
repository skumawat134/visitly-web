import CompanyDirectory from '@/features/company-directory/pages/CompanyDirectory';
import { MyDeliveryLogs } from '@/features/my-deliveries';
import { PastVisitors } from '@/features/past-visitors';
import HostLayout from '@/layout';
import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { MySignInLog } from '@/features/signin-log';


function AppRouter() {
  return (
    <Routes>
        <Route path="work_area/evacuation/upcoming-visitors" index element={<MyDeliveryLogs />} />
        <Route path="work_area/evacuation/past-visitors" element={<PastVisitors />} />
        <Route path="work_area/evacuation/my-sign-in-log" element={<MySignInLog />} />
        <Route path="work_area/evacuation/my-deliveries" element={<MyDeliveryLogs />} />
        <Route path="work_area/evacuation/directory" element={<CompanyDirectory />} />

    </Routes>

  );
}

export default AppRouter;
