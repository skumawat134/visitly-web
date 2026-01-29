import React from 'react';
import { MFEWrapper } from './hoc/MfeWrapper';

const AuthApp = React.lazy(() => import('AuthMFE/AppRouter'));

export default function AuthMFE() {
  return (
    <MFEWrapper
      mfe={AuthApp}
    />
  );
}
