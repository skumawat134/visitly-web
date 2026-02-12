import CompanyDirectory from '@/features/company-directory/pages/CompanyDirectory';
import { MyDeliveryLogs } from '@/features/my-deliveries';
import { PastVisitors } from '@/features/past-visitors';
import { UpcomingVisitors } from '@/features/upcomming-visitors';
import HostLayout from '@/layout';
import { Route, Routes } from 'react-router-dom';
import { MySignInLog } from '@/features/signin-log';
import { ChangePassword } from '@/features/change-password';
import { Profile } from '@/features/profile'
import { HostDashboard } from '@/features/host-dashboard';
import { VisitorDetail } from '@/features/visitor-detail';

function AppRouter() {
  return (
    <div data-test-id="host-mfe-app-router-root">
      <Routes>
        <Route element={<HostLayout />}>
        <Route path="/dashboard" index element={<HostDashboard />} />
        <Route path="/upcoming-visitors" index element={<UpcomingVisitors />} />
        <Route path="/past-visitors" element={<PastVisitors />} />
        <Route path="/my-sign-in-log" element={<MySignInLog />} />
        <Route path="/my-deliveries" element={<MyDeliveryLogs />} />
        <Route path="/directory" element={<CompanyDirectory />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/visitor-detail/:id" element={<VisitorDetail/>} />
       </Route>
      </Routes>
    </div>

  );
}

export default AppRouter;
