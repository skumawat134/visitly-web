import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { changePassword as changePasswordApi } from '../api/changePassword.api';
import type { ChangePasswordFormValues } from '../api/changePassword.types';
import { useToastStore } from '@visitly/app-store';

export const useChangePassword = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToastStore((state) => state.showToast)

  // Extract user ID from sessionStorage
  const getUserId = () => {
    const userInfoStr = sessionStorage.getItem('userinfo');
    if (userInfoStr) {
      try {
        const userInfo = JSON.parse(userInfoStr);
        return userInfo.id || '';
      } catch (e) {
        console.error('Error parsing userinfo from session storage', e);
        return '';
      }
    }
    return '';
  };

  // Yup validation schema
  const validationSchema = Yup.object({
    currentPassword: Yup.string().required('Current Password is required!'),
    newPassword: Yup.string()
      .required('New Password is required!')
      .matches(/^.{8,60}$/, 'Password must be between 8 and 60 characters in length'),
    confirmPassword: Yup.string()
      .required('Confirm Password is required!')
      .oneOf([Yup.ref('newPassword')], 'New Password and Confirm Password not equal.'),
  });

  // Formik setup
  const formik = useFormik<ChangePasswordFormValues>({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true);

      const userId = getUserId();
      if (!userId) {
         toast({message : 'User ID not found. Please log in again.'});
        setIsSubmitting(false);
        return;
      }

      try {
        await changePasswordApi({
          userId,
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
          confirmPassword: values.confirmPassword,
        });

        toast({message : 'Your password has been changed successfully.'});
      } catch (error: any) {
        const errorMessage =
          error?.response?.data?.message ||
          'We have encountered an error. If the problem persists, please contact Visitly Support at support@visitly.io';
        toast({message : errorMessage });
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  return {
    formik,
    isSubmitting,
    showPassword: {
      current: useState(true),
      new: useState(true),
      confirm: useState(true),
    },
  };
};
