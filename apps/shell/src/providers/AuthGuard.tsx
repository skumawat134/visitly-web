import useFetchEntitlements from '@/shared/hooks/useFetchEntitlements';
import { useFetchUserInfo } from '@/shared/hooks/useFetchUserInfo';
import { useAuthStore } from '@visitly/app-store';
import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom';

const ProtectedRoute = () => {
    const { isAuthenticated, tokens } = useAuthStore();
    const { data: user, isError } = useFetchUserInfo();
    const entitlementsQuery = useFetchEntitlements(user?.orgId);    const accessToken = tokens.accessToken;
    const location = useLocation();
    console.log("data" , user,accessToken)
    // if (accessToken && (isError || !user)) {
    //     useAuthStore.getState().logout();
    //     return <Navigate to="/visitly" replace />;
    // }
    const isProtectedRoute = location.pathname.startsWith('/admin');
    if (isProtectedRoute && !isAuthenticated) {
        return <Navigate to="/visitly" replace state={{ from: location }} />;
    }
    return <Outlet />; 
  }  // ← renders the child <Route>s}

export default ProtectedRoute;