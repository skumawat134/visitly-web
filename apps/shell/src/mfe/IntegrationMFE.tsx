import React from 'react';
import { MFEWrapper } from './hoc/MfeWrapper';

const IntegrationMfeRemote = React.lazy(() => import('INTEGRATIONMFE/AppRouter'));

export default function IntegrationMFE() {
  return (
    <MFEWrapper
      mfe={IntegrationMfeRemote}
    />
  );
}
