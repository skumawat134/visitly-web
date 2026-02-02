import React, { Suspense, LazyExoticComponent } from 'react';
import { MFEErrorBoundary } from './MFEErrorBoundary';
import FullScreenLoader from '@/shared/components/FullScreenLoader';
import MFEErrorFallback from './MFEErrorFallback';

type MFEWrapperProps = {
  mfe: LazyExoticComponent<React.ComponentType<any>>;
  fallback?: React.ReactNode;
};

export function MFEWrapper({ mfe: MFE, fallback }: MFEWrapperProps) {
  return (
    <MFEErrorBoundary
      fallback={
        fallback ?? <MFEErrorFallback
        title="Page failed to load"
        description="This section couldn’t be loaded right now. Please try again."
      />
      }
    >
      <Suspense fallback={<FullScreenLoader forceShow/>}>
        <MFE />
      </Suspense>
    </MFEErrorBoundary>
  );
}
