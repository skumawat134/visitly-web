import React from 'react';
import {
  Pencil,
  X,
  Mail,
  Phone,
  PhoneCall,
  Hash,
  Calendar,
  UserCheck,     // for status ACTIVE
  Briefcase,
  Building2,
  BadgeCheck,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { useProfile } from '../hooks/useProfile'; // assuming you still use this hook

const Profile: React.FC = () => {
  const {
    profile,
    isLoading,
    handleImageChange,
    handleDeleteImage,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    previewImage,
    isUpdating,
    // if your hook has error flags like invalid size / extension → add them here
  } = useProfile();

  if (isLoading || !profile) {
    return (
      <div className="tw:flex tw:items-center tw:justify-center tw:min-h-[60vh]">
      </div>
    );
  }

  const hasCustomImage = !!previewImage || !!profile.avatarUri;

  return (
    <div className="tw:min-h-screen tw:bg-gray-50 tw:p-4 tw:md:p-6">
      <div className="tw:max-full tw:mx-auto">
        {/* Card */}
        <div className="tw:bg-white tw:rounded-lg tw:border tw:border-gray-200 tw:shadow-sm">
          {/* Card Header */}
          <div className="tw:px-6 tw:py-4 tw:border-b tw:border-gray-200">
            <h4 className="tw:mb-0 tw:text-lg tw:font-semibold tw:text-gray-800">Profile</h4>
          </div>

          {/* Card Body */}
          <div className="tw:p-6">
            <div className="tw:flex tw:flex-col tw:sm:flex-row tw:gap-10 tw:mb-8">
              {/* Avatar Column */}
              <div className="tw:flex tw:flex-row tw:items-start tw:shrink-0">
                <div className="tw:relative">
                  <div className="tw:w-24 tw:h-24 tw:rounded-full tw:overflow-hidden tw:bg-gray-100 tw:border tw:border-gray-300">
                    <img
                      src={previewImage || profile.avatarUri || '/assets/images/defaultuser.jpg'}
                      alt="User profile"
                      className="tw:w-full tw:h-full tw:object-cover"
                    />
                    {isUpdating && (
                      <div className="tw:absolute tw:inset-0 tw:bg-black/30 tw:flex tw:items-center tw:justify-center">
                        <Loader2 className="tw:w-8 tw:h-8 tw:text-white tw:animate-spin" />
                      </div>
                    )}
                  </div>

                  {/* Edit pencil button */}
                  <label className="tw:absolute tw:-bottom-2 tw:-right-2 tw:bg-purple-600 tw:text-white tw:p-2 tw:rounded-full tw:cursor-pointer tw:shadow-md hover:tw:bg-purple-700">
                    <Pencil size={16} />
                    <input
                      type="file"
                      accept="image/x-png,image/jpeg"
                      className="tw:hidden"
                      onChange={handleImageChange}
                    />
                  </label>

                  {/* Delete button */}
                  {hasCustomImage && (
                    <button
                      onClick={() => setIsDeleteModalOpen(true)}
                      className="tw:absolute tw:-top-2 tw:-right-2 tw:bg-red-500 tw:text-white tw:p-1.5 tw:rounded-full tw:shadow-md hover:tw:bg-red-600"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                {/* Optional error messages (if your hook exposes them) */}
                {/* {flagForInvalidUserImageSize && (
                  <span className="tw:mt-2 tw:text-sm tw:text-red-600">
                    Image must be less than 5 MB.
                  </span>
                )} */}
              </div>

              {/* Name */}
              <div className="tw:flex-1">
                <label className="tw:block tw:text-sm tw:font-medium tw:text-gray-600 tw:mb-1">
                  Name
                </label>
                <h3 className="tw:text-2xl tw:font-semibold tw:text-gray-900">
                  {profile.firstName} {profile.lastName}
                </h3>
              </div>
            </div>

            {/* Fields Grid */}
            <div className="tw:grid tw:grid-cols-1 tw:sm:grid-cols-2 tw:lg:grid-cols-4 tw:gap-6">
              <div>
                <label className="tw:block tw:text-sm tw:font-medium tw:text-gray-600 tw:mb-1">Email</label>
                <h5 className="tw:text-base tw:font-medium tw:text-gray-900 tw:break-all">
                  {profile.email || '—'}
                </h5>
              </div>

              <div>
                <label className="tw:block tw:text-sm tw:font-medium tw:text-gray-600 tw:mb-1">Mobile</label>
                <h5 className="tw:text-base tw:font-medium tw:text-gray-900">
                  {profile.mobilePhone || '—'}
                </h5>
              </div>

              <div>
                <label className="tw:block tw:text-sm tw:font-medium tw:text-gray-600 tw:mb-1">Work Number</label>
                <h5 className="tw:text-base tw:font-medium tw:text-gray-900">
                  {profile.workPhone || '—'}
                </h5>
              </div>

              <div>
                <label className="tw:block tw:text-sm tw:font-medium tw:text-gray-600 tw:mb-1">Extension</label>
                <h5 className="tw:text-base tw:font-medium tw:text-gray-900">
                  {profile.extension || '—'}
                </h5>
              </div>

              <div>
                <label className="tw:block tw:text-sm tw:font-medium tw:text-gray-600 tw:mb-1">Create Date</label>
                <h5 className="tw:text-base tw:font-medium tw:text-gray-900">
                  {profile.createTime ? format(new Date(profile.createTime), 'dd MMM yy') : '—'}
                </h5>
              </div>

              <div>
                <label className="tw:block tw:text-sm tw:font-medium tw:text-gray-600 tw:mb-1">Status</label>
                <div
                  className={`tw:inline-block tw:px-3 tw:py-1 tw:text-xs tw:font-semibold tw:rounded-full tw:border ${
                    profile.status === 'ACTIVE'
                      ? 'tw:bg-green-50 tw:text-green-700 tw:border-green-200'
                      : 'tw:bg-red-50 tw:text-red-600 tw:border-red-200'
                  }`}
                >
                  {profile.status || '—'}
                </div>
              </div>

              {profile.title && (
                <div>
                  <label className="tw:block tw:text-sm tw:font-medium tw:text-gray-600 tw:mb-1">Title</label>
                  <h5 className="tw:text-base tw:font-medium tw:text-gray-900">{profile.title}</h5>
                </div>
              )}

              {profile.department && (
                <div>
                  <label className="tw:block tw:text-sm tw:font-medium tw:text-gray-600 tw:mb-1">Department</label>
                  <h5 className="tw:text-base tw:font-medium tw:text-gray-900">{profile.department}</h5>
                </div>
              )}

              {profile.employeeId && (
                <div>
                  <label className="tw:block tw:text-sm tw:font-medium tw:text-gray-600 tw:mb-1">Employee Id</label>
                  <h5 className="tw:text-base tw:font-medium tw:text-gray-900">{profile.employeeId}</h5>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="tw:fixed tw:inset-0 tw:z-50 tw:flex tw:items-center tw:justify-center tw:bg-black/50 tw:p-4">
          <div className="tw:bg-white tw:rounded-lg tw:max-w-md tw:w-full tw:p-6 tw:shadow-xl">
            <div className="tw:text-center">
              <AlertTriangle size={48} className="tw:mx-auto tw:text-yellow-500 tw:mb-4" />
              <h2 className="tw:text-xl tw:font-semibold tw:text-gray-900 tw:mb-3">Are you sure?</h2>
              <p className="tw:text-gray-600 tw:mb-6">
                Do you really want to delete profile image?
              </p>
              <div className="tw:flex tw:gap-4 tw:justify-center">
                <button
                  onClick={handleDeleteImage}
                  className="tw:px-6 tw:py-2.5 tw:bg-blue-600 tw:text-white tw:font-medium tw:rounded hover:tw:bg-blue-700"
                >
                  Yes
                </button>
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="tw:px-6 tw:py-2.5 tw:bg-gray-200 tw:text-gray-800 tw:font-medium tw:rounded hover:tw:bg-gray-300"
                >
                  No
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;