import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useResetPassword, } from '../hooks/useResetPassword';
import { Eye, EyeOff } from 'lucide-react';
import appLogo from '@/assets/images/logo.png';
const ResetPassword: React.FC = () => {
    const { email, resetMutation , code } = useResetPassword();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const formik = useFormik({
        initialValues: {
            password: '',
            confirmPassword: '',
        },
        validationSchema: Yup.object({
            password: Yup.string()
                .matches(
                    /^.{8,60}$/,
                    'Password must be between 8 and 60 characters in length'
                )
                .required('New Password is required!'),
            confirmPassword: Yup.string()
                .oneOf([Yup.ref('password')], 'New Password and Confirm Password not equal.')
                .required('Confirm Password is required!'),
        }),
        onSubmit: (values) => {
            resetMutation.mutate({
                email: email || '',
                code: code || '',
                password: values.password,
                confirmPassword: values.confirmPassword,
            });
        },
    });
    return (
        <div className="tw:min-h-screen tw:bg-[#F8F9FB] tw:flex tw:flex-col tw:items-center tw:p-4" data-testid="reset-password-page">
           {/* <div className='tw:h-[100vh] tw:w-[100vw] tw:flex tw:flex-col tw:items-center tw:justify-center tw:gap-12'> */}
             <div className="tw:mt-12 tw:mb-12">
                <img src={appLogo} alt="Visitly Logo" className="tw:h-12 tw:w-auto" data-testid="logo" />
            </div>
            <div className="tw:max-w-lg tw:mt-12 tw:w-full tw:bg-white tw:rounded-lg tw:shadow-md tw:overflow-hidden"
                style={{ boxShadow: '0 0 5px 0 rgb(159, 159, 159)' }}
                data-testid="reset-password-container">
                <div className="tw:p-8">
                    <h2 className="tw:text-2xl tw:font-bold tw:text-gray-900 tw:mb-8" data-testid="page-title">Reset Password</h2>
                    <form onSubmit={formik.handleSubmit} className="tw:space-y-6" data-testid="reset-password-form">
                        {/* New Password */}
                        <div className="tw:relative">
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.password}
                                placeholder="New Password"
                                className={`tw:w-full tw:p-2 tw:border tw:rounded-md tw:outline-none tw:transition-all ${formik.touched.password && formik.errors.password
                                        ? 'tw:border-red-500 tw:focus:tw:ring-1 tw:focus:tw:ring-red-500'
                                        : 'tw:border-gray-300 tw:focus:tw:ring-1 tw:focus:tw:ring-[#4c32e9]'
                                    }`}
                                data-testid="new-password-input"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="tw:absolute tw:right-3 tw:top-1/2 tw:transform tw:-translate-y-1/2 tw:text-gray-400 tw:hover:tw:text-gray-600"
                                data-testid="toggle-new-password-visibility"
                            >
                                {showPassword ? <EyeOff className="tw:w-5 tw:h-5" /> : <Eye className="tw:w-5 tw:h-5" />}
                            </button>
                            {formik.touched.password && formik.errors.password && (
                                <p className="tw:text-red-500 tw:text-xs tw:mt-1" data-testid="new-password-invalid-error">
                                    {formik.errors.password}
                                </p>
                            )}
                        </div>
                        {/* Confirm Password */}
                        <div className="tw:relative">
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type={showConfirmPassword ? 'text' : 'password'}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.confirmPassword}
                                placeholder="Confirm Password"
                                className={`tw:w-full tw:p-2 tw:border tw:rounded-md tw:outline-none tw:transition-all ${formik.touched.confirmPassword && formik.errors.confirmPassword
                                        ? 'tw:border-red-500 tw:focus:tw:ring-1 tw:focus:tw:ring-red-500'
                                        : 'tw:border-gray-300 tw:focus:tw:ring-1 tw:focus:tw:ring-[#4c32e9]'
                                    }`}
                                data-testid="confirm-password-input"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="tw:absolute tw:right-3 tw:top-1/2 tw:transform tw:-translate-y-1/2 tw:text-gray-400 tw:hover:tw:text-gray-600"
                                data-testid="toggle-confirm-password-visibility"
                            >
                                {showConfirmPassword ? <EyeOff className="tw:w-5 tw:h-5" /> : <Eye className="tw:w-5 tw:h-5" />}
                            </button>
                            {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                                <p className="tw:text-red-500 tw:text-xs tw:mt-1" data-testid="password-mismatch-error">
                                    {formik.errors.confirmPassword}
                                </p>
                            )}
                        </div>
                        {/* Submit */}
                        <div>
                            <button
                                type="submit"
                                disabled={!formik.isValid || !formik.values.password || resetMutation.isPending}
                                className="tw:w-full tw:bg-primary-100 tw:hover:tw:bg-[#3b27b8] tw:text-white tw:py-2 tw:rounded-md tw:font-medium tw:transition-colors tw:disabled:tw:opacity-50 tw:disabled:tw:cursor-not-allowed tw:shadow-sm"
                                data-testid="reset-password-button"
                            >
                                {resetMutation.isPending ? 'Resetting...' : 'Reset password'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
           {/* </div> */}
        </div>
    );
};

export default ResetPassword;
