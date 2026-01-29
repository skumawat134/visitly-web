import { MyDeliveries } from '@/features/my-deliveries';
import HostLayout from '@/layout';
import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';


function AppRouter() {
  return (
    <Routes>
      <Route element={<HostLayout />}>
        <Route path="/" index element={<MyDeliveries />} />
        {/* <Route path="/work_area/evacuation/past-visitors" element={<Dashboard />} />
        <Route path="/work_area/evacuation/my-sign-in-log" element={<Dashboard />} />
        <Route path="/work_area/evacuation/my-deliveries" element={<Dashboard />} />
        <Route path= "/work_area/evacuation/directory" element={<Dashboard />} /> */}

      </Route>
    </Routes>

  );
}

export default AppRouter;
