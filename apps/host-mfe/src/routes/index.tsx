import CompanyDirectory from '@/features/company-directory/pages/CompanyDirectory';
import { MyDeliveryLogs } from '@/features/my-deliveries';
import { PastVisitors } from '@/features/past-visitors';
// import { UpcomingVisitors } from '@/features/upcomming-visitors';
import UpcommingVisitors from '@/features/upcomming-visitors/pages/UpcommingVisitors';
import HostLayout from '@/layout';
import { Route, Routes } from 'react-router-dom';
import { MySignInLog } from '@/features/signin-log';
import { ChangePassword } from '@/features/change-password';
import { HostDashboard } from '@/features/host-dashboard';
import { VisitorDetail } from '@/features/visitor-detail';
import ProfileDetail from '@/features/profile-detail/pages/ProfileDetail';
import { BulkPreRegistration } from '@/features/upcomming-visitors/pages/BulkPreRegistration';

function AppRouter() {
  return (
    <div data-test-id="host-mfe-app-router-root">
      <Routes>
        <Route element={<HostLayout />}>
          <Route path="/dashboard" index element={<HostDashboard />} />
          <Route path="/upcoming-visitors" index element={<UpcommingVisitors />} />
          <Route path="/my-sign-in-log" element={<MySignInLog />} />
          <Route path="/my-deliveries" element={<MyDeliveryLogs />} />
          <Route path="/directory" element={<CompanyDirectory />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/profile" element={<ProfileDetail />} />
          <Route path="/visitor-detail/:id" element={<VisitorDetail />} />
          <Route path="/bulk-pre-register" element={<BulkPreRegistration />} />
        </Route>
      </Routes>
    </div>

  );
}

export default AppRouter;
