import React, { useEffect } from 'react';
import { MFEWrapper } from './hoc/MfeWrapper';

const AngularApp = React.lazy(() => import('./AngularApp'));

export default function LegacyMFE() {
    return (
        <MFEWrapper
            mfe={AngularApp}
        />
    );
}
