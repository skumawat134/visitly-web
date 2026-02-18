import React from 'react'
import { Navigate, useLocation } from 'react-router-dom';

const WallboardRedirect = () => {
   const { search } = useLocation();

  return <Navigate to={`/admin/dashboard/wallboard`} replace />;

}

export default WallboardRedirect