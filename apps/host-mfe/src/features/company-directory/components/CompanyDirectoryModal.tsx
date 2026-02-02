import { X } from "lucide-react";
import { format } from "date-fns";

interface CompanyDirectoryModal {
  isOpen: boolean;
  user: any;
  onClose: () => void;
}

export function CompanyDirectoryModal({
  isOpen,
  user,
  onClose,
}: CompanyDirectoryModal) {
  if (!isOpen || !user) return null;

  const formatDate = (date?: string) => {
    if (!date) return "—";
    try {
      return format(new Date(date), "dd MMM yy h:mm a");
    } catch {
      return "—";
    }
  };

  return (
    <div className="tw:fixed tw:inset-0 tw:z-50 tw:flex tw:items-center tw:justify-center tw:bg-black/60">
      <div
        className="
          tw:bg-white 
          tw:rounded-lg 
          tw:shadow-2xl 
          tw:w-full 
          tw:max-w-[550px] 
          tw:mx-4 
          tw:max-h-[90vh] 
          tw:flex 
          tw:flex-col 
          tw:overflow-hidden
        "
      >
        {/* Header */}
        <div className="tw:flex tw:items-center tw:justify-between tw:px-5 tw:py-3 tw:border-b tw:border-gray-200 tw:bg-gray-50">
          <h3 className="tw:text-lg tw:font-semibold tw:text-gray-800">
            View Directory
          </h3>

          <button
            onClick={onClose}
            className="tw:p-1 tw:rounded-full hover:tw:bg-gray-200 tw:transition-colors"
          >
            <X size={20} className="tw:text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="tw:overflow-y-auto tw:flex-1 tw:p-5 tw:space-y-6 tw:text-sm">
          {/* ========== User Details ========== */}
          <div>
            <div className="tw:pb-2 tw:mb-4 tw:border-b tw:border-gray-300">
              <h4 className="tw:text-base tw:font-semibold tw:text-gray-800">
                User Details
              </h4>
            </div>

            <div className="tw:flex tw:gap-6 tw:items-start">
              {/* Avatar */}
              <div className="tw:flex-shrink-0">
                <div className="tw:w-20 tw:h-20 tw:rounded-full tw:bg-gray-200 tw:flex tw:items-center tw:justify-center tw:border tw:border-gray-300 overflow-hidden">
                  {user.avatarUri ? (
                    <img
                      src={user.avatarUri}
                      alt="Avatar"
                      className="tw:w-full tw:h-full tw:object-cover"
                    />
                  ) : (
                    <svg
                      className="tw:w-12 tw:h-12 tw:text-gray-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                    </svg>
                  )}
                </div>
              </div>

              {/* Right side information */}
              <div className="tw:flex-1 tw:grid tw:grid-cols-2 tw:gap-x-8 tw:gap-y-4">
                <div>
                  <div className="tw:text-gray-600 tw:font-medium">Name</div>
                  <div className="tw:mt-0.5 tw:text-gray-900">
                    {user.firstName} {user.lastName}
                  </div>
                </div>

                <div>
                  <div className="tw:text-gray-600 tw:font-medium">Email</div>
                  <div className="tw:mt-0.5 tw:text-gray-900 tw:break-all">
                    {user.email || "—"}
                  </div>
                </div>

                <div>
                  <div className="tw:text-gray-600 tw:font-medium">Title</div>
                  <div className="tw:mt-0.5 tw:text-gray-900">
                    {user.title || "—"}
                  </div>
                </div>

                <div>
                  <div className="tw:text-gray-600 tw:font-medium">
                    Department
                  </div>
                  <div className="tw:mt-0.5 tw:text-gray-900">
                    {user.department || "—"}
                  </div>
                </div>

                <div>
                  <div className="tw:text-gray-600 tw:font-medium">
                    Mobile No.
                  </div>
                  <div className="tw:mt-0.5 tw:text-gray-900">
                    {user.mobilePhone || "—"}
                  </div>
                </div>

                <div>
                  <div className="tw:text-gray-600 tw:font-medium">
                    Extension
                  </div>
                  <div className="tw:mt-0.5 tw:text-gray-900">
                    {user.extension || "—"}
                  </div>
                </div>

                <div>
                  <div className="tw:text-gray-600 tw:font-medium">
                    Work Number
                  </div>
                  <div className="tw:mt-0.5 tw:text-gray-900">
                    {user.workPhone || "—"}
                  </div>
                </div>

                <div>
                  <div className="tw:text-gray-600 tw:font-medium">
                    Created Date
                  </div>
                  <div className="tw:mt-0.5 tw:text-gray-900">
                    {formatDate(user.createTime)}
                  </div>
                </div>

                <div>
                  <div className="tw:text-gray-600 tw:font-medium">Status</div>
                  <div className="tw:mt-0.5 tw:text-gray-900">
                    {user.status || "—"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
