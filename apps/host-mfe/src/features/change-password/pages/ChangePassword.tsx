import React from "react";
import { Eye, EyeOff, Lock, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button, Input } from "@visitly/ui"; // assuming Input is exported from here
import { useChangePassword } from "../hooks/useChangePassword";

const ChangePassword: React.FC = () => {
  const { formik, isSubmitting, showPassword } = useChangePassword();

  const [showCurrent, setShowCurrent] = showPassword.current;
  const [showNew, setShowNew] = showPassword.new;
  const [showConfirm, setShowConfirm] = showPassword.confirm;

  return (
    <div className="tw:min-h-screen tw:bg-gray-50 tw:px-4 tw:py-6 md:tw:py-10">
      <div className="tw:max-w-[100vw] tw:mx-auto">
        {/* Card with left accent border */}
        <div className="tw:bg-white tw:shadow tw:rounded-lg tw:overflow-hidden">
          {/* Header */}
          <div className="tw:px-6 tw:py-4 tw:border-b tw:border-gray-200 tw:border-l-4 tw:border-l-[#5E2CED]">
            <h1 className="tw:text-xl md:tw:text-2xl tw:font-bold tw:text-gray-800 tw:pl-3">
              Change Password
            </h1>
          </div>

          <form onSubmit={formik.handleSubmit} className="tw:p-6 tw:space-y-6">
            {/* Current Password */}
            <Input
              name="currentPassword"
              type={showCurrent ? "password" : "text"}
              label="Current Password"
              placeholder="Current Password"
              error={
                formik.touched.currentPassword && formik.errors.currentPassword
                  ? formik.errors.currentPassword
                  : undefined
              }
              leftIcon={<Lock className="tw:h-4 tw:w-4" />}
              rightIcon={
                showCurrent ? (
                  <EyeOff className="tw:h-4 tw:w-4" />
                ) : (
                  <Eye className="tw:h-4 tw:w-4" />
                )
              }
              rightIconClickable
              onRightIconClick={() => setShowCurrent(!showCurrent)}
              className="tw:full tw:md:w-1/2 tw:lg:w-1/3"
              value={formik.values.currentPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />

            {/* New Password */}
            <Input
              name="newPassword"
              type={showNew ? "password" : "text"}
              label="New Password"
              placeholder="New Password"
              error={
                formik.touched.newPassword && formik.errors.newPassword
                  ? formik.errors.newPassword
                  : undefined
              }
              leftIcon={<Lock className="tw:h-4 tw:w-4" />}
              rightIcon={
                showNew ? (
                  <EyeOff className="tw:h-4 tw:w-4" />
                ) : (
                  <Eye className="tw:h-4 tw:w-4" />
                )
              }
              rightIconClickable
              onRightIconClick={() => setShowNew(!showNew)}
              className="tw:full tw:md:w-1/2 tw:lg:w-1/3"
              value={formik.values.newPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />

            {/* Confirm Password */}
            <Input
              name="confirmPassword"
              type={showConfirm ? "password" : "text"}
              label="Confirm Password"
              placeholder="Confirm Password"
              error={
                formik.touched.confirmPassword && formik.errors.confirmPassword
                  ? formik.errors.confirmPassword
                  : undefined
              }
              leftIcon={<Lock className="tw:h-4 tw:w-4" />}
              rightIcon={
                showConfirm ? (
                  <EyeOff className="tw:h-4 tw:w-4" />
                ) : (
                  <Eye className="tw:h-4 tw:w-4" />
                )
              }
              rightIconClickable
              onRightIconClick={() => setShowConfirm(!showConfirm)}
              className="tw:full tw:md:w-1/2 tw:lg:w-1/3"
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />

            {/* Buttons */}
            <div className="tw:flex tw:justify-end tw:gap-4 tw:pt-6">
              <Button variant="outline">
                 <Link
                to="/host/past-visitor"
                className="tw:px-6 tw:py-2.5 tw:text-sm tw:font-medium tw:text-gray-600 hover:tw:text-gray-800 tw:transition-colors"
              >
                No, Thanks
              </Link>
             </Button>

              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
                className={`
                  tw:flex tw:items-center tw:gap-2 tw:px-8 tw:py-2.5
                  tw:rounded tw:font-medium tw:text-white
                  tw:bg-purple-600 hover:tw:bg-purple-700 disabled:tw:opacity-60
                  tw:transition-colors
                `}
              >
                {isSubmitting ? (
                  <div className="tw:h-4 tw:w-4 tw:animate-spin tw:rounded-full tw:border-2 tw:border-white/30 tw:border-t-white" />
                ) : (
                  <CheckCircle2 size={16} />
                )}
                Yes, Sure
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
