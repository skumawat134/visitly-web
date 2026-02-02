import { MyDeliveries } from '@/features/my-deliveries';
import { PastVisitors } from '@/features/past-visitors';
import HostLayout from '@/layout';
import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';


function AppRouter() {
  return (
    <Routes>
        <Route path="work_area/evacuation/upcoming-visitors" index element={<MyDeliveries />} />
        <Route path="work_area/evacuation/past-visitors" element={<PastVisitors />} />
        <Route path="work_area/evacuation/my-sign-in-log" element={<MyDeliveries />} />
        <Route path="work_area/evacuation/my-deliveries" element={<MyDeliveries />} />
        <Route path="work_area/evacuation/directory" element={<MyDeliveries />} />

    </Routes>

  );
}

export default AppRouter;
