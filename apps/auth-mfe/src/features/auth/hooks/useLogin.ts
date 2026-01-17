
import { useState } from 'react';
import * as Yup from 'yup';
import { useLoginMutation } from '../services/useLoginMutation';
const validationSchema = Yup.object({
    email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
    password: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('Password is required'),
});
const initialValues = {
    email: 'gauravagarwal26+cf2@gmail.com',
    password: '',
};

const useLogin = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { mutate } = useLoginMutation();
    const handleSubmit = async (values: { email: string; password: string }) => {
        setIsSubmitting(true);
        try {
            console.log('Form data', values);
            mutate(values)
        } catch (error) {
            console.error('Login error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };
    return { initialValues, validationSchema, handleSubmit, showPassword, isSubmitting, setShowPassword }

}

export default useLogin;