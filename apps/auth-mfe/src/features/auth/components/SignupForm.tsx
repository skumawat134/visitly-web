import React from "react";
import { Formik, Form } from "formik";
import { Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";

import { Input, Button, Image, Label } from "@visitly/ui";
import { useSignup } from "../hooks/useSignup";

import appLogo from "@/assets/images/logo.png";
import SignUpSidePanel from "./SignUpSidePanel";

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
    signupValidationSchema,
  } = useSignup();

  const initialValues: SignupFormValues = {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phoneNumber: "",
    companyName: "",
    terms: false,
  };

  return (
    <div
      className="tw:h-screen tw:w-full tw:bg-[#F8F9FB] tw:overflow-y-auto"
      data-testid="signup-page"
    >
      <div className="tw:min-h-full tw:flex tw:p-4">
        <div className="tw:container tw:max-w-6xl tw:m-auto">
          {/* Logo */}
          <div className="tw:flex tw:justify-center tw:mb-10 tw:mt-6">
            <Image
              src={appLogo}
              alt="visity-web-logo"
              width="196"
              height="50"
              data-testid="logo"
            />
          </div>

          <div className="tw:flex tw:justify-center">
            <div className="tw:w-full tw:md:w-4/5 lg:tw:w-10/12 tw:bg-white tw:rounded-lg tw:shadow-sm tw:overflow-hidden">
              <Formik
                initialValues={initialValues}
                validationSchema={signupValidationSchema}
                onSubmit={signupUser}
              >
                {({
                  values,
                  errors,
                  touched,
                  handleChange,
                  handleBlur,
                  setFieldValue,
                  submitCount,
                }) => (
                  <Form
                    className="tw:flex tw:flex-col tw:md:flex-row  tw:lg:flex-row"
                    autoComplete="off"
                  >
                    {/* Left Panel */}
                    <SignUpSidePanel />

                    {/* Right Panel */}
                    <div className="tw:w-full lg:tw:w-7/12 tw:p-4 tw:md:p-8">
                      {/* Name */}
                      <div className="tw:flex tw:flex-col  tw:md:flex-row tw:gap-4 tw:mb-4">
                        <Input
                          label="First Name"
                          name="firstName"
                          value={values.firstName}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          required
                          error={touched.firstName ? errors.firstName : undefined}
                          data-testid="first-name-input"
                        />

                        <Input
                          label="Last Name"
                          name="lastName"
                          value={values.lastName}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          required
                          error={touched.lastName ? errors.lastName : undefined}
                          data-testid="last-name-input"
                        />
                      </div>

                      {/* Company */}
                      <div className="tw:mb-4">
                        <Input
                          label="Organization Name"
                          name="companyName"
                          value={values.companyName}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={
                            touched.companyName ? errors.companyName : undefined
                          }
                          required
                          data-testid="company-name-input"
                        />
                      </div>

                      {/* Email */}
                      <div className="tw:mb-4">
                        <Input
                          label="Email "
                          type="email"
                          name="email"
                          value={values.email}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          required
                          error={touched.email ? errors.email : undefined}
                          data-testid="email-input"
                        />
                      </div>

                      {/* Password */}
                      <div className="tw:mb-4">
                        <Input
                          label="Password"
                          name="password"
                          type={flagForPasswordHideShow ? "password" : "text"}
                          value={values.password}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={touched.password ? errors.password : undefined}
                          rightIcon={
                            flagForPasswordHideShow ? (
                              <EyeOff className="tw:w-4 tw:h-4" />
                            ) : (
                              <Eye className="tw:w-4 tw:h-4" />
                            )
                          }
                          required
                          rightIconClickable
                          onRightIconClick={togglePasswordVisibility}
                          data-testid="password-input"
                        />
                      </div>

                      {/* Phone */}
                      <div className="tw:mb-4">
                        <Input
                          label="Phone Number"
                          name="phoneNumber"
                          value={values.phoneNumber}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={
                            touched.phoneNumber ? errors.phoneNumber : undefined
                          }
                          data-testid="phone-input"
                          required
                        />
                      </div>

                      {/* Terms */}
                      <div className="tw:mb-6">
                        <div className="tw:flex tw:items-start tw:gap-2">
                          {/* Checkbox */}
                          <input
                            type="checkbox"
                            checked={values.terms}
                            onChange={(e) =>
                              setFieldValue("terms", e.target.checked)
                            }
                            className="tw:mt-1 tw:h-4 tw:w-4 tw:shrink-0"
                          />

                          {/* Text */}
                          <Label className="tw:text-sm tw:leading-relaxed" required>
                            By signing up, I agree to Visitly{" "}
                            <a
                              href="https://www.visitly.io/tos/"
                              className="tw:text-primary-100 hover:tw:underline"
                              target="_blank"
                              rel="noopener noreferrer"
                              data-testid="terms-link"
                            >
                              <b>Terms of Service</b>
                            </a>{" "}
                            and{" "}
                            <a
                              href="https://www.visitly.io/privacy/"
                              className="tw:text-primary-100 hover:tw:underline"
                              target="_blank"
                              rel="noopener noreferrer"
                              data-testid="privacy-link"
                            >
                              <b>Privacy Policy</b>
                            </a>
                          </Label>
                        </div>

                        {(touched.terms || submitCount > 0) && errors.terms && (
                          <p className="tw:mt-1 tw:text-sm tw:text-red-600">
                            {errors.terms}
                          </p>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="tw:flex tw:flex-row tw:sm:flex-row tw:justify-between tw:sm:justify-between tw:sm:items-center tw:gap-4 tw:sm:gap-0">
                        {/* Login text */}
                        <p className="tw:text-sm tw:text-center sm:tw:text-left">
                          Already have an account?{" "}
                          <Link
                            to="/visitly/login"
                            onClick={() => sendEvent("signin")}
                            className="tw:text-primary-100 tw:font-semibold hover:tw:underline"
                            data-testid="login-link"
                          >
                            Login
                          </Link>
                        </p>

                        {/* Submit button */}
                        <Button
                          type="submit"
                          size="sm"
                          isLoading={isLoading}
                          data-testid="signup-submit-button"
                          className="tw:w-auto tw:sm:w-auto tw:rounded-sm tw:cursor-pointer"
                        >
                          Start my trial
                        </Button>
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