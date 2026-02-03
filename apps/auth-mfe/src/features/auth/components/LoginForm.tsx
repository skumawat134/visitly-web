import { useAuthStore } from '@visitly/app-store';
import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { Input, Button, Card, CardHeader, CardTitle, CardContent, Spinner, Image } from '@visitly/ui';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import useLogin from '../hooks/useLogin';
import { Link } from 'react-router-dom';
import appLogo from '@/assets/images/logo.png';
const LoginForm = () => {
    const { handleSubmit, isSubmitting, showPassword, setShowPassword, touched, errors, values, showPasswordField, handleBlur, handleChange, setStep, ssoUrl } = useLogin();
    return (
        <div className="tw:min-h-screen tw:flex tw:flex-col tw:items-center tw:bg-slate-50 tw:py-12 tw:px-4 tw:sm:px-6 tw:lg:px-8" data-test-id="auth-mfe-login-form-root">
            {/* Visitly Logo */}
            <div className="tw:flex tw:items-center tw:gap-2 tw:my-12">
                <Image src={appLogo} alt='visity-web-logo' width={196} />
            </div>

            {/* Card Container */}
            <Card className=" tw:w-full tw:px-10 tw:mt-12 tw:max-w-136">
                <CardHeader>
                    <CardTitle className="tw:text-2xl tw:font-bold tw:text-slate-900 tw:mb-4">
                        Please Sign In
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    <form className="tw:space-y-7" onSubmit={handleSubmit}>
                        <Input
                            name="email"
                            type="email"
                            label="Username or Company Email"
                            placeholder="Enter your email"
                            error={touched.email && errors.email ? errors.email : undefined}
                            leftIcon={<Mail className="tw:h-4 tw:w-4" />}
                            value={values.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className="tw:bg-[#eff4ff] tw:border-none focus:tw:ring-2 focus:tw:ring-indigo-500"
                        />

                        {/* Password Field */}
                        {showPasswordField && (
                            <Input
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                label="Password"
                                placeholder="Enter your password"
                                error={touched.password && errors.password ? errors.password : undefined}
                                leftIcon={<Lock className="tw:h-4 tw:w-4" />}
                                rightIcon={
                                    showPassword ? (
                                        <EyeOff className="tw:h-4 tw:w-4" />
                                    ) : (
                                        <Eye className="tw:h-4 tw:w-4" />
                                    )
                                }
                                rightIconClickable
                                onRightIconClick={() => setShowPassword(!showPassword)}
                                className="tw:bg-[#eff4ff] tw:border-none focus:tw:ring-2 focus:tw:ring-indigo-500"
                                value={values.password}
                                onChange={handleChange}
                                onBlur={handleBlur}
                            />)
                        }
                        {
                            ssoUrl && !showPasswordField &&
                            <span className='tw:flex tw:justify-center tw:gap-2 tw:items-center tw:text-primary-1000'>
                                <Lock />
                                <p className="tw:block tw:text-sm tw:font-medium">

                                    Single sign-on enabled
                                </p>
                            </span>

                        }
                        {/* Forgot Password */}
                        {
                            showPasswordField && <div className="tw:flex tw:items-center">
                                <Link
                                 to={'/visitly/forgot-password'}
                                    className="tw:text-sm tw:font-bold tw:text-primary-1000 hover:tw:underline"
                                   
                                >
                                    Forgot password?
                                </Link>
                            </div>
                        }


                        {/* Submit Button */}
                        <Button
                            type="submit"
                            variant="primary"
                            size="md"
                            isLoading={isSubmitting}
                            className={"tw:w-full  hover:tw:bg-[#4a36e6] tw:shadow-md tw:cursor-pointer"}
                            disabled={isSubmitting}
                        >
                           {showPasswordField ?  'Login'  : 'Continue'}
                        </Button>

                        {/* Secondary Actions */}
                        <div className="tw:space-y-4 tw:text-center tw:pt-2">
                            {
                                ssoUrl && !showPasswordField &&
                                <a
                                    //    href='/visitly/login'
                                    className="tw:block tw:text-sm tw:font-semibold tw:text-primary-100 hover:tw:underline tw:cursor-pointer"
                                    onClick={(e) => {
                                        setStep("email");
                                    }}
                                >
                                    Use password instead
                                </a>
                            }
                            {
                                ssoUrl && showPasswordField &&
                                <a
                                    //    href='/visitly/login'
                                    className="tw:block tw:font-semibold tw:text-primary-100 hover:tw:underline tw:cursor-pointer"
                                    onClick={(e) => {
                                        setStep("sso");
                                    }}
                                >
                                    Use single sign-on instead
                                </a>
                            }
                            <div className=" tw:text-slate-500">
                                Don't have an account?{' '}
                                <Link
                                    to={'/visitly/signup'}
                                    className=" tw:text-primary-100 hover:tw:underline tw:cursor-pointer"

                                >
                                    Join Us
                                </Link>
                            </div>
                        </div>
                    </form>

                </CardContent>
            </Card>
        </div>
    );
};

export default LoginForm;
