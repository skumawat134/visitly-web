import React, { Suspense, LazyExoticComponent } from 'react';
import { MFEErrorBoundary } from './MFEErrorBoundary';

type MFEWrapperProps = {
  mfe: LazyExoticComponent<React.ComponentType<any>>;
  fallback?: React.ReactNode;
};

export function MFEWrapper({ mfe: MFE, fallback }: MFEWrapperProps) {
  return (
    <MFEErrorBoundary
      fallback={
        fallback ?? <div>Something went wrong while loading module.</div>
      }
    >
      <Suspense fallback={fallback ?? <div>Loading module…</div>}>
        <MFE />
      </Suspense>
    </MFEErrorBoundary>
  );
}
