import React, { useState } from "react";
import {
  Camera,
  Pencil,
  Lock,
  LogOut,
  Shield,
  Mail,
  Phone,
  Building,
  Briefcase,
  Calendar,
  User,
  Key,
    Eye,
  EyeOff,
  AlertTriangle,
  Loader2,
  X,
  Hash
} from "lucide-react";
import { format } from "date-fns";
import { useProfile } from "../../profile/hooks/useProfile";
import { useChangePassword } from "../../change-password/hooks/useChangePassword";
import { Avatar } from "../../host-dashboard/components/Avatar";
import { Input, Button, cn } from "@visitly/ui"
import InfoField from "../components/InfoField";

// ---------------------------------------------------------------------------
// Helpers & Sub-components
// ---------------------------------------------------------------------------


const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const isActive = status === "ACTIVE";
  return (
    <span
      className={cn(
        "tw:px-3 tw:py-1 tw:rounded-full tw:text-[12px] tw:font-bold tw:flex tw:items-center tw:gap-1.5",
        isActive
          ? "tw:bg-emerald-50 tw:text-emerald-600 tw:border tw:border-emerald-100"
          : "tw:bg-rose-50 tw:text-rose-600 tw:border tw:border-rose-100"
      )}
    >
      <span className={cn("tw:w-1.5 tw:h-1.5 tw:rounded-full", isActive ? "tw:bg-emerald-500" : "tw:bg-rose-500")} />
      {status}
    </span>
  );
};

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

const ProfileDetail: React.FC = () => {
  const {
    profile,
    isLoading: isProfileLoading,
    handleImageChange,
    handleDeleteImage,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    previewImage,
    isUpdating
  } = useProfile();

  const { formik, isSubmitting: isPasswordSubmitting, showPassword } = useChangePassword();
  const [showCurrent, setShowCurrent] = showPassword.current;
  const [showNew, setShowNew] = showPassword.new;
  const [showConfirm, setShowConfirm] = showPassword.confirm;

  if (isProfileLoading || !profile) {
    return (
      <div className="tw:flex tw:items-center tw:justify-center tw:min-h-[60vh]">
        {/* <Loader2 className="tw:w-8 tw:h-8 tw:text-indigo-600 tw:animate-spin" /> */}
      </div>
    );
  }

  const fullName = `${profile.firstName} ${profile.lastName}`;
  const hasCustomImage = !!previewImage || !!profile.avatarUri;

  return (
    <div className="tw:min-h-screen tw:bg-[#F8FAFC] tw:pb-12">
      {/* Page Header */}
      <div className="tw:bg-transparent tw:mb-2">
        <div className="tw:max-w-full tw:mx-auto tw:px-6 tw:py-6 tw:md:py-8">
          <h1 className="tw:text-3xl tw:font-bold tw:text-slate-900 tw:tracking-tight">Profile</h1>
          <p className="tw:text-slate-500 tw:mt-2 tw:text-[16px] tw:font-medium">
            Manage your account and preferences
          </p>
        </div>
      </div>

      <div className="tw:max-w-full tw:mx-auto tw:px-6">
        {/* Profile Card */}
        <div className="tw:bg-white tw:rounded-[12px] tw:p-4 tw:mb-8 tw:border tw:border-slate-200/60 tw:shadow-sm tw:flex tw:flex-col tw:lg:flex-row tw:items-center tw:gap-8">
          <div className="tw:flex tw:items-center tw:gap-8 tw:flex-1 tw:w-full">
            {/* Avatar with upload overlay */}
            <div className="tw:relative tw:group">
              <div className="tw:w-[100px] tw:h-[100px] tw:rounded-full tw:overflow-hidden tw:border-4 tw:border-white tw:shadow-md tw:bg-slate-50">
                <Avatar name={fullName} src={previewImage || profile.avatarUri || undefined} size={100} />
              </div>

              <label className="tw:absolute tw:inset-0 tw:rounded-full tw:bg-black/50 tw:flex tw:flex-col tw:items-center tw:justify-center tw:gap-1.5 tw:opacity-0 tw:group-hover:tw:opacity-100 tw:transition-all tw:cursor-pointer tw:duration-300">
                <Camera size={18} className="tw:text-white" />
                <span className="tw:text-white tw:text-[10px] tw:font-bold tw:uppercase tw:tracking-widest">Update</span>
                <input
                  type="file"
                  accept="image/x-png,image/jpeg"
                  className="tw:hidden"
                  onChange={handleImageChange}
                />
              </label>

              {hasCustomImage && (
                <button
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="tw:absolute tw:-top-1 tw:-right-1 tw:bg-white tw:text-rose-600 tw:p-2 tw:rounded-full tw:shadow-lg tw:border tw:border-slate-100 hover:tw:bg-rose-50 tw:transition-all tw:z-10"
                >
                  <X size={14} />
                </button>
              )}

              {isUpdating && (
                <div className="tw:absolute tw:inset-0 tw:bg-white/60 tw:rounded-full tw:flex tw:items-center tw:justify-center tw:z-20">
                  {/* <Loader2 className="tw:w-6 tw:h-6 tw:text-indigo-600 tw:animate-spin" /> */}
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="tw:flex-1">
              <div className="tw:flex tw:items-center tw:gap-4 tw:mb-2">
                <h2 className="tw:text-2xl tw:font-bold tw:text-slate-900 tw:tracking-tight">
                  {fullName}
                </h2>
                <StatusBadge status={profile.status || "ACTIVE"} />
              </div>

              <div className="tw:flex tw:flex-col tw:gap-2 tw:flex-wrap">
                <div className="tw:flex tw:items-center tw:gap-2 tw:text-slate-500 tw:text-[14px]">
                  <Mail size={14} className="tw:text-slate-400" />
                  {profile.email} 
                </div>
                <div className="tw:flex tw:items-center tw:gap-2 tw:text-slate-500 tw:text-[14px]">
                  <Building size={14} className="tw:text-slate-400" />
                  {profile.department || "Organization"}
                </div>
                <div className="tw:flex tw:items-center tw:gap-2 tw:text-slate-500 tw:text-[14px]">
                  <Briefcase size={14} className="tw:text-slate-400" />
                  {profile.title || "User"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Two-column Grid */}
        <div className="tw:grid tw:lg:grid-cols-2 tw:gap-8">
          {/* Left Column */}
          <div className="tw:flex tw:flex-col tw:gap-8">
            {/* Personal Information Card */}
            <div className="tw:bg-white tw:rounded-[12px] tw:p-8 tw:border tw:border-slate-200/60 tw:shadow-sm">
              <div className="tw:flex tw:items-center tw:justify-between tw:mb-6">
                <div className="tw:flex tw:items-center tw:gap-2">
                  <User size={20} className="tw:text-indigo-600" />
                  <h3 className="tw:text-lg tw:font-bold tw:text-slate-900">Personal Information</h3>
                </div>
                {/* <Button variant="ghost" className="tw:h-8 tw:px-3 tw:text-[13px] tw:font-bold tw:text-indigo-600">
                  <Pencil size={14} className="tw:mr-2" />
                  Edit
                </Button> */}
              </div>

              <div className="tw:grid tw:sm:grid-cols-2 tw:gap-x-8">
                <InfoField icon={User} label="First Name" value={profile.firstName} />
                <InfoField icon={User} label="Last Name" value={profile.lastName} />
                <div className="tw:sm:col-span-2">
                  <InfoField icon={Mail} label="Email" value={profile.email} />
                </div>
                <InfoField icon={Building} label="Department" value={profile.department} />
                <InfoField icon={Briefcase} label="Title" value={profile.title} />
                <InfoField icon={Phone} label="Work Phone" value={profile.workPhone} />
                <InfoField icon={Phone} label="Mobile Phone" value={profile.mobilePhone} />
                <InfoField icon={Key} label="Extension" value={profile.extension} />
                <InfoField icon={Hash} label="Employee Id" value={profile.employeeId} />
                <InfoField icon={Calendar} label="Member Since" value={profile.createTime ? format(new Date(profile.createTime), "MMM dd, yyyy") : "---"} />

              </div>
            </div>

            {/* Sign-in Settings Card */}
            {/* <div className="tw:bg-white tw:rounded-[12px] tw:p-8 tw:border tw:border-slate-200/60 tw:shadow-sm">
              <div className="tw:flex tw:items-center tw:gap-2 tw:mb-6">
                <Shield size={20} className="tw:text-indigo-600" />
                <h3 className="tw:text-lg tw:font-bold tw:text-slate-900">Sign-in Settings</h3>
              </div>

              <div className="tw:space-y-4">
                <div className="tw:flex tw:items-center tw:justify-between tw:py-4 tw:border-b tw:border-slate-50">
                  <div>
                    <div className="tw:text-sm tw:font-bold tw:text-slate-700">Allow Sign-in</div>
                    <div className="tw:text-[12px] tw:text-slate-500 tw:mt-0.5">Controls whether you can sign in to the portal</div>
                  </div>
                  <span className="tw:px-3 tw:py-1 tw:bg-emerald-50 tw:text-emerald-600 tw:rounded-full tw:text-[13px] tw:font-bold tw:flex tw:items-center tw:gap-1.5">
                    <span className="tw:w-1.5 tw:h-1.5 tw:rounded-full tw:bg-emerald-500" />
                    Enabled
                  </span>
                </div>

                <div className="tw:flex tw:items-center tw:justify-between tw:py-4 tw:border-b tw:border-slate-50">
                  <div className="tw:text-sm tw:font-bold tw:text-slate-700">Organization ID</div>
                  <div className="tw:text-[14px] tw:font-bold tw:text-slate-800">{profile.orgId || "Visitly Inc."}</div>
                </div>

                <div className="tw:flex tw:items-center tw:justify-between tw:py-4">
                  <div className="tw:flex tw:items-center tw:gap-2">
                    <Calendar size={14} className="tw:text-slate-400" />
                    <span className="tw:text-sm tw:font-bold tw:text-slate-700">Member since</span>
                  </div>
                  <div className="tw:text-[14px] tw:font-bold tw:text-slate-800">
                    {profile.createTime ? format(new Date(profile.createTime), "MMM dd, yyyy") : "---"}
                  </div>
                </div>
              </div>
            </div> */}
          </div>

          {/* Right Column */}
          <div className="tw:flex tw:flex-col tw:gap-8">
            {/* Change Password Card */}
            <div className="tw:bg-white tw:rounded-[12px] tw:p-8 tw:border tw:border-slate-200/60 tw:shadow-sm">
              <div className="tw:flex tw:items-center tw:gap-2 tw:mb-8">
                <Lock size={20} className="tw:text-indigo-600" />
                <h3 className="tw:text-lg tw:font-bold tw:text-slate-900">Change Password</h3>
              </div>

              <form onSubmit={formik.handleSubmit} className="tw:space-y-6">
                <Input
                  name="currentPassword"
                  type={showCurrent ? "password" : "text"}
                  label="Current Password"
                  placeholder="Enter current password"
                  error={formik.touched.currentPassword && formik.errors.currentPassword ? formik.errors.currentPassword : undefined}
                  leftIcon={<Lock size={16} className="tw:text-slate-400" />}
                  rightIcon={showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                  rightIconClickable
                  onRightIconClick={() => setShowCurrent(!showCurrent)}
                  value={formik.values.currentPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="tw:rounded-2xl tw:bg-slate-50/50 tw:border-slate-200"
                />

                <Input
                  name="newPassword"
                  type={showNew ? "password" : "text"}
                  label="New Password"
                  placeholder="Enter new password"
                  error={formik.touched.newPassword && formik.errors.newPassword ? formik.errors.newPassword : undefined}
                  leftIcon={<Lock size={16} className="tw:text-slate-400" />}
                  rightIcon={showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                  rightIconClickable
                  onRightIconClick={() => setShowNew(!showNew)}
                  value={formik.values.newPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="tw:rounded-2xl tw:bg-slate-50/50 tw:border-slate-200"
                />

                <Input
                  name="confirmPassword"
                  type={showConfirm ? "password" : "text"}
                  label="Confirm New Password"
                  placeholder="Confirm your new password"
                  error={formik.touched.confirmPassword && formik.errors.confirmPassword ? formik.errors.confirmPassword : undefined}
                  leftIcon={<Lock size={16} className="tw:text-slate-400" />}
                  rightIcon={showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  rightIconClickable
                  onRightIconClick={() => setShowConfirm(!showConfirm)}
                  value={formik.values.confirmPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="tw:rounded-2xl tw:bg-slate-50/50 tw:border-slate-200"
                />

                <div className="tw:p-4 tw:bg-slate-50 tw:rounded-2xl tw:text-[12px] tw:text-slate-500 tw:font-medium tw:leading-relaxed">
                  Password must be between 8 and 60 characters and match the confirmation.
                </div>

                <Button
                  type="submit"
                  disabled={isPasswordSubmitting}
                  className="tw:w-full tw:h-12 tw:rounded-2xl tw:bg-slate-900 tw:text-white tw:font-bold tw:flex tw:items-center tw:justify-center tw:gap-2 hover:tw:bg-slate-800 disabled:tw:opacity-60 tw:transition-all"
                >
                  {isPasswordSubmitting ? <Loader2 size={18} className="tw:animate-spin" /> : <Lock size={18} />}
                  Update Password
                </Button>
              </form>
            </div>

            {/* Account Actions Card */}
            {/* <div className="tw:bg-white tw:rounded-[12px] tw:p-8 tw:border tw:border-slate-200/60 tw:shadow-sm">
              <div className="tw:flex tw:items-center tw:gap-2 tw:mb-8">
                <MonitorSmartphone size={20} className="tw:text-indigo-600" />
                <h3 className="tw:text-lg tw:font-bold tw:text-slate-900">Account Actions</h3>
              </div>

              <div className="tw:flex tw:flex-col tw:gap-4">
                <Button
                  className="tw:w-full tw:h-12 tw:rounded-2xl tw:bg-rose-500 tw:text-white tw:font-bold tw:flex tw:items-center tw:justify-center tw:gap-2 hover:tw:bg-rose-600 tw:border-none"
                  onClick={() => alert("Signing out...")}
                >
                  <LogOut size={18} />
                  Sign Out
                </Button>

                <Button
                  variant="outline"
                  className="tw:w-full tw:h-12 tw:rounded-2xl tw:text-slate-700 tw:font-bold tw:flex tw:items-center tw:justify-center tw:gap-2 tw:border-slate-200 hover:tw:bg-slate-50"
                  onClick={() => alert("Signing out of all devices...")}
                >
                  <MonitorSmartphone size={18} />
                  Sign Out of All Devices
                </Button>

                <p className="tw:text-center tw:text-[12px] tw:font-medium tw:text-slate-400 tw:mt-2">
                  This will sign you out of all active sessions across devices
                </p>
              </div>
            </div> */}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="tw:fixed tw:inset-0 tw:z-50 tw:flex tw:items-center tw:justify-center tw:bg-slate-900/40 tw:backdrop-blur-sm tw:p-4">
          <div className="tw:bg-white tw:rounded-[12px] tw:max-w-md tw:w-full tw:p-8 tw:shadow-2xl tw:animate-in tw:fade-in tw:zoom-in-95">
            <div className="tw:text-center">
              <div className="tw:w-16 tw:h-16 tw:bg-rose-50 tw:rounded-2xl tw:flex tw:items-center tw:justify-center tw:mx-auto tw:mb-6">
                <AlertTriangle size={32} className="tw:text-rose-500" />
              </div>
              <h2 className="tw:text-2xl tw:font-bold tw:text-slate-900 tw:mb-3">Remove Photo?</h2>
              <p className="tw:text-slate-500 tw:mb-8 tw:font-medium">
                Are you sure you want to remove your profile picture? This action cannot be undone.
              </p>
              <div className="tw:flex tw:gap-4">
                <Button
                  onClick={() => setIsDeleteModalOpen(false)}
                  variant="primary"
                  className="tw:flex-1 tw:h-12 tw:rounded-2xl  tw:font-bold hover:tw:bg-slate-200"
                >
                  Keep It
                </Button>
                <Button
                  onClick={handleDeleteImage}
                  variant="outline"
                  className="tw:flex-1 tw:h-12 tw:rounded-2xl tw:font-bold hover:tw:bg-rose-600"
                >
                  Remove
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDetail;