import React from 'react';
import { Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useForgotPassword } from '../hooks/useForgotPassword';
import appLogo from '@/assets/images/logo.png';
import { useDebounce } from '@visitly/shared-core';

export const ForgotPassword: React.FC = () => {
    const {
        isSSOLoginEnabled,
        checkIsSSOAvailable,
        handleSSO,
        sendEvent,
        forgotPwdMutation
    } = useForgotPassword();
    const formik = useFormik({
        initialValues: {
            email: '',
        },
        validationSchema: Yup.object({
            email: Yup.string()
                .matches(
                    /^[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,50}$/,
                    'Please enter a valid Email.'
                )
                .required('Email is required!'),
        }),
        onSubmit: (values) => {
            if (isSSOLoginEnabled) {
                handleSSO();
            } else {
                sendEvent('recover password button');
                forgotPwdMutation.mutate({ email: values.email });
            }
        },
    });

    // Use shared debounce hook
    const debouncedEmail = useDebounce(formik.values.email, 500);

    React.useEffect(() => {
        if (!formik.errors.email && debouncedEmail) {
            checkIsSSOAvailable(debouncedEmail);
        }
    }, [debouncedEmail, formik.errors.email, checkIsSSOAvailable]);

    const handleEmailBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        formik.handleBlur(e);
        // Fallback check on blur
        if (!formik.errors.email && formik.values.email) {
            checkIsSSOAvailable(formik.values.email);
        }
    };
    return (
        <div className="tw:min-h-screen tw:bg-[#F8F9FB] tw:flex tw:flex-col tw:items-center tw:p-4" data-testid="forgot-password-page">
            {/* <div className='tw:h-[100vh] tw:w-[100vw] tw:flex tw:flex-col tw:items-center tw:justify-center'> */}
            <div className="tw:mt-12">
                <img src={appLogo} alt="Visitly Logo" className="tw:h-12 tw:w-auto" data-testid="logo" />
            </div>
            <div className="tw:max-w-3xl tw:mt-12 tw:w-full tw:bg-[#fff] tw:p-8 tw:rounded-lg tw:shadow-xl" data-testid="forgot-password-form-container">
                <div className=" tw:mb-4">
                    <h2 className=" tw:text-center tw:text-2xl tw:font-bold tw:text-gray-900 tw:mb-3" data-testid="page-title">Reset Password</h2>
                    <p className="tw:text-gray-500 tw:text-[14px] tw:leading-relaxed" data-testid="instruction-text">
                        Enter the email associated with your account and we'll send an email with instruction to reset your password.
                    </p>
                </div>
                <form onSubmit={formik.handleSubmit} className="tw:space-y-6" data-testid="forgot-password-form">
                    <div>
                        <label htmlFor="email" className="tw:block tw:text-sm tw:font-medium tw:text-[#111111] tw:mb-2" data-testid="email-label">
                            Email address
                        </label>
                        <div className="tw:flex tw:gap-3">
                            <div className="tw:flex-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    onChange={formik.handleChange}
                                    onBlur={handleEmailBlur}
                                    value={formik.values.email}
                                    placeholder=""
                                    className={`tw:w-full tw:p-2 tw:border tw:rounded-md tw:outline-none tw:transition-all ${formik.touched.email && formik.errors.email
                                        ? 'tw:border-red-500 tw:focus:tw:ring-1 tw:focus:tw:ring-red-500'
                                        : 'tw:border-gray-300 tw:focus:tw:ring-1 tw:focus:tw:ring-[#4c32e9]'
                                        }`}
                                    data-testid="email-input"
                                />
                            </div>
                            <button
                                type={isSSOLoginEnabled ? "button" : "submit"}
                                onClick={isSSOLoginEnabled ? handleSSO : undefined}
                                disabled={!formik.isValid || !formik.values.email || forgotPwdMutation.isPending}
                                className={`
                                    tw:flex tw:items-center tw:justify-center tw:transition-all tw:duration-200 tw:rounded-md tw:font-medium
                                    ${isSSOLoginEnabled
                                        ? 'tw:bg-[#4c32e9] tw:hover:tw:bg-[#3b27b8] tw:text-white tw:px-8 tw:py-3'
                                        : 'tw:bg-primary-100 tw:hover:tw:bg-[#3b27b8] tw:text-white tw:px-6 tw:py-2'}
                                    tw:disabled:tw:opacity-50 tw:disabled:tw:cursor-not-allowed
                                `}
                                data-testid={isSSOLoginEnabled ? "sso-continue-button" : "reset-password-button"}
                            >
                                {isSSOLoginEnabled ? 'Continue' : (forgotPwdMutation.isPending ? 'Sending...' : 'Send')}
                            </button>
                        </div>
                        {formik.touched.email && formik.errors.email && (
                            <p className="tw:text-red-500 tw:text-xs tw:mt-1" data-testid="email-invalid-error">
                                {formik.errors.email}
                            </p>
                        )}
                    </div>
                    {isSSOLoginEnabled && (
                        <div className="tw:flex tw:justify-center tw:items-center tw:text-gray-600 tw:text-sm" data-testid="sso-enabled-indicator">
                            <span className="tw:flex tw:items-center tw:gap-2">
                                <span className="tw:w-4 tw:h-4 tw:bg-gray-200 tw:rounded-full tw:flex tw:items-center tw:justify-center">
                                    <i className="fa fa-lock tw:text-[10px]"></i>
                                </span>
                                Single sign-on enabled
                            </span>
                        </div>
                    )}
                    <div className="">
                        <p className="tw:text-[#111111] tw:text-sm tw:fw-[400]" data-testid="login-redirect-text">
                            Wait, I remember my password!{' '}
                            <Link
                                to="/visitly/login"
                                onClick={() => sendEvent('signin')}
                                className="tw:text-[#4c32e9] tw:font-bold tw:hover:tw:underline"
                                data-testid="login-link"
                            >
                                Login
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
            {/* </div> */}
        </div>
    );
};

;
