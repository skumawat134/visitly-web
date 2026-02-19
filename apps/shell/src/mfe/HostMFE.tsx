import React from 'react';
import { MFEWrapper } from './hoc/MfeWrapper';

const HostMfeRemote = React.lazy(() => import('HOSTMFE/AppRouter'));

export default function HostMFE() {
  return (
    <MFEWrapper
      mfe={HostMfeRemote}
    />
  );
}
