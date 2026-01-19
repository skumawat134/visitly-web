import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { Eye, EyeOff } from 'lucide-react';
import { Input, Button, Card, CardHeader, CardTitle, CardContent } from '@visitly/ui';

import { useSignup } from '../hooks/useSignup';
import { Link } from 'react-router-dom';

export interface SignupFormValues {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  companyName: string;
  terms: boolean;
}

const Signup: React.FC = () => {
  const {
    flagForPasswordHideShow,
    togglePasswordVisibility,
    isLoading,
    signupUser,
    sendEvent,
    validateForm,
  } = useSignup();

  const initialValues: SignupFormValues = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
    companyName: '',
    terms: false,
  };

  const handleSubmit = (values: SignupFormValues) => {
    signupUser(values);
  };

  return (
    <div 
      className="tw:min-h-screen tw:bg-[#F8F9FB] tw:flex tw:items-center tw:justify-center tw:p-4"
      data-testid="signup-page"
    >
      <div className="tw:container tw:max-w-6xl tw:mx-auto">
        {/* Logo Row */}
        <div className="tw:flex tw:justify-center tw:mb-10">
          <img 
            src="/assets/images/logo.png" 
            alt="Visitly Logo" 
            width="196" 
            height="50"
            className="tw:max-w-full tw:h-auto"
            data-testid="logo"
          />
        </div>

        {/* Main Content Row */}
        <div className="tw:flex tw:justify-center">
          <div className="tw:w-full lg:tw:w-10/12">
            {/* Auth Box */}
            <div className="tw:bg-white tw:rounded-lg tw:shadow-sm tw:overflow-hidden">
              <Formik
                initialValues={initialValues}
                validate={validateForm}
                onSubmit={handleSubmit}
              >
                {({ values, errors, touched, handleChange, handleBlur }) => (
                  <Form className="tw:flex tw:flex-col lg:tw:flex-row" data-testid="signup-form" autoComplete="off">
                    {/* Left Panel - Branding */}
                    <div 
                      className="tw:w-full lg:tw:w-5/12 tw:bg-[#F5F1FF] tw:p-6 lg:tw:p-8 tw:pt-8"
                      data-testid="branding-panel"
                    >
                      <div data-testid="step1-branding">
                        <h1 
                          className="tw:text-2xl tw:font-bold tw:mb-4 tw:text-gray-900"
                          data-testid="step1-title"
                        >
                          Get Started With Visitly
                        </h1>
                        <p 
                          className="tw:text-gray-700 tw:mb-6 tw:leading-relaxed"
                          data-testid="step1-description"
                        >
                          Free 14-day trial – No credit card required <br />
                          Secure, compliant, and reliable <br />
                          Easy setup, ready in minutes
                        </p>

                        {/* Brand Logos */}
                        <div 
                          className="tw:flex tw:justify-center tw:gap-4 tw:mt-10"
                          data-testid="step1-logos"
                        >
                          <img 
                            src="https://visitly-web-assets.s3.us-west-2.amazonaws.com/assets/img/badge1.png"
                            alt="Brand Logo 1" 
                            width="80" 
                            height="90"
                            className="tw:mx-2"
                            data-testid="badge1"
                          />
                          <img 
                            src="https://visitly-web-assets.s3.us-west-2.amazonaws.com/assets/img/badge2.png"
                            alt="Brand Logo 2" 
                            width="80" 
                            height="90"
                            className="tw:mx-2"
                            data-testid="badge2"
                          />
                          <img 
                            src="https://visitly-web-assets.s3.us-west-2.amazonaws.com/assets/img/badge3.png"
                            alt="Brand Logo 3" 
                            width="70" 
                            height="90"
                            className="tw:mx-2"
                            data-testid="badge3"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Right Panel - Form */}
                    <div 
                      className="tw:w-full lg:tw:w-7/12 tw:p-6 lg:tw:p-8"
                      data-testid="form-panel"
                    >
                      <div data-testid="step1-content">
                        {/* Name Row */}
                        <div className="tw:grid tw:grid-cols-1 md:tw:grid-cols-2 tw:gap-4 tw:mb-4">
                          {/* First Name */}
                          <div>
                            <label 
                              htmlFor="firstName" 
                              className="tw:block tw:text-sm tw:font-medium tw:text-gray-700 tw:mb-1"
                              data-testid="first-name-label"
                            >
                              <span className="tw:text-red-500">*</span>First Name
                            </label>
                            <Field
                              type="text"
                              name="firstName"
                              id="firstName"
                              className={`
                                tw:w-full tw:border tw:rounded tw:px-3 tw:py-2 tw:text-sm
                                focus:tw:outline-none focus:tw:ring-2 focus:tw:ring-blue-500 focus:tw:border-blue-500
                                ${errors.firstName && touched.firstName ? 'tw:border-red-500 focus:tw:border-red-500 focus:tw:ring-red-500' : 'tw:border-gray-300'}
                              `}
                              data-testid="first-name-input"
                            />
                            <ErrorMessage name="firstName">
                              {msg => (
                                <p className="tw:mt-1 tw:text-sm tw:text-red-600" data-testid="first-name-error">
                                  {msg}
                                </p>
                              )}
                            </ErrorMessage>
                          </div>

                          {/* Last Name */}
                          <div>
                            <label 
                              htmlFor="lastName" 
                              className="tw:block tw:text-sm tw:font-medium tw:text-gray-700 tw:mb-1"
                              data-testid="last-name-label"
                            >
                              <span className="tw:text-red-500">*</span>Last Name
                            </label>
                            <Field
                              type="text"
                              name="lastName"
                              id="lastName"
                              className={`
                                tw:w-full tw:border tw:rounded tw:px-3 tw:py-2 tw:text-sm
                                focus:tw:outline-none focus:tw:ring-2 focus:tw:ring-blue-500 focus:tw:border-blue-500
                                ${errors.lastName && touched.lastName ? 'tw:border-red-500 focus:tw:border-red-500 focus:tw:ring-red-500' : 'tw:border-gray-300'}
                              `}
                              data-testid="last-name-input"
                            />
                            <ErrorMessage name="lastName">
                              {msg => (
                                <p className="tw:mt-1 tw:text-sm tw:text-red-600" data-testid="last-name-error">
                                  {msg}
                                </p>
                              )}
                            </ErrorMessage>
                          </div>
                        </div>

                        {/* Organization Name */}
                        <div className="tw:mb-4">
                          <label 
                            htmlFor="companyName" 
                            className="tw:block tw:text-sm tw:font-medium tw:text-gray-700 tw:mb-1"
                            data-testid="company-name-label"
                          >
                            <span className="tw:text-red-500">*</span>Organization Name
                          </label>
                          <Field
                            type="text"
                            name="companyName"
                            id="companyName"
                            className={`
                              tw:w-full tw:border tw:rounded tw:px-3 tw:py-2 tw:text-sm
                              focus:tw:outline-none focus:tw:ring-2 focus:tw:ring-blue-500 focus:tw:border-blue-500
                              ${errors.companyName && touched.companyName ? 'tw:border-red-500 focus:tw:border-red-500 focus:tw:ring-red-500' : 'tw:border-gray-300'}
                            `}
                            data-testid="company-name-input"
                          />
                          <ErrorMessage name="companyName">
                            {msg => (
                              <p className="tw:mt-1 tw:text-sm tw:text-red-600" data-testid="company-name-error">
                                {msg}
                              </p>
                            )}
                          </ErrorMessage>
                        </div>

                        {/* Email */}
                        <div className="tw:mb-4">
                          <label 
                            htmlFor="email" 
                            className="tw:block tw:text-sm tw:font-medium tw:text-gray-700 tw:mb-1"
                            data-testid="email-label"
                          >
                            <span className="tw:text-red-500">*</span>Email
                          </label>
                          <Field
                            type="email"
                            name="email"
                            id="email"
                            className={`
                              tw:w-full tw:border tw:rounded tw:px-3 tw:py-2 tw:text-sm
                              focus:tw:outline-none focus:tw:ring-2 focus:tw:ring-blue-500 focus:tw:border-blue-500
                              ${errors.email && touched.email ? 'tw:border-red-500 focus:tw:border-red-500 focus:tw:ring-red-500' : 'tw:border-gray-300'}
                            `}
                            data-testid="email-input"
                          />
                          <ErrorMessage name="email">
                            {msg => (
                              <p className="tw:mt-1 tw:text-sm tw:text-red-600" data-testid="email-error">
                                {msg}
                              </p>
                            )}
                          </ErrorMessage>
                        </div>

                        {/* Password */}
                        <div className="tw:mb-4">
                          <label 
                            htmlFor="password" 
                            className="tw:block tw:text-sm tw:font-medium tw:text-gray-700 tw:mb-1"
                            data-testid="password-label"
                          >
                            <span className="tw:text-red-500">*</span>Password
                          </label>
                          <div className="tw:relative">
                            <Field
                              type={flagForPasswordHideShow ? 'password' : 'text'}
                              name="password"
                              id="password"
                              className={`
                                tw:w-full tw:border tw:rounded tw:px-3 tw:py-2 tw:text-sm tw:pr-10
                                focus:tw:outline-none focus:tw:ring-2 focus:tw:ring-blue-500 focus:tw:border-blue-500
                                ${errors.password && touched.password ? 'tw:border-red-500 focus:tw:border-red-500 focus:tw:ring-red-500' : 'tw:border-gray-300'}
                              `}
                              data-testid="password-input"
                            />
                            <button
                              type="button"
                              className="tw:absolute tw:right-3 tw:top-1/2 tw:-translate-y-1/2 tw:text-gray-400 hover:tw:text-gray-600"
                              onClick={togglePasswordVisibility}
                              data-testid="toggle-password-visibility"
                            >
                              {flagForPasswordHideShow ? (
                                <EyeOff className="tw:w-4 tw:h-4" />
                              ) : (
                                <Eye className="tw:w-4 tw:h-4" />
                              )}
                            </button>
                          </div>
                          <ErrorMessage name="password">
                            {msg => (
                              <p className="tw:mt-1 tw:text-sm tw:text-red-600" data-testid="password-error">
                                {msg}
                              </p>
                            )}
                          </ErrorMessage>
                        </div>

                        {/* Phone Number */}
                        <div className="tw:mb-4">
                          <label 
                            htmlFor="phoneNumber" 
                            className="tw:block tw:text-sm tw:font-medium tw:text-gray-700 tw:mb-1"
                            data-testid="phone-label"
                          >
                            <span className="tw:text-red-500">*</span>Phone Number
                          </label>
                          <Field
                            type="tel"
                            name="phoneNumber"
                            id="phoneNumber"
                            className={`
                              tw:w-full tw:border tw:rounded tw:px-3 tw:py-2 tw:text-sm
                              focus:tw:outline-none focus:tw:ring-2 focus:tw:ring-blue-500 focus:tw:border-blue-500
                              ${errors.phoneNumber && touched.phoneNumber ? 'tw:border-red-500 focus:tw:border-red-500 focus:tw:ring-red-500' : 'tw:border-gray-300'}
                            `}
                            data-testid="phone-input"
                          />
                          <ErrorMessage name="phoneNumber">
                            {msg => (
                              <p className="tw:mt-1 tw:text-sm tw:text-red-600" data-testid="phone-error">
                                {msg}
                              </p>
                            )}
                          </ErrorMessage>
                        </div>

                        {/* Terms & Privacy */}
                        <div className="tw:mb-6">
                          <div className="tw:flex tw:items-start">
                            <Field
                              type="checkbox"
                              name="terms"
                              id="terms"
                              className="tw:h-4 tw:w-4 tw:mt-1 tw:mr-2 tw:text-blue-600 focus:tw:ring-blue-500 tw:border-gray-300 tw:rounded"
                              data-testid="terms-checkbox"
                            />
                            <label 
                              htmlFor="terms" 
                              className="tw:text-sm tw:text-gray-700"
                              data-testid="terms-label"
                            >
                              By signing up, I agree to Visitly{' '}
                              <a
                                href="https://www.visitly.io/tos/"
                                className="tw:text-blue-600 hover:tw:underline"
                                target="_blank"
                                rel="noopener noreferrer"
                                data-testid="terms-link"
                              >
                                <b>Terms of Service</b>
                              </a>{' '}
                              and{' '}
                              <a
                                href="https://www.visitly.io/privacy/"
                                className="tw:text-blue-600 hover:tw:underline"
                                target="_blank"
                                rel="noopener noreferrer"
                                data-testid="privacy-link"
                              >
                                <b>Privacy Policy</b>
                              </a>
                            </label>
                          </div>
                          <ErrorMessage name="terms">
                            {msg => (
                              <p className="tw:mt-1 tw:text-sm tw:text-red-600">
                                {msg}
                              </p>
                            )}
                          </ErrorMessage>
                        </div>

                        {/* Bottom Section */}
                        <div className="tw:flex tw:flex-col sm:tw:flex-row tw:justify-between tw:items-center tw:mt-6">
                          <div className="tw:mb-4 sm:tw:mb-0">
                            <p className="tw:text-sm tw:text-gray-700" data-testid="login-redirect-text">
                              Already have an Account ?{' '}
                              <Link
                                to="/visitly/login"
                                onClick={() => sendEvent('signin')}
                                className="tw:text-blue-600 hover:tw:underline tw:font-semibold"
                                data-testid="login-link"
                              >
                                Login
                              </Link>
                            </p>
                          </div>
                          
                          <Button
                            type="submit"
                            variant="primary"
                            isLoading={isLoading}
                            className="tw:bg-blue-600 hover:tw:bg-blue-700 tw:text-white tw:px-6 tw:py-2 tw:rounded tw:font-medium"
                            data-testid="signup-submit-button"
                          >
                            Start my trial
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;