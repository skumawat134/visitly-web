import React from 'react';
import { MFEWrapper } from './hoc/MfeWrapper';
import { useAuthStyles } from './hooks/useAuthStyles';

const AuthApp = React.lazy(() => import('AuthMFE/AppRouter'));

export default function AuthMFE() {
  // useAuthStyles();
  return (
    <MFEWrapper
      mfe={AuthApp}
      fallback={<div>Loading authentication…</div>}
    />
  );
}
