import React from 'react';
import { Link } from 'react-router-dom';
import { useVerifyEmail } from '../hooks/useVerifyEmail';
const LOGO_URL = 'assets/images/logo.png';
export const VerifyEmail: React.FC = () => {
    console.log("VerifyEmail component rendered");
    const { isResendMail, handleResend, resendMutation } = useVerifyEmail();
    if (isResendMail) {
        return (
            <div className="tw:min-h-screen tw:bg-[#F8F9FB] tw:flex tw:flex-col tw:items-center tw:p-4" data-testid="check-inbox-page">
                <div className="tw:mt-12 tw:mb-12">
                    <img src={LOGO_URL} alt="Visitly Logo" className="tw:h-12 tw:w-auto" data-testid="logo" />
                </div>
                <div className="tw:max-w-md tw:w-full tw:bg-white tw:p-8 tw:rounded-lg tw:shadow-md tw:text-center"
                    style={{ boxShadow: '0 0 5px 0 rgb(159, 159, 159)' }}
                    data-testid="check-inbox-container">
                    <h2 className="tw:text-lg tw:font-bold tw:text-gray-900 tw:mb-4" data-testid="page-title">
                        Check your Inbox
                    </h2>
                    <p className="tw:text-gray-500 tw:text-sm tw:leading-relaxed tw:mb-8" data-testid="instruction-text">
                        To activate your account click the link in the confirmation email we've just sent you.
                    </p>
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
    }
    return (
        <div className="tw:min-h-screen tw:bg-[#F8F9FB] tw:flex tw:flex-col tw:items-center tw:p-4" data-testid="verify-email-page">
            <div className="tw:mt-12 tw:mb-12">
                <img src={LOGO_URL} alt="Visitly Logo" className="tw:h-12 tw:w-auto" data-testid="logo" />
            </div>
            <div className="tw:max-w-md tw:w-full tw:bg-white tw:p-8 tw:rounded-lg tw:shadow-md tw:text-center"
                style={{ boxShadow: '0 0 5px 0 rgb(159, 159, 159)' }}
                data-testid="verify-email-container">
                <h2 className="tw:text-lg tw:font-bold tw:text-gray-900 tw:mb-4" data-testid="page-title">
                    Verify Your Email
                </h2>
                <p className="tw:text-gray-500 tw:text-sm tw:leading-relaxed tw:mb-8" data-testid="instruction-text">
                    Check your email for a confirmation link to reset your password.
                </p>
                <div className="tw:mb-8">
                    <p className="tw:text-gray-600 tw:text-sm" data-testid="resend-prompt-text">
                        Haven't received your email yet?{' '}
                        <button
                            onClick={handleResend}
                            disabled={resendMutation.isPending}
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
