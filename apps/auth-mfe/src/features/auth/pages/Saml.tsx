import React from 'react';
import { useSaml } from '../hooks/useSaml';

const LOGO_URL = 'assets/images/logo.png';

const Saml: React.FC = () => {
    const { loading, failedSaml } = useSaml();

    if (failedSaml) {
        return (
            <div className="tw:min-h-screen tw:h-[100vh] tw:bg-[#F8F9FB] tw:flex tw:justify-center tw:items-center tw:pt-12" data-testid="saml-failure-wrapper">
                <div className="tw:container tw:max-w-xl tw:px-4" data-testid="saml-failure-container">
                    <div className="tw:bg-white tw:p-8 tw:rounded-[10px]"
                        style={{ boxShadow: '0 0 5px 0 rgb(137, 137, 137)' }}
                        data-testid="saml-failure-card">

                        <div className="tw:flex tw:justify-start tw:mb-6" data-testid="logo-section">
                            <img src={LOGO_URL} alt="Visitly Logo" className="tw:h-9 tw:w-auto" data-testid="visitly-logo" />
                        </div>

                        <div data-testid="auth-content">
                            <div className="tw:mb-12" data-testid="error-message-section">
                                <h2 className="tw:text-xl tw:font-bold tw:text-gray-900 tw:mb-2" data-testid="error-title">
                                    Authentication Failed
                                </h2>
                                <p className="tw:text-gray-500 tw:text-sm tw:leading-relaxed" data-testid="error-description">
                                    Single Sign-On failed, We have encountered an error. If the problem persists, please contact Visitly Support at support@visitly.io.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return null;
};
export default Saml;