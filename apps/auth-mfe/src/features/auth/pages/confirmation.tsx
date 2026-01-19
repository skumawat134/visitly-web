import React from 'react';
import { Link } from 'react-router-dom';
import { useConfirm } from '../hooks/useConfirm';
import IdleConfirmation from '../components/IdleConfirmation';
import ErrorConfirmation from '../components/ErrorConfirmation';
import SuccessConfirmation from '../components/SuccessConfirmation';
// Assets (Assuming these exist or generic placeholders if not)

 const ConfirmationPage: React.FC = () => {
    const { viewState, email } = useConfirm();
    // -- RENDER STATES --
    // 1. IDLE STATE: "Check your email" (Register Confirm equivalent)
    if (viewState === 'idle') {
        return (
            <IdleConfirmation />
        );
    }
    // 2. ERROR STATE: Unauthorized / Invalid Link
    if (viewState === 'error') {
        return (
           <ErrorConfirmation />
        );
    }
    // 3. SUCCESS / VERIFYING STATE: Two-column layout  
    return (
     <SuccessConfirmation viewState={viewState} />
    );
};

export default ConfirmationPage;