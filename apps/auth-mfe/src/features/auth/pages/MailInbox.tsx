import React from 'react';
import { Link } from 'react-router-dom';
import { useMailInbox } from '../hooks/useMailInbox';
const LOGO_URL = 'assets/images/logo.png';
export const MailInbox = () => {
    const { email, handleResend, resendMutation } = useMailInbox();
    return (
        <div className="tw:min-h-screen tw:bg-[#F8F9FB] tw:flex tw:flex-col tw:items-center tw:p-4">
            <div className="tw:mt-12 tw:mb-12">
                <img src={LOGO_URL} alt="Visitly Logo" className="tw:h-12 tw:w-auto" data-testid="logo-image" />
            </div>
            <div className="tw:max-w-md tw:w-full tw:bg-white tw:p-8 tw:rounded-lg tw:shadow-md tw:text-center"
                style={{ boxShadow: '0 0 5px 0 rgb(159, 159, 159)' }}
                data-testid="mail-inbox-container">
                <h2 className="tw:text-lg tw:font-bold tw:text-gray-900 tw:mb-4" data-testid="form-title">
                    Check your Inbox!
                </h2>
                <p className="tw:text-gray-500 tw:text-sm tw:leading-relaxed tw:mb-8" data-testid="form-description">
                    Check your email for a confirmation link to reset your password.
                </p>
                <div className="tw:mb-8">
                    <p className="tw:text-gray-600 tw:text-sm" data-testid="email-not-received">
                        Haven't received your email yet?{' '}
                        <button
                            onClick={handleResend}
                            disabled={resendMutation.isPending || !email}
                            className="tw:text-[#4c32e9] tw:font-bold tw:hover:tw:underline tw:bg-transparent tw:border-none tw:p-0 tw:cursor-pointer tw:disabled:tw:opacity-50"
                            data-testid="try-again-link"
                        >
                            {resendMutation.isPending ? 'Resending...' : 'Try Again'}
                        </button>
                    </p>
                </div>
                <div className="tw:flex tw:justify-center">
                    <Link
                        to="/visitly/login"
                        className="tw:w-3/4 tw:bg-[#4c32e9] tw:hover:tw:bg-[#3b27b8] tw:text-white tw:py-3 tw:rounded-md tw:font-medium tw:transition-colors tw:shadow-sm"
                        data-testid="return-to-login-button"
                    >
                        Return to log in
                    </Link>
                </div>
            </div>
        </div>
    );
};
