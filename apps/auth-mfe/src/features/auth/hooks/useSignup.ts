import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SignupFormValues } from '../components/SignupForm';

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

  const goToStep2 = (values: SignupFormValues, errors: any, touched: any) => {
    const requiredFields = ['firstName', 'lastName', 'email', 'password', 'phoneNumber'];
    let hasErrors = false;

    requiredFields.forEach(field => {
      if (errors[field]) {
        hasErrors = true;
      }
    });

    if (!hasErrors) {
      setCurrentStep(2);
    }
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

      // Here you would call your API
      // Example:
      // const response = await apiService.createUser(userObj);
      
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate to confirmation page on success
      navigate('/confirmation');
      
      // Integration with external services (FreshSales/HubSpot)
      if (window.location.hostname.toLowerCase() === 'app.visitly.io') {
        // createHubSpot(userObj);
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

  const createHubSpot = async (user: User) => {
    // HubSpot integration logic here
    const payload = {
      submittedAt: Date.now(),
      fields: [
        { name: 'email', value: user.email },
        { name: 'lastname', value: user.lastName },
        { name: 'firstname', value: user.firstName },
        { name: 'company', value: user.companyName },
        { name: 'phone', value: user.phoneNumber || '' },
      ],
      context: {
        pageUri: window.location.href,
        pageName: 'Sign Up',
      },
      skipValidation: false,
    };
    
    // Send to HubSpot
    // await apiService.sendToHubSpot(payload);
  };

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
    goToStep2,
    signupUser,
    sendEvent,
    validateForm,
  };
};