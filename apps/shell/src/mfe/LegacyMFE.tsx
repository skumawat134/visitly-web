import React, { useEffect } from 'react';
import { MFEWrapper } from './hoc/MfeWrapper';
import { useAngularURLSync } from '../shared/hooks/useAngularURLSync';

const AngularApp = React.lazy(() => import('./AngularApp'));

export default function LegacyMFE() {
    useAngularURLSync();

    return (
        <MFEWrapper
            mfe={AngularApp}
            fallback={<div>Loading authentication…</div>}
        />
    );
}
