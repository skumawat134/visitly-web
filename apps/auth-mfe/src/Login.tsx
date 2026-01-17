import { useAuthStore } from '@visitly/app-store';
import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Input, Button, Card, CardHeader, CardTitle, CardContent } from '@visitly/ui';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialValues = {
    email: 'gauravagarwal26+cf2@gmail.com',
    password: '',
  };

  const validationSchema = Yup.object({
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    password: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .required('Password is required'),
  });

  const handleSubmit = async (values: { email: string; password: string }) => {
    setIsSubmitting(true);
    try {
      console.log('Form data', values);
      // TODO: Integrate with auth store
      // await useAuthStore.getState().login(values.email, values.password);
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="tw:min-h-screen tw:flex tw:flex-col tw:items-center tw:justify-center tw:bg-slate-50 tw:py-12 tw:px-4 tw:sm:px-6 tw:lg:px-8">
      {/* Visitly Logo */}
      <div className="tw:flex tw:items-center tw:gap-2 tw:mb-8">
        <svg 
          className="tw:w-10 tw:h-10 tw:text-[#2d2a6e]" 
          viewBox="0 0 40 40" 
          fill="currentColor"
        >
          <path d="M20 0L37.32 10V30L20 40L2.68 30V10L20 0ZM20 6.6L8.66 13.15V26.85L20 33.4L31.34 26.85V13.15L20 6.6ZM20 13.2L25.85 16.58V23.42L20 26.8L14.15 23.42V16.58L20 13.2Z" />
        </svg>
        <span className="tw:text-4xl tw:font-bold tw:text-[#2d2a6e]">
          visitly<span className="tw:text-[#6366f1]">.</span>
        </span>
      </div>

      {/* Card Container */}
      <Card className="tw:max-w-md tw:w-full">
        <CardHeader>
          <CardTitle className="tw:text-2xl tw:font-bold tw:text-slate-900">
            Please Sign In
          </CardTitle>
        </CardHeader>

        <CardContent>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched }) => (
              <Form className="tw:space-y-6">
                {/* Email Field */}
                <Field name="email">
                  {({ field }: any) => (
                    <Input
                      {...field}
                      type="email"
                      label="Username or Company Email"
                      placeholder="Enter your email"
                      error={touched.email && errors.email ? errors.email : undefined}
                      leftIcon={<Mail className="tw:h-4 tw:w-4" />}
                      className="tw:bg-[#eff4ff] tw:border-none focus:tw:ring-2 focus:tw:ring-indigo-500"
                    />
                  )}
                </Field>

                {/* Password Field */}
                <Field name="password">
                  {({ field }: any) => (
                    <Input
                      {...field}
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
                    />
                  )}
                </Field>

                {/* Forgot Password */}
                <div className="tw:flex tw:items-center">
                  <a 
                    href="#" 
                    className="tw:text-sm tw:font-bold tw:text-slate-900 hover:tw:underline"
                    onClick={(e) => {
                      e.preventDefault();
                      // TODO: Implement forgot password flow
                      console.log('Forgot password clicked');
                    }}
                  >
                    Forgot password?
                  </a>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={isSubmitting}
                  className="tw:w-full tw:bg-[#5a44ff] hover:tw:bg-[#4a36e6] tw:shadow-md"
                  disabled={isSubmitting}
                >
                  Login
                </Button>

                {/* Secondary Actions */}
                <div className="tw:space-y-4 tw:text-center tw:pt-2">
                  <a 
                    href="#" 
                    className="tw:block tw:text-sm tw:font-semibold tw:text-indigo-600 hover:tw:underline"
                    onClick={(e) => {
                      e.preventDefault();
                      // TODO: Implement SSO flow
                      console.log('SSO clicked');
                    }}
                  >
                    Use single sign-on instead
                  </a>
                  <div className="tw:text-sm tw:text-slate-500">
                    Don't have an account?{' '}
                    <a 
                      href="#" 
                      className="tw:font-bold tw:text-indigo-600 hover:tw:underline"
                      onClick={(e) => {
                        e.preventDefault();
                        // TODO: Navigate to signup
                        console.log('Sign up clicked');
                      }}
                    >
                      Join Us
                    </a>
                  </div>
                </div>
              </Form>
            )}
          </Formik>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;
