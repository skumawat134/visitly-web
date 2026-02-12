import { useEffect } from "react";
import { X, Mail, Phone, Building, Calendar, Hash, User, Captions } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@visitly/ui";
import { NamedAvatar } from '@visitly/ui';


interface CompanyDirectoryModalProps {
  isOpen: boolean;
  user: any;
  onClose: () => void;
  width?: number;
}

export function CompanyDirectoryModal({
  isOpen,
  user,
  onClose,
  width = 560,
}: CompanyDirectoryModalProps) {
  console.log("Modal Rendered with user:", user);
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen || !user) return null;

  const formatDate = (date?: string) => {
    if (!date) return "—";
    try {
      return format(new Date(date), "dd MMM yyyy");
    } catch {
      return "—";
    }
  };

  const fullName = `${user.firstName} ${user.lastName}`;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="tw:fixed tw:inset-0 tw:bg-black/30 tw:z-[200] tw:animate-fadeIn"
      />

      {/* Right Panel */}
      <div
        className="tw:fixed tw:top-0 tw:right-0 tw:h-screen tw:bg-white tw:z-[201]
          tw:flex tw:flex-col tw:shadow-[-8px_0_30px_rgba(0,0,0,0.12)]
          tw:animate-slideIn"
        style={{ width: `min(${width}px, 100vw)` }}
      >
        {/* Header */}
        <div className="tw:flex tw:items-center tw:justify-between tw:px-6 tw:py-5 tw:border-b tw:border-slate-200 tw:flex-shrink-0">
          <h2 className="tw:text-[18px] tw:font-semibold tw:text-slate-900">
            Contact Details
          </h2>
          <button
            onClick={onClose}
            className="tw:p-1.5 tw:rounded-md tw:text-slate-400 tw:hover:text-slate-700 tw:hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="tw:flex-1 tw:overflow-auto tw:p-6">
          {/* Profile Header */}
          <div className="tw:flex tw:flex-col tw:items-center tw:gap-4 tw:mb-8">
            <div className="tw:w-20 tw:h-20 tw:rounded-full tw:bg-slate-100 tw:flex tw:items-center tw:justify-center tw:overflow-hidden">
              {/* {user.avatarUri ? (
                <img
                  src={user.avatarUri}
                  alt={fullName}
                  className="tw:w-full tw:h-full tw:object-cover"
                />
              ) : (
                <User size={28} className="tw:text-slate-300" />
              )} */}

              <NamedAvatar name={fullName} url={user.avatarUri} size={80} />
            </div>

            <div className="tw:min-w-0">
              <div className="tw:flex tw:items-center tw:gap-2">
                <h3 className="tw:text-[18px] tw:font-semibold tw:text-slate-900 tw:truncate">
                  {fullName}
                </h3>
                <span
                  className={cn(
                    "tw:w-2 tw:h-2 tw:rounded-full",
                    user.status === "ACTIVE" ? "tw:bg-emerald-500" : "tw:bg-slate-300"
                  )}
                />
              </div>
              <div className="tw:flex tw:items-center tw:justify-center">
                <p className={cn("tw:text-[13px] tw:w-20 tw:truncate tw:flex tw:items-center tw:justify-center tw:gap-1.5 tw:rounded-lg", user.status === "ACTIVE" ? "tw:bg-[#d1fae5] tw:text-[#10b981]" : "tw:bg-[#f3f4f6] tw:text-[#6b7280]"  )}>
                { user.status === "ACTIVE" ? "Active" : "Inactive" }
               </p>
              </div>
            </div>
          </div>

        

          {/* Details List */}
          <div className="tw:grid tw:sm:grid-cols-2 tw:gap-4 tw:mt-15 tw:text-sm">
            <DetailRow
              icon={Captions}
              label="Title"
              value={user.title}
            />
            <DetailRow icon={Building} label="Department" value={user.department} />
             <DetailRow
              icon={Captions}
              label="Employee ID"
              value={user.employeeId}
            />
            <DetailRow icon={Hash} label="Extension" value={user.extension} />

            <DetailRow
              icon={Phone}
              label="Work Phone"
              value={user.workPhone ? `+${user.workPhoneCountryCode}-${user.workPhone}` : null}
            />
            <DetailRow
              icon={Phone}
              label="Mobile Phone"
              value={user.mobilePhone ? `+${user.mobilePhoneCountryCode}-${user.mobilePhone}` : null}
            />
            <DetailRow
              icon={Calendar}
              label="Member Since"
              value={formatDate(user.createTime)}
            />
          </div>

            {/* Actions */}
          <div className="tw:flex tw:mt-20 tw:gap-3 ">
            <a
              href={`mailto:${user.email}`}
              className="tw:flex-1 tw:flex tw:items-center tw:justify-center tw:gap-2
                tw:py-2.5 tw:text-sm tw:font-medium tw:bg-indigo-600 tw:text-white
                tw:rounded-lg tw:hover:bg-indigo-700"
            >
              <Mail size={16} />
              Email
            </a>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .tw\\:animate-fadeIn {
          animation: fadeIn 0.2s ease;
        }
        .tw\\:animate-slideIn {
          animation: slideIn 0.25s ease;
        }
      `}</style>
    </>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value?: string | null;
}) {
  return (
    <div className="tw:flex tw:items-center tw:gap-3">
      <Icon size={14} className="tw:text-slate-400 tw:flex-shrink-0" />
      <div className="tw:flex tw:flex-col tw:min-w-0">
        <span className="tw:text-[11px] tw:text-slate-400 tw:uppercase tw:tracking-wide">
          {label}
        </span>
        <span className="tw:text-[14px] tw:text-slate-700 tw:truncate">
          {value || "—"}
        </span>
      </div>
    </div>
  );
}
