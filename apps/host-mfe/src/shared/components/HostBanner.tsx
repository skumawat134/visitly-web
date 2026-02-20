import { useState } from "react";
import { X, Sparkles, ArrowLeft } from "lucide-react";
// import { Switch } from './components/ui/switch';
import { Button } from "@visitly/ui";
import { useNavigate } from "react-router-dom";
import { useSwitchLogin } from "../hooks/useSwitchLogin";

interface VersionSwitcherProps {
  onVersionChange?: (isNewVersion: boolean) => void;
}

export function HostBanner({ onVersionChange }: VersionSwitcherProps) {
  const [isNewVersion, setIsNewVersion] = useState(true);
  const [showBanner, setShowBanner] = useState(
    localStorage.getItem("hostBannerFlag") !== "false",
  );
  const navigate = useNavigate();
  const { roles } = useSwitchLogin();

  function showSmaller() {
    localStorage.setItem("hostBannerFlag", "false");
    setShowBanner(false);
  }

  function resolveLanding(): string {
    if (roles.includes("GLOBAL_INTERNAL_ADMIN")) {
      return "/admin/internalAdmin/org-list";
    }

    if (
      roles.some((r) =>
        ["GLOBAL_ORG_ADMIN", "FRONTDESK_ADMIN", "SITE_ADMIN"].includes(r),
      )
    ) {
      return "/admin/work_area/dashboard";
    }

    if (roles.includes("DELIVERY_MANAGER")) {
      return "/admin/work_area/delivery-manager/dashboard";
    }

    if (roles.some((r) => ["EVAC_MANAGER", "HOST"].includes(r))) {
      return "/admin/work_area/evacuation/past-visitors";
    }

    return "/admin";
  }

  if (!showBanner && isNewVersion) {
    return (
      <div className="tw:flex tw:items-center tw:gap-3 tw:px-4 tw:py-2 tw:bg-gradient-to-r tw:from-purple-50 tw:to-indigo-50 tw:border-b tw:border-purple-100">
        <div className="tw:flex tw:items-center tw:gap-2 tw:text-sm">
          <Sparkles className="tw:w-4 tw:h-4 tw:text-purple-600" />
          <span className="tw:text-gray-700">New Version Available</span>
        </div>
        <span
          onClick={() => navigate(resolveLanding())}
          className="tw:text-sm tw:text-gray-500 tw:border-1 tw:px-2 tw:rounded-lg tw:mr-2 tw:md:mr-4"
        >
          Try Classic
        </span>
      </div>
    );
  }
  if (!showBanner) return null;

  return (
    <div className="tw:relative tw:bg-gradient-to-r tw:from-purple-600 tw:to-indigo-600 tw:text-white">
      <div className="tw:max-w-full tw:mx-auto tw:px-4 tw:sm:px-6 tw:lg:px-8 tw:py-4">
        <div className="tw:flex tw:items-center tw:justify-between tw:gap-4">
          <div className="tw:flex tw:items-center tw:gap-4 tw:flex-1">
            <div className="tw:flex tw:items-center tw:gap-2 tw:bg-white/20 tw:backdrop-blur-sm tw:px-3 tw:py-1.5 tw:rounded-full">
              <Sparkles className="tw:w-4 tw:h-4" />
              <span className="tw:text-sm tw:font-medium">New Experience</span>
            </div>

            <div className="tw:hidden tw:md:block">
              <p className="tw:text-sm tw:font-medium">
                You're using the new version of Visitly
              </p>
              <p className="tw:text-xs tw:text-purple-100 tw:mt-0.5">
                Enhanced performance, modern UI, and new features
              </p>
            </div>
          </div>

          <div className="tw:flex tw:items-center tw:gap-3 tw:bg-white/10 tw:backdrop-blur-sm tw:px-4 tw:py-2 tw:rounded-lg tw:border tw:border-white/20">
            <div className="tw:flex tw:items-center tw:gap-2 tw:cursor-pointer">
              <span
                onClick={() => navigate(resolveLanding())}
                className="tw:text-sm tw:font-medium tw:cursor-pointer"
              >
                Try Classic
              </span>
            </div>

            {/* <div className="tw:flex tw:items-center tw:gap-2">
              <span className="tw:text-sm tw:font-medium"> Try New</span>
            </div> */}
          </div>
           <X className="tw:text-white tw:cursor-pointer"  onClick={() => showSmaller()}/>
        </div>
      </div>
    </div>
  );
}
