
import { useEffect, useState } from 'react';
import * as Yup from 'yup';
import { useLoginMutation } from '../services/useLoginMutation';
import { useFormik } from 'formik';
import { useSsoMutation } from '../services/useSsoMutation';
const useLogin = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [step, setStep] = useState<'email' | 'password' | 'sso'>('email');
    const [ssoUrl, setSsoUrl] = useState<string | null>(null);
    const { mutate } = useLoginMutation();
    const checkSSO = useSsoMutation();

    const validationSchema = Yup.object({
        email: Yup.string()
            .email('Invalid email address')
            .required('Username or Company Email is required'),
        password: Yup.string().when('email', {
            is: () => step === 'password', // Only require password if we are in password step
            then: (schema) => schema.required('Password is required'),
            otherwise: (schema) => schema.notRequired(),
        }),
    });

    const formik = useFormik({
        initialValues: {
            email: '',
            password: '',
        },
        validationSchema,
        onSubmit: (values) => {
            if (step === 'sso') {
                if (ssoUrl) window.location.href = ssoUrl;
                return;
            }
            // If simple log in (assuming password is always required if not sso)
            if (step === 'email' || step === 'password') {
                // If we haven't asked for password yet and it's not SSO, technically we should check logic.
                // But for this single page flow, we'll assume we submit credentials together or check password presence
                if (!values.password) return; // Should be handled by YUP but double check
               mutate({ email: values.email, password: values.password });
            }
        },
    });

    // Debounce email check for SSO
    useEffect(() => {
        if (!formik.values.email || formik.errors.email) return;
        const handler = setTimeout(() => {
            if (checkSSO.isPending) return;
            checkSSO.mutate(
                { email: formik.values.email }, // ✅ correct payload
                {
                    onSuccess: (data) => {
                        if (data.ssoRequestUrl) {
                            setStep("sso");
                            setSsoUrl(data.ssoRequestUrl);
                        } else if (step === "sso") {
                            setStep("email");
                            setSsoUrl(null);
                        }
                    },
                }
            );
        }, 500);
        return () => clearTimeout(handler);
    }, [formik.values.email]);

    const { handleSubmit, touched, errors, values, handleBlur, handleChange } = formik;
    const showPasswordField = step !== 'sso';
    return {
        handleSubmit, showPassword, 
        isSubmitting, setShowPassword,
        touched, errors, values,
        showPasswordField,
        handleBlur,
        handleChange, setStep,
        ssoUrl
    }

}

export default useLogin;