// VisitorDetailsModal.tsx
import { X } from 'lucide-react';
import { format } from 'date-fns';

interface VisitorDetailsModalProps {
  isOpen: boolean;
  visitor: any;
  onClose: () => void;
}

export function VisitorDetailsModal({
  isOpen,
  visitor,
  onClose,
}: VisitorDetailsModalProps) {
  if (!isOpen || !visitor) return null;

  const formatDate = (date?: string) => {
    if (!date) return '—';
    try {
      return format(new Date(date), 'dd MMM yy h:mm a');
    } catch {
      return '—';
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
          tw:max-w-[480px] 
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
            View Past Visitors
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
                <div className="tw:w-20 tw:h-20 tw:rounded-full tw:bg-gray-200 tw:flex tw:items-center tw:justify-center tw:border tw:border-gray-300">
                  <svg
                    className="tw:w-12 tw:h-12 tw:text-gray-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                  </svg>
                </div>
              </div>

              {/* Right side information */}
              <div className="tw:flex-1 tw:grid tw:grid-cols-2 tw:gap-x-8 tw:gap-y-4">
                <div>
                  <div className="tw:text-gray-600 tw:font-medium">Name</div>
                  <div className="tw:mt-0.5 tw:text-gray-900">
                    {visitor.fullName || '—'}
                  </div>
                </div>

                <div>
                  <div className="tw:text-gray-600 tw:font-medium">Email</div>
                  <div className="tw:mt-0.5 tw:text-gray-900">
                    {visitor.email || '—'}
                  </div>
                </div>

                <div>
                  <div className="tw:text-gray-600 tw:font-medium">Mobile</div>
                  <div className="tw:mt-0.5 tw:text-gray-900">
                    {visitor.phoneNumber || visitor.mobile || '—'}
                  </div>
                </div>

                <div>
                  <div className="tw:text-gray-600 tw:font-medium">Company</div>
                  <div className="tw:mt-0.5 tw:text-gray-900">
                    {visitor.companyName || '—'}
                  </div>
                </div>

                <div>
                  <div className="tw:text-gray-600 tw:font-medium">
                    Visitor Type
                  </div>
                  <div className="tw:mt-0.5 tw:text-gray-900">
                    {visitor.visitorType || '—'}
                  </div>
                </div>

                <div>
                  <div className="tw:text-gray-600 tw:font-medium">
                    Signed In
                  </div>
                  <div className="tw:mt-0.5 tw:text-gray-900">
                    {formatDate(visitor.checkinTime)}
                  </div>
                </div>

                <div>
                  <div className="tw:text-gray-600 tw:font-medium">
                    Signed Out
                  </div>
                  <div className="tw:mt-0.5 tw:text-gray-900">
                    {formatDate(visitor.checkoutTime) || '—'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ========== Custom Fields ========== */}
          {visitor.visitCustomFields?.length > 0 && (
            <div>
              <div className="tw:pb-2 tw:mb-4 tw:border-b tw:border-gray-300">
                <h4 className="tw:text-base tw:font-semibold tw:text-gray-800">
                  Custom Field Information
                </h4>
              </div>

              <div className="tw:grid tw:grid-cols-2 tw:gap-x-8 tw:gap-y-4">
                {visitor.visitCustomFields.map((field: any, index: number) => (
                  <div key={index}>
                    <div className="tw:text-gray-600 tw:font-medium">
                      {field.name || field.displayText}
                    </div>
                    <div className="tw:mt-0.5 tw:text-gray-900">
                      {field.value || '—'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}