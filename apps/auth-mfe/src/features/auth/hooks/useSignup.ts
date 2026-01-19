import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SignupFormValues } from '../components/SignupForm';
import { useMutation } from '@tanstack/react-query';
import { createUserApi, createHubSpotApi } from '../services/auth.api';

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

export const useSignup = () => {
  const [flagForPasswordHideShow, setFlagForPasswordHideShow] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Validation patterns (matching your Angular service)
  const validationPatterns: ValidationPatterns = {
    PATTERN_FOR_ALPHABATES_AND_SPACE: /^[a-zA-Z\s]*$/,
    PATTERN_FOR_EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    PATTERN_FOR_PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    PATTERN_FOR_PHONE_NO: /^\+?[1-9]\d{1,14}$/, // E.164 format
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
    PASSWORD_INVALID: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character',
    MOBILE_NUMBER_REQUIRED: 'Phone number is required',
    MOBILE_NUMBER_INVALID: 'Please enter a valid phone number',
  };

  const togglePasswordVisibility = () => {
    setFlagForPasswordHideShow(!flagForPasswordHideShow);
  };

   useEffect(() => {
        // Initial GA Tracking
        console.log('GA Tracking for signup page');
        if ((window as any).ga) {
            (window as any).ga('set', 'page', 'signup page');
            (window as any).ga('send', 'pageview');
        }
    }, []);


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

      const response = await signUpMutation.mutate(userObj);

      // Integration with external services (FreshSales/HubSpot)
      if (window.location.hostname.toLowerCase() === 'app.visitly.io') {
       createHubSpot(userObj);
      }
      
    } catch (error: any) {
      console.error('Signup error:', error);
      // Handle different error statuses
      switch (error?.response?.status) {
        case 400:
          // Show error toast
          break;
        case 409:
          // Show account exists error
          break;
        case 500:
        case 504:
          // Show server error
          break;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signUpMutation = useMutation({
        mutationFn: createUserApi,
        onSuccess: () => {
             if (window.location.hostname.toLowerCase() === 'app.visitly.io') {
             // createHubSpot(userObj);
            }
            
            navigate('/visitly/confirmation', { relative: 'path' });
        },
        onError: (error: any) => {
         
           if (error.status === 409) {
            //    toast.error('An account already exists with this email. Please log in.');
            } else {
             //   toast.error(error.message || 'We have encountered an error. Please contact Visitly Support.');
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

    onSuccess: () => {
      //  console.log('HubSpot integration successful');
    },

    onError: (error: any) => {
        console.error('HubSpot integration error:', error);
    }
});

const getCookieValue = (name : string) => {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : "";
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

  const validateForm = (values: SignupFormValues) => {
    const errors: Partial<SignupFormValues> = {};

    // First Name validation
    if (!values.firstName) {
      errors.firstName = validationMessages.FIRST_NAME_REQUIRED;
    } else if (!validationPatterns.PATTERN_FOR_ALPHABATES_AND_SPACE.test(values.firstName)) {
      errors.firstName = validationMessages.FIRST_NAME_INVALID;
    }

    // Last Name validation
    if (!values.lastName) {
      errors.lastName = validationMessages.LAST_NAME_REQUIRED;
    } else if (!validationPatterns.PATTERN_FOR_ALPHABATES_AND_SPACE.test(values.lastName)) {
      errors.lastName = validationMessages.LAST_NAME_INVALID;
    }

    // Organization Name validation
    if (!values.companyName) {
      errors.companyName = validationMessages.ORGANIZATION_NAME_REQUIRED;
    }

    // Email validation
    if (!values.email) {
      errors.email = validationMessages.EMAIL_REQUIRED;
    } else if (!validationPatterns.PATTERN_FOR_EMAIL.test(values.email)) {
      errors.email = validationMessages.EMAIL_INVALID;
    }

    // Password validation
    if (!values.password) {
      errors.password = validationMessages.PASSWORD_REQUIRED;
    } else if (!validationPatterns.PATTERN_FOR_PASSWORD.test(values.password)) {
      errors.password = validationMessages.PASSWORD_INVALID;
    }

    // Phone validation
    if (!values.phoneNumber) {
      errors.phoneNumber = validationMessages.MOBILE_NUMBER_REQUIRED;
    } else if (!validationPatterns.PATTERN_FOR_PHONE_NO.test(values.phoneNumber)) {
      errors.phoneNumber = validationMessages.MOBILE_NUMBER_INVALID;
    }

    // Terms validation
    if (!values.terms) {
    //   errors.terms = 'You must accept the terms and conditions';
    }

    return errors;
  };

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
    validateForm,
  };
};