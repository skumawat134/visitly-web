import React, { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AgGridReact } from "ag-grid-react";
import {
  themeQuartz,
  type ColDef,
  type ICellRendererParams,
} from "ag-grid-community";
import {
  Users,
  Package,
  Calendar,
  UserPlus,
  Upload,
  LogIn,
  LogOut,
  Clock,
  ArrowRight,
  CheckCircle,
  MapPin,
  ChevronRight,
  Building2,
  ChevronDown,
} from "lucide-react";
import { useHostDashboard } from "../hooks/use-host-dashboard";
import { Avatar } from "../components/Avatar";
import { HoverCard } from "../components/HoverCard";
import {
  MetricPill,
  LocationFilter,
  CardSearch,
} from "../components/DashboardComponents";
import { cn } from "@visitly/ui";
import { format } from "date-fns";
import type { VisitorDetail } from "@/features/visitor-detail/api/visitorDetail.types";

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

const todayStr = () => {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const formatRelativeTime = (dateStr?: string) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

export const formatDate = (date: string) =>
  format(new Date(date), "hh:mm a d MMMM yyyy");

export const formatDuration = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = Math.floor(minutes % 60);
  return `${h}h ${m}m`;
};

export const HostDashboard: React.FC = () => {
  const navigate = useNavigate();

  const {
    viewAs,
    setViewAs,
    upcomingSearch,
    setUpcomingSearch,
    checkedInSearch,
    setCheckedInSearch,
    upcomingLocation,
    setUpcomingLocation,
    checkedInLocation,
    setCheckedInLocation,
    expectedToday,
    todaysVisitors,
    pendingPackages,
    metrics,
    currentUser,
    updateDeliveryStatus,
    mySignInLogsData,
    sites,
    delegates,
    isDeliveryManagerEntitled,
  } = useHostDashboard();

  const [hoveredVisitor, setHoveredVisitor] = useState<any>(null);
  const [hoverAnchor, setHoverAnchor] = useState<any>(null);
  const [hoverIsUpcoming, setHoverIsUpcoming] = useState(false);
  const [showInviteMenu, setShowInviteMenu] = useState(false);

  const hoverTimerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inviteRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (inviteRef.current && !inviteRef.current.contains(e.target as Node)) {
        setShowInviteMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleRowEnter = (visitor: any, e: any, isUpcoming: boolean) => {
    clearTimeout(hoverTimerRef.current);
    const anchor = { clientX: e.event.clientX, clientY: e.event.clientY };
    hoverTimerRef.current = setTimeout(() => {
      setHoveredVisitor(visitor);
      setHoverAnchor(anchor);
      setHoverIsUpcoming(isUpcoming);
    }, 400);
  };

  const handleRowLeave = () => {
    clearTimeout(hoverTimerRef.current);
    setHoveredVisitor(null);
    setHoverAnchor(null);
  };

  const myTheme = useMemo(
    () =>
      themeQuartz.withParams({
        headerBackgroundColor: "transparent",
        headerTextColor: "#9ca3af", // gray-400
        headerFontWeight: 600,
        headerFontSize: 11,
        rowHoverColor: "#f9fafb", // gray-50
        oddRowBackgroundColor: "transparent",
        borderRadius: "0px",
        accentColor: "#4338ca", // indigo-700
        fontSize: "13px",
        wrapperBorder: false,
        borderColor: "transparent",
      }),
    [],
  );

  const defaultColDef = useMemo<ColDef>(
    () => ({
      // sortable: true,
      // filter: true,
      resizable: true,
      // suppressHeaderMenuButton: true,
      // suppressMultiSort: true,
      headerClass:
        "tw:text-[11px] tw:uppercase tw:tracking-wider tw:font-semibold tw:text-gray-400",
    }),
    [],
  );

  const upcomingColDefs = useMemo(
    () => [
      {
        headerName: "Time",
        field: "scheduleCheckinDate",
        width: 100,
        cellClass: "tw:text-indigo-600 tw:font-semibold",
        cellRenderer: (params: ICellRendererParams) =>
          formatRelativeTime(params.value),
      },
      {
        headerName: "Visitor",
        field: "fullName",
        flex: 2,
        minWidth: 200,
        cellRenderer: (params: ICellRendererParams) => {
          const data = params.data;
          if (!data) return null;
          return (
            <div className="tw:flex tw:items-center tw:gap-2.5 tw:h-full">
              <Avatar name={data.fullName} size={30} />
              <div className="tw:min-w-0 tw:leading-tight">
                <div className="tw:text-sm tw:font-medium tw:text-gray-800 tw:truncate">
                  {data.fullName}
                </div>
                <div className="tw:text-xs tw:text-gray-400 tw:truncate">
                  {data.email}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        headerName: "Company",
        field: "companyName",
        flex: 1.5,
        minWidth: 120,
        valueFormatter: (params: any) => params.value || "—",
      },
      { headerName: "Host", field: "hostName", flex: 1.5, minWidth: 120 },
      {
        headerName: "Pre-Fill Status",
        field: "prefill",
        flex: 1.5,
        minWidth: 120,
        cellRenderer: (params: ICellRendererParams) => {
          const hasPrefill = params.data?.visitInfoModel ? true : false;

          return (
            <span className="tw:flex tw:items-center tw:gap-1.5">
              {hasPrefill ? "Yes" : "No"}
            </span>
          );
        },
      },
      { headerName: "Phone", field: "phoneNumber", flex: 1.5, minWidth: 120 },

      {
        headerName: "Location",
        field: "siteName",
        flex: 1.5,
        minWidth: 140,
        cellRenderer: (params: ICellRendererParams) => (
          <span className="tw:flex tw:items-center tw:gap-1.5 tw:text-gray-500">
            <MapPin size={12} className="tw:text-gray-400" />
            {params.value}
          </span>
        ),
      },
      {
        headerName: "Type",
        field: "visitorType",
        width: 100,
        cellRenderer: (params: ICellRendererParams) => (
          <span className="tw:bg-gray-100 tw:text-gray-600 tw:text-[11px] tw:font-medium tw:px-2 tw:py-0.5 tw:rounded-md">
            {params.value}
          </span>
        ),
      },
      {
        headerName: "",
        width: 50,
        sortable: false,
        filter: false,
        resizable: false,
        cellRenderer: () => (
          <div className="tw:flex tw:items-center tw:justify-center tw:h-full">
            <ChevronRight size={15} className="tw:text-gray-300" />
          </div>
        ),
      },
    ],
    [],
  );

  const checkedInColDefs = useMemo(
    () => [
      {
        headerName: "In",
        field: "checkinTime",
        width: 100,
        cellClass: "tw:text-gray-600 tw:font-semibold",
        cellRenderer: (params: ICellRendererParams) =>
          formatRelativeTime(params.value),
      },
      {
        headerName: "Visitor",
        field: "fullName",
        flex: 2,
        minWidth: 200,
        cellRenderer: (params: ICellRendererParams) => {
          const data = params.data;
          if (!data) return null;
          return (
            <div className="tw:flex tw:items-center tw:gap-2.5 tw:h-full">
              <Avatar name={data.fullName} size={30} />
              <div className="tw:min-w-0 tw:leading-tight">
                <div className="tw:text-sm tw:font-medium tw:text-gray-800 tw:truncate">
                  {data.fullName}
                </div>
                <div className="tw:text-xs tw:text-gray-400 tw:truncate">
                  {data.email}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        headerName: "Company",
        field: "companyName",
        flex: 1.5,
        minWidth: 120,
        valueFormatter: (params: ICellRendererParams) => params.value || "—",
      },
      { headerName: "Host", field: "hostName", flex: 1.5, minWidth: 120 },
      {
        headerName: "Location",
        field: "siteName",
        flex: 1.5,
        minWidth: 140,
        cellRenderer: (params: ICellRendererParams) => (
          <span className="tw:flex tw:items-center tw:gap-1.5 tw:text-gray-500">
            <MapPin size={12} className="tw:text-gray-400" />
            {params.value}
          </span>
        ),
      },
      {
        headerName: "Type",
        field: "visitorType",
        width: 100,
        cellRenderer: (params: ICellRendererParams) => (
          <span className="tw:bg-gray-100 tw:text-gray-600 tw:text-[11px] tw:font-medium tw:px-2 tw:py-0.5 tw:rounded-md">
            {params.value}
          </span>
        ),
      },
      {
        headerName: "Out",
        field: "checkoutTime",
        width: 100,
        valueFormatter: (params: ICellRendererParams) =>
          params.value ? formatRelativeTime(params.value) : "—",
      },
      {
        headerName: "Status",
        field: "visitStatus",
        width: 120,
        cellRenderer: (params: ICellRendererParams) => {
          if (!params.data.checkoutTime) {
            return (
              <span className="tw:inline-flex tw:items-center tw:gap-1.5 tw:px-2.5 tw:py-0.5 tw:rounded-full tw:text-[12px] tw:font-medium tw:bg-emerald-100 tw:text-emerald-800">
                <span className="tw:w-1.5 tw:h-1.5 tw:rounded-full tw:bg-emerald-500" />
                On-site
              </span>
            );
          }

          return (
            <span className="tw:inline-flex tw:items-center tw:gap-1.5 tw:px-2.5 tw:py-0.5 tw:rounded-full tw:text-[12px] tw:font-medium tw:bg-slate-100 tw:text-slate-700">
              <span className="tw:w-1.5 tw:h-1.5 tw:rounded-full tw:bg-slate-400" />
              Checked out
            </span>
          );
        },
      },
      {
        headerName: "",
        width: 50,
        sortable: false,
        filter: false,
        resizable: false,
        cellRenderer: () => (
          <div className="tw:flex tw:items-center tw:justify-center tw:h-full">
            <ChevronRight size={15} className="tw:text-gray-300" />
          </div>
        ),
      },
    ],
    [],
  );

  const activeDelegateName = delegates.find(
    (d: { id: string; name: string }) => d.id === viewAs,
  )?.name;

  const redirectToVisitorDetailPage = (data: VisitorDetail, source: string) => {
    if (!data?.id) return;
    const isPrefill = !!data.visitInfoModel;
    const id = isPrefill ? data.visitInfoModel?.id : data.id;
    const url = isPrefill
      ? `/host/visitor-detail/${id}?isPrefill=true`
      : `/host/visitor-detail/${id}?`;

    if (source === "pastVisitors") {
      const url = `/host/visitor-detail/${id}?source=pastVisitors`;
      navigate(url);
      return;
    }

    navigate(url);
  };

  return (
    <div
      ref={containerRef}
      className="tw:px-9 tw:py-7 tw:max-w-[1400px] tw:relative tw:overflow-visible"
    >
      {/* Welcome Strip */}
      <div className="tw:flex tw:items-start tw:justify-between tw:flex-wrap tw:gap-4 tw:mb-6">
        <div>
          <h1 className="tw:text-[26px] tw:font-bold tw:text-gray-900 tw:tracking-tight tw:leading-tight">
            {getGreeting()}, {currentUser?.firstName}
          </h1>
          <p className="tw:text-sm tw:text-gray-400 tw:mt-1.5">{todayStr()}</p>
        </div>

        <div className="tw:flex tw:items-center tw:gap-2.5 tw:flex-wrap">
          <div ref={inviteRef} className="tw:relative">
            <button
              onClick={() => setShowInviteMenu(!showInviteMenu)}
              className="tw:inline-flex tw:items-center tw:gap-2 tw:px-5 tw:py-2.5 tw:bg-indigo-600 tw:text-white tw:rounded-xl tw:text-sm tw:font-medium hover:tw:bg-indigo-700 tw:transition-colors"
            >
              <UserPlus size={16} />
              Invite Visitor
              <ChevronDown size={14} className="tw:ml-0.5 tw:opacity-70" />
            </button>

            {showInviteMenu && (
              <div className="tw:absolute tw:top-[calc(100%+6px)] tw:right-0 tw:bg-white tw:rounded-xl tw:border tw:border-gray-100 tw:shadow-xl tw:p-1.5 tw:z-40 tw:min-w-[200px]">
                <button
                  onClick={() => {
                    setShowInviteMenu(false);
                    navigate("/host/upcoming-visitors");
                  }}
                  className="tw:flex tw:items-center tw:gap-3 tw:w-full tw:p-2.5 tw:rounded-lg hover:tw:bg-gray-50 tw:transition-colors tw:text-left"
                >
                  <UserPlus size={15} className="tw:text-indigo-600" />
                  <div>
                    <div className="tw:text-sm tw:font-medium tw:text-gray-800">
                      Single Invite
                    </div>
                    <div className="tw:text-[11px] tw:text-gray-400">
                      Pre-register one visitor
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    setShowInviteMenu(false);
                    // navigate('/host/bulk-pre-register');
                  }}
                  className="tw:flex tw:items-center tw:gap-3 tw:w-full tw:p-2.5 tw:rounded-lg hover:tw:bg-gray-50 tw:transition-colors tw:text-left"
                >
                  <Upload size={15} className="tw:text-indigo-600" />
                  <div>
                    <div className="tw:text-sm tw:font-medium tw:text-gray-800">
                      Bulk Invite
                    </div>
                    <div className="tw:text-[11px] tw:text-gray-400">
                      Import multiple visitors
                    </div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* <button
            className={cn(
              "tw:inline-flex tw:items-center tw:gap-2 tw:px-5 tw:py-2.5 tw:rounded-xl tw:text-sm tw:font-medium tw:transition-colors",
              activeSignIn
                ? "tw:bg-gray-900 tw:text-white hover:tw:bg-gray-800"
                : "tw:border-1.5 tw:border-indigo-600 tw:text-indigo-600 hover:tw:bg-indigo-50",
            )}
          >
            {activeSignIn ? (
              <>
                <LogOut size={16} /> Sign Out
              </>
            ) : (
              <>
                <LogIn size={16} /> Sign In
              </>
            )}
          </button> */}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="tw:flex tw:items-center tw:justify-between tw:flex-wrap tw:gap-3 tw:mb-5">
        <div className="tw:flex tw:gap-2.5 tw:flex-wrap tw:items-center">
          <MetricPill
            icon={Calendar}
            label="Upcoming"
            value={metrics.expectedToday}
            color="#3B82F6"
            bg="#DBEAFE"
          />
          <MetricPill
            icon={Users}
            label="On-site"
            value={metrics.checkedInToday}
            color="#10B981"
            bg="#D1FAE5"
          />
          {isDeliveryManagerEntitled && (
            <MetricPill
              icon={Package}
              label="Pending Delivery"
              value={metrics.pendingDeliveries}
              color="#F59E0B"
              bg="#FEF3C7"
            />
          )}

          {mySignInLogsData && (
            <div
              className={cn(
                "tw:flex tw:items-center tw:px-3.5 tw:py-2 tw:rounded-xl",
                mySignInLogsData.currentActive === "Active"
                  ? "tw:bg-emerald-100"
                  : "tw:bg-slate-100",
              )}
            >
              <span
                className={cn(
                  "tw:text-[13px] tw:font-semibold tw:flex tw:gap-2",
                  mySignInLogsData.currentActive === "Active"
                    ? "tw:text-emerald-800"
                    : "tw:text-slate-600",
                )}
              >
                <Building2 size={14} />
                {mySignInLogsData.siteName}
              </span>
            </div>
          )}
        </div>

        {/* View Switcher */}
        <div className="tw:flex tw:items-center tw:gap-1.5">
          <div className="tw:flex tw:items-center tw:gap-0.5 tw:bg-gray-100 tw:p-0.5 tw:rounded-xl">
            <button
              onClick={() => setViewAs("all")}
              className={cn(
                "tw:px-3.5 tw:py-1.5 tw:rounded-lg tw:text-[13px] tw:whitespace-nowrap tw:transition-all",
                viewAs === "all"
                  ? "tw:bg-white tw:text-indigo-600 tw:font-semibold tw:shadow-sm"
                  : "tw:text-gray-500 tw:font-medium",
              )}
            >
              All
            </button>
            <button
              onClick={() => setViewAs("myself")}
              className={cn(
                "tw:px-3.5 tw:py-1.5 tw:rounded-lg tw:text-[13px] tw:whitespace-nowrap tw:transition-all",
                viewAs === "myself"
                  ? "tw:bg-white tw:text-indigo-600 tw:font-semibold tw:shadow-sm"
                  : "tw:text-gray-500 tw:font-medium",
              )}
            >
              My Visitors
            </button>
          </div>

          {delegates.length > 0 && (
            <div className="tw:relative">
              <select
                value={activeDelegateName ? viewAs : ""}
                onChange={(e) => e.target.value && setViewAs(e.target.value)}
                className={cn(
                  "tw:appearance-none tw:pl-3 tw:pr-8 tw:py-1.5 tw:rounded-xl tw:text-[13px] tw:font-medium tw:cursor-pointer tw:outline-none tw:min-w-[160px] tw:border tw:transition-all",
                  activeDelegateName
                    ? "tw:border-indigo-600 tw:bg-indigo-50 tw:text-indigo-600"
                    : "tw:border-gray-200 tw:bg-white tw:text-gray-500",
                )}
              >
                <option value="" disabled>
                  View as delegate...
                </option>
                {delegates.map((d: { id: string; name: string }) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className={cn(
                  "tw:absolute tw:right-2.5 tw:top-1/2 tw:-translate-y-1/2 tw:pointer-events-none",
                  activeDelegateName
                    ? "tw:text-indigo-600"
                    : "tw:text-gray-400",
                )}
              />
            </div>
          )}
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="tw:flex tw:flex-col tw:gap-5">
        {/* Upcoming Today Card */}
        <section className="tw:bg-white tw:rounded-2xl tw:border tw:border-gray-100 tw:shadow-sm tw:p-6 tw:overflow-hidden">
          <div className="tw:flex tw:items-center tw:justify-between tw:mb-4 tw:flex-wrap tw:gap-2.5">
            <div className="tw:flex tw:items-center tw:gap-2.5">
              <div className="tw:w-8 tw:h-8 tw:rounded-lg tw:bg-blue-100 tw:text-blue-500 tw:flex tw:items-center tw:justify-center">
                <Calendar size={16} />
              </div>
              <h2 className="tw:text-[15px] tw:font-semibold tw:text-gray-900">
                Upcoming Today
              </h2>
              <span className="tw:bg-blue-50 tw:text-blue-600 tw:text-[13px] tw:font-semibold tw:px-2 tw:py-0.5 tw:rounded-full">
                {expectedToday.length}
              </span>
            </div>
            <div className="tw:flex tw:items-center tw:gap-2 tw:flex-wrap">
              <LocationFilter
                value={upcomingLocation}
                onChange={setUpcomingLocation}
                sites={sites}
              />
              <CardSearch
                value={upcomingSearch}
                onChange={setUpcomingSearch}
                placeholder="Search upcoming..."
              />
            </div>
          </div>

          <div style={{ width: "100%" }} className="tw:ag-theme-quartz">
            <AgGridReact
              rowData={expectedToday}
              columnDefs={upcomingColDefs}
              defaultColDef={defaultColDef}
              theme={myTheme}
              domLayout="autoHeight" // ✅ IMPORTANT
              onCellMouseOver={(e) => handleRowEnter(e.data, e, true)}
              onCellMouseOut={handleRowLeave}
              onRowClicked={(e) =>
                redirectToVisitorDetailPage(e.data, "upcomingVisitors")
              }
              className="tw:h-full"
              rowHeight={52}
              headerHeight={40}
            />
          </div>

          <button
            onClick={() => navigate("/host/upcoming-visitors")}
            className="tw:mt-4 tw:flex tw:items-center tw:gap-1 tw:text-[13px] tw:font-medium tw:text-indigo-600 hover:tw:opacity-75"
          >
            View all visitors <ArrowRight size={14} />
          </button>
        </section>

        {/* Checked In Today Section */}
        <section className="tw:bg-white tw:rounded-2xl tw:border tw:border-gray-100 tw:shadow-sm tw:p-6 tw:overflow-hidden">
          <div className="tw:flex tw:items-center tw:justify-between tw:mb-4 tw:flex-wrap tw:gap-2.5">
            <div className="tw:flex tw:items-center tw:gap-2.5">
              <div className="tw:w-8 tw:h-8 tw:rounded-lg tw:bg-emerald-100 tw:text-emerald-500 tw:flex tw:items-center tw:justify-center">
                <Users size={16} />
              </div>
              <h2 className="tw:text-[15px] tw:font-semibold tw:text-gray-900">
                Checked In Today
              </h2>
              <span className="tw:bg-emerald-50 tw:text-emerald-600 tw:text-[13px] tw:font-semibold tw:px-2 tw:py-0.5 tw:rounded-full">
                {todaysVisitors.length}
              </span>
            </div>
            <div className="tw:flex tw:items-center tw:gap-2 tw:flex-wrap">
              <LocationFilter
                value={checkedInLocation}
                onChange={setCheckedInLocation}
                sites={sites}
              />
              <CardSearch
                value={checkedInSearch}
                onChange={setCheckedInSearch}
                placeholder="Search visitors..."
              />
            </div>
          </div>

          <div style={{ width: "100%" }} className="tw:ag-theme-quartz">
            <AgGridReact
              rowData={todaysVisitors}
              columnDefs={checkedInColDefs}
              defaultColDef={defaultColDef}
              theme={myTheme}
              domLayout="autoHeight" // ✅ IMPORTANT
              onCellMouseOver={(e) => handleRowEnter(e.data, e, false)}
              onCellMouseOut={handleRowLeave}
              onRowClicked={(e) =>
                redirectToVisitorDetailPage(e.data, "pastVisitors")
              }
              className="tw:h-full"
              rowHeight={52}
              headerHeight={40}
            />
          </div>

          <button
            onClick={() => navigate("/host/upcoming-visitors")}
            className="tw:mt-4 tw:flex tw:items-center tw:gap-1 tw:text-[13px] tw:font-medium tw:text-indigo-600 hover:tw:opacity-75"
          >
            View all visitors <ArrowRight size={14} />
          </button>
        </section>

        {/* Deliveries and Sign In Row */}
        <div className="tw:grid tw:grid-cols-1 tw:md:grid-cols-2 tw:gap-5">
          {/* My Deliveries Card */}
          {isDeliveryManagerEntitled && (
            <section className="tw:bg-white tw:rounded-2xl tw:border tw:border-gray-100 tw:shadow-sm tw:p-6">
              <div className="tw:flex tw:items-center tw:gap-2.5 tw:mb-4">
                <div className="tw:w-8 tw:h-8 tw:rounded-lg tw:bg-amber-100 tw:text-amber-500 tw:flex tw:items-center tw:justify-center">
                  <Package size={16} />
                </div>
                <h2 className="tw:text-[15px] tw:font-semibold tw:text-gray-900">
                  My Deliveries
                </h2>
                <span className="tw:bg-amber-50 tw:text-amber-600 tw:text-[13px] tw:font-semibold tw:px-2 tw:py-0.5 tw:rounded-full">
                  {pendingPackages.length}
                </span>
              </div>

              <div className="tw:flex tw:flex-col tw:gap-2.5">
                {pendingPackages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="tw:bg-gray-50 tw:rounded-xl tw:p-4 tw:border tw:border-gray-100"
                  >
                    <div className="tw:flex tw:items-center tw:justify-between tw:mb-1">
                      <span className="tw:text-sm tw:font-semibold tw:text-gray-800">
                        {pkg.recipientFirstName} {pkg.recipientLastName}
                      </span>
                      <span className="tw:text-[11px] tw:text-gray-400">
                        {new Date(pkg.receiveD).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="tw:text-[13px] tw:text-gray-500">
                      {pkg.carrier}
                    </div>
                    <div className="tw:font-mono tw:text-[10px] tw:text-gray-400 tw:my-2 tw:truncate">
                      {pkg.trackingId}
                    </div>
                    <div className="tw:text-[11px] tw:text-gray-400 tw:flex tw:items-center tw:gap-1 tw:mb-3">
                      <MapPin size={10} /> {pkg.siteDeliveryAreaName} ·{" "}
                      {pkg.siteName}
                    </div>
                    <div className="tw:flex tw:gap-2">
                      <button
                        className="tw:flex-1 tw:flex tw:items-center tw:justify-center tw:gap-1.5 tw:px-3 tw:py-1.5 tw:bg-emerald-500 tw:text-white tw:rounded-lg tw:text-xs tw:font-medium hover:tw:bg-emerald-600 tw:cursor-pointer"
                        onClick={() =>
                          updateDeliveryStatus({
                            id: pkg.id,
                            status: "Picked Up",
                            pickupD: format(
                              new Date(),
                              "yyyy-MM-dd'T'HH:mm:ss",
                            ),
                          })
                        }
                      >
                        <CheckCircle size={13} /> Mark as Pick Up
                      </button>
                      <button
                        className="tw:px-3 tw:py-1.5 tw:text-gray-500 tw:border tw:border-gray-200 tw:rounded-lg tw:text-xs tw:font-medium hover:tw:bg-gray-100 tw:cursor-pointer"
                        onClick={() =>
                          updateDeliveryStatus({
                            id: pkg.id,
                            status: "Discard",
                            pickupD: format(
                              new Date(),
                              "yyyy-MM-dd'T'HH:mm:ss",
                            ),
                          })
                        }
                      >
                        Discard
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => navigate("/host/my-deliveries")}
                className="tw:mt-4 tw:flex tw:items-center tw:gap-1 tw:text-[13px] tw:font-medium tw:text-indigo-600 hover:tw:opacity-75"
              >
                View all packages <ArrowRight size={14} />
              </button>
            </section>
          )}

          {/* My Sign In Card */}
          <section className="tw:bg-white tw:rounded-2xl tw:border tw:border-gray-100 tw:shadow-sm tw:p-6">
            <div className="tw:flex tw:items-center tw:gap-2.5 tw:mb-4">
              <div
                className={cn(
                  "tw:w-8 tw:h-8 tw:rounded-lg tw:flex tw:items-center tw:justify-center",
                  mySignInLogsData?.currentActive === "Active"
                    ? "tw:bg-emerald-100 tw:text-emerald-500"
                    : "tw:bg-slate-100 tw:text-slate-500",
                )}
              >
                <LogIn size={16} />
              </div>
              <h2 className="tw:text-[15px] tw:font-semibold tw:text-gray-900">
                My Sign-In
              </h2>
            </div>

            {mySignInLogsData ? (
              <div
                className={cn(
                  "tw:rounded-xl tw:p-4 tw:border",
                  mySignInLogsData.currentActive === "Active"
                    ? "tw:bg-emerald-50 tw:border-emerald-100"
                    : "tw:bg-slate-50 tw:border-slate-200",
                )}
              >
                <div className="tw:flex tw:items-center tw:gap-2 tw:mb-3">
                  <span
                    className={cn(
                      "tw:w-2 tw:h-2 tw:rounded-full",
                      mySignInLogsData.currentActive === "Active"
                        ? "tw:bg-emerald-500 tw:shadow-[0_0_0_3px_rgba(16,185,129,0.2)]"
                        : "tw:bg-slate-400 tw:shadow-[0_0_0_3px_rgba(148,163,184,0.25)]",
                    )}
                  />
                  <span
                    className={cn(
                      "tw:text-sm tw:font-semibold",
                      mySignInLogsData.currentActive === "Active"
                        ? "tw:text-emerald-900"
                        : "tw:text-slate-800",
                    )}
                  >
                    {mySignInLogsData.currentActive === "Active"
                      ? "Currently "
                      : "Last "}
                    Signed In
                  </span>
                </div>

                <div className="tw:flex tw:flex-col tw:gap-2 tw:mb-4">
                  <div
                    className={cn(
                      "tw:flex tw:items-center tw:gap-2 tw:text-sm tw:font-medium",
                      mySignInLogsData.currentActive === "Active"
                        ? "tw:text-emerald-800"
                        : "tw:text-slate-700",
                    )}
                  >
                    <Building2 size={14} />
                    {mySignInLogsData.siteName}
                  </div>

                  <div
                    className={cn(
                      "tw:flex tw:items-center tw:gap-2 tw:text-[13px]",
                      mySignInLogsData.currentActive === "Active"
                        ? "tw:text-emerald-700"
                        : "tw:text-slate-600",
                    )}
                  >
                    <Clock size={14} /> Checkin Time
                    <span
                      className={cn(
                        "tw:px-2 tw:py-0.5 tw:rounded-md tw:text-[11px] tw:font-bold",
                        mySignInLogsData.currentActive === "Active"
                          ? "tw:bg-emerald-200"
                          : "tw:bg-slate-200",
                      )}
                    >
                      {formatDate(mySignInLogsData.checkinTime)}
                    </span>
                  </div>

                  {mySignInLogsData.checkoutTime && (
                    <div
                      className={cn(
                        "tw:flex tw:items-center tw:gap-2 tw:text-[13px]",
                        mySignInLogsData.currentActive === "Active"
                          ? "tw:text-emerald-700"
                          : "tw:text-slate-600",
                      )}
                    >
                      <Clock size={14} /> Checkout Time
                      <span
                        className={cn(
                          "tw:px-2 tw:py-0.5 tw:rounded-md tw:text-[11px] tw:font-bold",
                          mySignInLogsData.currentActive === "Active"
                            ? "tw:bg-emerald-200"
                            : "tw:bg-slate-200",
                        )}
                      >
                        {formatDate(mySignInLogsData.checkoutTime)}
                      </span>
                    </div>
                  )}

                  {mySignInLogsData.duration !== null &&
                    mySignInLogsData.duration !== undefined && (
                      <div
                        className={cn(
                          "tw:flex tw:items-center tw:gap-2 tw:text-[13px]",
                          mySignInLogsData.currentActive === "Active"
                            ? "tw:text-emerald-700"
                            : "tw:text-slate-600",
                        )}
                      >
                        <Clock size={14} /> Duration
                        <span
                          className={cn(
                            "tw:px-2 tw:py-0.5 tw:rounded-md tw:text-[11px] tw:font-bold",
                            mySignInLogsData.currentActive === "Active"
                              ? "tw:bg-emerald-200"
                              : "tw:bg-slate-200",
                          )}
                        >
                          {formatDuration(+mySignInLogsData.duration)}
                        </span>
                      </div>
                    )}
                </div>

                <div className="tw:flex tw:gap-2 tw:items-center">
                  <button
                    onClick={() => navigate("/host/my-sign-in-log")}
                    className="tw:text-[13px] tw:font-medium tw:text-indigo-600 hover:tw:opacity-75"
                  >
                    View log <ArrowRight size={14} className="tw:inline" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="tw:bg-gray-50 tw:rounded-xl tw:p-4 tw:border tw:border-gray-100" />
            )}
          </section>
        </div>
      </div>

      {hoveredVisitor && hoverAnchor && (
        <HoverCard
          visitor={hoveredVisitor}
          isUpcoming={hoverIsUpcoming}
          anchorRect={hoverAnchor}
          containerRef={containerRef}
        />
      )}
    </div>
  );
};
