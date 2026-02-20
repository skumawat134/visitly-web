import { cn } from '@visitly/ui';
import type { companyDirectoryUserRecord } from '../api/companyDirectory.types';
import { Building, Mail, Phone } from 'lucide-react';
import { NamedAvatar } from '@visitly/ui';

const DirectoryCard: React.FC<{
  user: companyDirectoryUserRecord;
  onClick: () => void;
}> = ({ user, onClick }) => {
  const fullName = `${user.firstName} ${user.lastName}`;

  return (
    <div
      onClick={onClick}
      className="
        tw:bg-white tw:rounded-xl tw:p-4 tw:border tw:border-slate-200 
        tw:flex tw:flex-col tw:gap-3 tw:cursor-pointer 
        tw:transition-[box-shadow,transform] tw:duration-150
        tw:hover::shadow-md -tw:hover:translate-y-[1px] tw:max-h-60
      "
    >
      {/* Top Row */}
      <div className="tw:flex tw:items-center tw:gap-3">
        {/* <img
          src={user.avatarUri || "/assets/images/defaultuser.jpg"}
          alt={fullName}
          className="tw:w-11 tw:h-11 tw:rounded-full tw:object-cover tw:flex-shrink-0"
        /> */}

        <NamedAvatar name={fullName} url={user.avatarUri} size={35} />

        <div className="tw:min-w-0 tw:flex-1">
          <div className="tw:flex tw:items-center tw:gap-2">
            <span className="tw:text-[15px] tw:font-semibold tw:text-slate-900 tw:truncate">
              {fullName}
            </span>

            <span
              className={cn(
                "tw:w-2 tw:h-2 tw:rounded-full tw:flex-shrink-0",
                user.status === "ACTIVE" ? "tw:bg-emerald-500" : "tw:bg-slate-300"
              )}
            />
          </div>

          {user.title && (
            <div className="tw:text-[13px] tw:text-slate-500 tw:truncate">
              {user.title}
            </div>
          )}
        </div>
      </div>

      {/* Department */}
      {user.department && (
        <div className="tw:flex tw:items-center tw:gap-1.5 tw:text-[13px] tw:text-slate-600">
          <Building size={14} className="tw:text-slate-400 tw:flex-shrink-0" />
          <span className="tw:truncate">{user.department}</span>
        </div>
      )}

      {/* Email */}
      <div className="tw:flex tw:items-center tw:gap-1.5 tw:text-[13px]">
        <Mail size={14} className="tw:text-slate-400 tw:flex-shrink-0" />
        <a
          href={`mailto:${user.email}`}
          onClick={(e) => e.stopPropagation()}
          className="tw:text-indigo-600 tw:truncate"
        >
          {user.email}
        </a>
      </div>

      {/* Phone */}
      {(user.mobilePhone || user.workPhone) && (
        <div className="tw:flex tw:items-center tw:gap-1.5 tw:text-[13px] tw:text-slate-600">
          <Phone size={14} className="tw:text-slate-400 tw:flex-shrink-0" />
          <span>{user.mobilePhone || user.workPhone}</span>
        </div>
      )}
    </div>
  );
};

export default DirectoryCard;