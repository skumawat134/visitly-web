import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { SignupFormValues } from '../components/SignupForm';
import { useMutation } from '@tanstack/react-query';
import { createUserApi, createHubSpotApi } from '../services/auth.api';
import * as Yup from 'yup';
import { useToastStore } from '@visitly/app-store';
export interface User {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  companyName: string;
}

interface ValidationPatterns {
  PATTERN_FOR_ALPHABATES_AND_SPACE: RegExp;
  PATTERN_FOR_ALPHABATES_AND_ORG_NAME: RegExp;
  PATTERN_FOR_EMAIL: RegExp;
  PATTERN_FOR_PASSWORD: RegExp;
  PATTERN_FOR_PHONE_NO: RegExp;
}

interface ValidationMessages {
  FIRST_NAME_REQUIRED: string;
  FIRST_NAME_INVALID: string;
  LAST_NAME_REQUIRED: string;
  LAST_NAME_INVALID: string;
  ORGANIZATION_NAME_REQUIRED: string;
  EMAIL_REQUIRED: string;
  EMAIL_INVALID: string;
  PASSWORD_REQUIRED: string;
  PASSWORD_INVALID: string;
  MOBILE_NUMBER_REQUIRED: string;
  MOBILE_NUMBER_INVALID: string;
}

const validationPatterns: ValidationPatterns = {
  PATTERN_FOR_ALPHABATES_AND_SPACE: /^([a-zA-Z][a-zA-Z ]*)$/,
  PATTERN_FOR_ALPHABATES_AND_ORG_NAME: /^([a-zA-Z][a-zA-Z .&$@]*)$/,
  PATTERN_FOR_EMAIL: /[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,50}/,
  PATTERN_FOR_PASSWORD: /^.{8,60}$/,
  PATTERN_FOR_PHONE_NO: /^[0-9]{6,12}$/, // E.164 format
};

// Validation messages
const validationMessages: ValidationMessages = {
  FIRST_NAME_REQUIRED: 'First name is required',
  FIRST_NAME_INVALID: 'First name can only contain letters and spaces',
  LAST_NAME_REQUIRED: 'Last name is required',
  LAST_NAME_INVALID: 'Last name can only contain letters and spaces',
  ORGANIZATION_NAME_REQUIRED: 'Organization name is required',
  EMAIL_REQUIRED: 'Email is required',
  EMAIL_INVALID: 'Please enter a valid email address',
  PASSWORD_REQUIRED: 'Password is required',
  PASSWORD_INVALID: 'Password must be between 8 and 60 characters in length',
  MOBILE_NUMBER_REQUIRED: 'Phone number is required',
  MOBILE_NUMBER_INVALID: 'Please enter a valid phone number',
};


export const useSignup = () => {
  const [flagForPasswordHideShow, setFlagForPasswordHideShow] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const showToast = useToastStore((s) => s.showToast)
  const navigate = useNavigate();

  useEffect(() => {
    // Initial GA Tracking
    console.log('GA Tracking for signup page');
    if ((window as any).ga) {
      (window as any).ga('set', 'page', 'signup page');
      (window as any).ga('send', 'pageview');
    }
  }, []);

  const togglePasswordVisibility = () => {
    setFlagForPasswordHideShow(!flagForPasswordHideShow);
  };

  const signupUser = async (values: SignupFormValues) => {
    setIsLoading(true);

    try {
      // Prepare user object
      const userObj: User = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
        confirmPassword: values.password, // Confirm password same as password
        phoneNumber: values.phoneNumber,
        companyName: values.companyName,
      };

      signUpMutation.mutate(userObj);


    } catch (error: any) {
      console.error('Signup error:', error.status, error.message);
      // Handle different error statuses

    } finally {
      setIsLoading(false);
    }
  };

  const signUpMutation = useMutation({
    mutationFn: createUserApi,
    onSuccess: (data, variables) => {
      console.log('Signup successful:------------------------------------------>', data, variables);
      if (window.location.hostname.toLowerCase() === 'app.visitly.io') {
        createHubSpot(variables);
      }
      showToast({ message: 'Signup successful! Please check your email to confirm your account.', type: "success" });
      navigate('/visitly/confirmation', { relative: 'path' });
    },
    onError: (error: any) => {
      console.log('Signup mutation error:', error, error.status, error.message);
      switch (error?.status) {
        case 400:
          showToast({ message: error?.message ? error?.message : 'Bad Request', type: "error" });
          break;
        case 409:
          showToast({ message: 'An account already exists with this email. Please log in.', type: "error" });
          break;
        case 500:
        case 504:
          showToast({ message: 'We have encountered an error. If the problem persists, please contact Visitly Support at <a href="mailto:support@visitly.io">support@visitly.io</a>', type: "error" });
          break;
      }
    }
  });

  const createHubSpot = async (user: User) => {
    const date = new Date();
    const now_utc = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),
      date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());

    const hutk = getCookieValue("hubspotutk");
    const utm_source = getCookieValue("utm_source");
    const utm_medium = getCookieValue("utm_medium");
    const utm_campaign = getCookieValue("utm_campaign");
    const utm_term = getCookieValue("utm_term");
    const utm_content = getCookieValue("utm_content");
    const gclid = getCookieValue("gclid");

    const fields = [
      { name: "email", value: user.email },
      { name: "lastname", value: user.lastName },
      { name: "firstname", value: user.firstName },
      { name: "company", value: user.companyName },
      { name: "phone", value: user.phoneNumber || '' }
    ];

    if (utm_source) fields.push({ name: "utm_source", value: utm_source });
    if (utm_medium) fields.push({ name: "utm_medium", value: utm_medium });
    if (utm_campaign) fields.push({ name: "utm_campaign", value: utm_campaign });
    if (utm_term) fields.push({ name: "utm_term", value: utm_term });
    if (utm_content) fields.push({ name: "utm_content", value: utm_content });
    if (gclid) fields.push({ name: "gclid", value: gclid });

    const payload = {
      submittedAt: now_utc,
      fields,
      context: {
        pageUri: window.location.href,
        pageName: "Sign Up",
        ...(hutk && { hutk })
      },
      skipValidation: false
    };

    try {
      hubspotMutation.mutate(payload);
    } catch (error) {
      console.error('HubSpot Tracking Error:', error);
    }
  };


  const hubspotMutation = useMutation({
    mutationFn: createHubSpotApi,
    meta: {
      showLoader: false,
    },
    onSuccess: () => {
      //  console.log('HubSpot integration successful');
    },

    onError: (error: any) => {
      console.error('HubSpot integration error:', error);
    }
  });

  const getCookieValue = (name: string) => {
    const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
    return match ? decodeURIComponent(match[2] || "") : "";
  }



  const sendEvent = (event: string) => {
    if (typeof window !== 'undefined' && (window as any).ga) {
      (window as any).ga('send', 'event', {
        eventCategory: 'SignUp',
        eventLabel: `${event} click`,
        eventAction: event,
        eventValue: 10,
      });
    }
  };



  const signupValidationSchema = Yup.object({
    firstName: Yup.string()
      .required('First name is required')
      .matches(validationPatterns.PATTERN_FOR_ALPHABATES_AND_SPACE, 'First name can only contain letters and spaces'),

    lastName: Yup.string()
      .required('Last name is required')
      .matches(validationPatterns.PATTERN_FOR_ALPHABATES_AND_SPACE, 'Last name can only contain letters and spaces'),

    companyName: Yup.string()
      .trim()
      .required('Organization name is required'),

    email: Yup.string()
      .required('Email is required')
      .matches(
        new RegExp('[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,50}'),
        'Please enter a valid email address'
      ),

    password: Yup.string()
      .required('Password is required')
      .matches(
        validationPatterns.PATTERN_FOR_PASSWORD,
        'Password must be between 8 and 60 characters in length'
      ),

    phoneNumber: Yup.string()
      .required('Phone number is required')
      .matches(
        validationPatterns.PATTERN_FOR_PHONE_NO,
        'Please enter a valid phone number'
      ),

    terms: Yup.boolean().oneOf([true], 'You must accept the terms and conditions'),
  });

  return {
    flagForPasswordHideShow,
    togglePasswordVisibility,
    currentStep,
    setCurrentStep,
    isLoading,
    validationPatterns,
    validationMessages,
    signupUser,
    sendEvent,
    signupValidationSchema,
  };
};