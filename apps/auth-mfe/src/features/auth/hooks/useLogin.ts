import { useEffect, useState } from "react";
import * as Yup from "yup";
import { useLoginMutation } from "../services/useLoginMutation";
import { useFormik } from "formik";
import { useSsoMutation } from "../services/useSsoMutation";
import { useNavigate } from "react-router-dom";
import { useToastStore } from "@visitly/app-store";
import { useDebounce } from "@visitly/shared-core";
const useLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<"email" | "password" | "sso">("email");
  const [ssoUrl, setSsoUrl] = useState<string | null>(null);
  const { mutateAsync: login } = useLoginMutation();
  const { showToast } = useToastStore()
  const checkSSO = useSsoMutation();
  const navigate = useNavigate();
  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Invalid email address")
      .required("Username or Company Email is required"),
    password: Yup.string().when("email", {
      is: () => step !== "sso", // Require password if not in SSO step
      then: (schema) => schema.required("Password is required"),
      otherwise: (schema) => schema.notRequired(),
    }),
  });

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {

        if (step === "sso") {
          if (ssoUrl) window.location.href = ssoUrl;
          return;
        }
        // If simple log in (assuming password is always required if not sso)
        if (step === "email" || step === "password") {
          // If we haven't asked for password yet and it's not SSO, technically we should check logic.
          // But for this single page flow, we'll assume we submit credentials together or check password presence
          if (!values.password) return; // Should be handled by YUP but double check
          await login(
            { email: values.email, password: values.password },
          );
          showToast({ message: "Log-in successful!" })
        }
      } catch (error: any) {
        const err = error?.response?.data
        switch (err?.status) {
          case 401:
          case 417: {
            showToast({ message: "Email and password are invalid.", type: "error" });
            break;
          }
          case 400:
            localStorage.setItem(
              "isEmailVerifcationRequired",
              values.email,
            );
            navigate("/visitly/verify-email");
            break;
          case 500:
          case 504:
            showToast({ message: "We have encountered an error. If the problem persists, please contact Visitly Support at support@visitly.io", type: "error" });
            break;
          default:
            showToast({ message: "An unexpected error occurred. Please try again later.", type: "error" });
        }
      } finally {
        setSubmitting(false);
      }
    }

  });

  // Use shared debounce hook for SSO check
  const debouncedEmail = useDebounce(formik.values.email?.trim(), 500);

  useEffect(() => {
    if (!debouncedEmail) {
      if (step === "sso") {
        setStep("email");
        setSsoUrl(null);
      }
      return;
    }

    if (checkSSO.isPending) return;

    checkSSO.mutate(
      { email: debouncedEmail },
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
      },
    );
  }, [debouncedEmail]);

  const {
    handleSubmit,
    touched,
    errors,
    values,
    handleBlur,
    handleChange,
    isSubmitting,
  } = formik;
  const showPasswordField = step !== "sso";
  return {
    handleSubmit,
    showPassword,
    isSubmitting,
    setShowPassword,
    touched,
    errors,
    values,
    showPasswordField,
    handleBlur,
    handleChange,
    setStep,
    ssoUrl,
  };
};

export default useLogin;
