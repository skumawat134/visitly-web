import React, { useMemo, useEffect, useState } from "react";
import {
  RotateCw,
  Search,
  MapPin,
  Clock,
  LogIn,
  LogOut,
  Calendar,
  Timer,
  Building,
  CheckCircle,
  Users,
  ChevronRight,
  TrendingUp
} from "lucide-react";
import { format, isToday, isYesterday, startOfToday } from "date-fns";
import { useMySignInLog } from "../hooks/useMySignInLog";
import type { SignInLogRecord } from "../api/mySignInLog.types";
import { Input, Button, cn } from "@visitly/ui";
import { GridFooter } from '../../../shared/components/GridFooter';
import  DateRangePicker  from  "@/shared/components/DateRangePicker";
import { PageDescription } from "@/shared/components/PageDescription";

// ---------------------------------------------------------------------------
// Helpers for Grouping & Status
// ---------------------------------------------------------------------------

function getRelativeDateLabel(dateStr: string) {
  const d = new Date(dateStr);
  if (isToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  return format(d, "MMM dd, yyyy");
}

function getDateKey(dateStr: string) {
  return format(new Date(dateStr), "yyyy-MM-dd");
}

function computeDurationMinutes(start: string, end?: string | null) {
  const s = new Date(start).getTime();
  const e = end ? new Date(end).getTime() : new Date().getTime();
  return Math.abs(e - s) / (1000 * 60);
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

const PulseDot: React.FC<{ size?: number; color?: string }> = ({ size = 8, color = "#10B981" }) => (
  <span className="tw:relative tw:flex tw:items-center tw:justify-center" style={{ width: size + 8, height: size + 8 }}>
    <span
      className="tw:absolute tw:rounded-full tw:animate-pulse"
      style={{ width: size + 6, height: size + 6, background: color, opacity: 0.2 }}
    />
    <span className="tw:relative tw:rounded-full" style={{ width: size, height: size, background: color }} />
  </span>
);

const DurationBar: React.FC<{ entry: SignInLogRecord }> = ({ entry }) => {
  const minutes = computeDurationMinutes(entry.checkinTime, entry.checkoutTime);
  const hours = minutes / 60;
  const pct = Math.min((hours / 8) * 100, 100);
  const isActive = !entry.checkoutTime;

  return (
    <div className="tw:w-full tw:max-w-[120px] tw:h-1.5 tw:bg-slate-100 tw:rounded-full tw:relative tw:overflow-hidden">
      <div
        className={cn(
          "tw:absolute tw:top-0 tw:left-0 tw:h-full tw:rounded-full tw:transition-all tw:duration-700",
          isActive ? "tw:bg-indigo-500" : "tw:bg-slate-300"
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
};

const LogEntry: React.FC<{ entry: SignInLogRecord; getTimeDiff: any }> = ({ entry, getTimeDiff }) => {
  const isActive = !entry.checkoutTime;
  const duration = isActive
    ? "Active"
    : getTimeDiff(entry.checkinTime, entry.checkoutTime);

  return (
    <div className="tw:flex tw:items-stretch tw:group tw:px-6">
      {/* Time & Duration Column */}
      <div className="tw:w-44 tw:shrink-0 tw:py-4 tw:pr-6 tw:border-r-2 tw:border-slate-100 tw:relative">
        <div className="tw:flex tw:items-center tw:gap-2 tw:text-sm tw:font-bold tw:text-slate-900">
          <span>{format(new Date(entry.checkinTime), "h:mm a")}</span>
          <span className="tw:text-slate-300 tw:font-normal">→</span>
          <span className={cn(isActive ? "tw:text-indigo-600" : "tw:text-slate-500")}>
            {isActive ? "Now" : format(new Date(entry.checkoutTime!), "h:mm a")}
          </span>
        </div>

        <div className={cn(
          "tw:mt-2.5 tw:inline-flex tw:items-center tw:gap-1.5 tw:px-2.5 tw:py-1 tw:rounded-lg tw:text-[12px] tw:font-bold",
          isActive ? "tw:bg-indigo-50 tw:text-indigo-600" : "tw:bg-slate-50 tw:text-slate-500"
        )}>
          <Timer size={12} />
          {duration}
        </div>

        <div className="tw:mt-4">
          <DurationBar entry={entry} />
        </div>

        {/* Timeline Bullet */}
        <div className={cn(
          "tw:absolute tw:-right-[7px] tw:top-7 tw:w-3.5 tw:h-3.5 tw:rounded-full tw:border-4 tw:border-white tw:shadow-sm tw:z-10 tw:transition-transform tw:duration-300 tw:group-hover:scale-125",
          isActive ? "tw:bg-indigo-600" : "tw:bg-slate-300"
        )} />
      </div>

      {/* Details Column */}
      <div className="tw:flex-1 tw:py-6 tw:px-8 tw:flex tw:items-center tw:justify-between tw:gap-4">
        <div className="tw:flex tw:items-center tw:gap-4">
          <div className={cn(
            "tw:w-11 tw:h-11 tw:rounded-2xl tw:flex tw:items-center tw:justify-center tw:transition-colors",
            isActive ? "tw:bg-indigo-100 tw:text-indigo-600" : "tw:bg-slate-100 tw:text-slate-400 tw:group-hover:bg-slate-200"
          )}>
            <Building size={20} />
          </div>
          <div>
            <h4 className="tw:text-sm tw:font-bold tw:text-slate-900 tw:tracking-tight tw:group-hover:text-indigo-600 tw:transition-colors">
              {entry.siteName}
            </h4>
            <p className="tw:text-[12px] tw:text-slate-500 tw:font-medium tw:mt-0.5 tw:flex tw:items-center tw:gap-1.5">
              <MapPin size={10} />
              Check-in via {entry?.checkinMethod == "WEB" ? 'Admin' : entry?.checkinMethod}
            </p>
          </div>
        </div>

        <div className="tw:shrink-0">
          {isActive ? (
            <div className="tw:flex tw:items-center tw:gap-2 tw:px-3 tw:py-1.5 tw:bg-emerald-50 tw:text-emerald-600 tw:rounded-full tw:text-[11px] tw:font-bold tw:uppercase tw:tracking-widest">
              <PulseDot size={6} color="#10B981" />
              Active Now
            </div>
          ) : (
            <div className="tw:flex tw:items-center tw:gap-1.5 tw:text-slate-400 tw:text-[12px] tw:font-semibold">
              <CheckCircle size={14} />
              Signed Out
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

const MySignInLog: React.FC = () => {
  const {
    rowData,
    totalRecords,
    pageIndex,
    pageSize,
    searchTerm,
    setSearchTerm,
    filterSiteId,
    setFilterSiteId,
    sites,
    dateRange,
    setDateRange,
    handlePageChange,
    handlePageSizeChange,
    refetch,
    getTimeDiff,
    isLoading
  } = useMySignInLog();

  const [liveDuration, setLiveDuration] = useState("");

  const activeEntry = useMemo(() => rowData.find(log => !log.checkoutTime), [rowData]);

  useEffect(() => {
    if (!activeEntry) return;
    const ticker = setInterval(() => {
      const minutes = computeDurationMinutes(activeEntry.checkinTime);
      const h = Math.floor(minutes / 60);
      const m = Math.floor(minutes % 60);
      setLiveDuration(h > 0 ? `${h}h ${m}m` : `${m}m`);
    }, 60000);

    const initialMin = computeDurationMinutes(activeEntry.checkinTime);
    const h = Math.floor(initialMin / 60);
    const m = Math.floor(initialMin % 60);
    setLiveDuration(h > 0 ? `${h}h ${m}m` : `${m}m`);

    return () => clearInterval(ticker);
  }, [activeEntry]);

  const groupedLogs = useMemo(() => {
    const groups: { label: string; dateKey: string; entries: SignInLogRecord[] }[] = [];
    const seen: Record<string, any> = {};

    rowData.forEach((log) => {
      const key = getDateKey(log.checkinTime);
      if (!seen[key]) {
        seen[key] = { label: getRelativeDateLabel(log.checkinTime), dateKey: key, entries: [] };
        groups.push(seen[key]);
      }
      seen[key].entries.push(log);
    });

    return groups;
  }, [rowData]);

  const monthlyStats = useMemo(() => {
    const count = rowData.length;
    const sitesCount = new Set(rowData.map(r => r.siteName)).size;
    return { count, sitesCount };
  }, [rowData]);

  return (
    <div className="tw:min-h-screen tw:bg-[#F8FAFC] tw:pb-12">
      {/* Page Header */}
      <PageDescription
      title= 'My Sign-In Log'
      description="Track and manage your facility access history" 
       />

      <div className="tw:max-w-full tw:mx-auto tw:px-6">
        {/* Active Session Hero */}
        {activeEntry ? (
          <div className="tw:bg-white tw:rounded-[24px] tw:p-4 tw:mb-4 tw:border tw:border-slate-200/60 tw:shadow-[0_20px_50px_rgba(79,70,229,0.06)] tw:flex tw:items-center tw:justify-between tw:gap-8 tw:relative tw:overflow-hidden">
            <div className="tw:absolute tw:left-0 tw:top-0 tw:bottom-0 tw:w-1.5 tw:bg-indigo-600" />
            <div className="tw:flex tw:items-center tw:gap-6">
              <div className="tw:relative">
                <div className="tw:w-14 tw:h-14 tw:bg-indigo-50 tw:rounded-2xl tw:flex tw:items-center tw:justify-center tw:text-indigo-600">
                  <Building size={28} />
                </div>
                <div className="tw:absolute tw:-bottom-1 tw:-right-1">
                  <PulseDot size={10} color="#6366F1" />
                </div>
              </div>
              <div>
                <h3 className="tw:text-xl tw:font-bold tw:text-slate-900">
                  Signed in at {activeEntry.siteName}
                </h3>
                <div className="tw:mt-1.5 tw:flex tw:items-center tw:gap-4 tw:text-[14px] tw:text-slate-500 tw:font-medium">
                  <span className="tw:flex tw:items-center tw:gap-1.5">
                    <LogIn size={14} className="tw:text-indigo-500" />
                    Started at {format(new Date(activeEntry.checkinTime), "h:mm a")}
                  </span>
                  <div className="tw:w-1 tw:h-1 tw:bg-slate-300 tw:rounded-full" />
                  <span className="tw:text-indigo-600 tw:font-bold tw:flex tw:items-center tw:gap-1.5">
                    <Timer size={14} />
                    {liveDuration}
                  </span>
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              className="tw:rounded-[18px] tw:px-6 tw:py-6 tw:bg-slate-900 tw:text-white tw:hover:bg-slate-800 tw:border-none tw:font-bold tw:text-sm tw:flex tw:items-center tw:gap-2 tw:transition-all tw:active:scale-95"
              onClick={() => alert('Sign-out logic here')}
            >
              <LogOut size={16} />
              Sign Out Now
            </Button>
          </div>
        ) : (
          <div className="tw:bg-emerald-50/50 tw:border tw:border-emerald-100 tw:rounded-[28px] tw:p-6 tw:mb-8 tw:flex tw:items-center tw:gap-4">
            <div className="tw:p-2.5 tw:bg-white tw:rounded-2xl tw:shadow-sm">
              <CheckCircle size={20} className="tw:text-emerald-500" />
            </div>
            <p className="tw:text-emerald-800 tw:text-sm tw:font-bold">
              You are currently signed out from all locations.
            </p>
          </div>
        )}

        {/* Stats Strip */}
        {/* <div className="tw:bg-white tw:border tw:border-slate-200/60 tw:rounded-2xl tw:px-6 tw:py-4 tw:mb-8 tw:flex tw:items-center tw:gap-6 tw:shadow-sm">
          <div className="tw:flex tw:items-center tw:gap-2">
            <span className="tw:text-lg tw:font-bold tw:text-slate-900">{monthlyStats.count}</span>
            <span className="tw:text-xs tw:font-bold tw:text-slate-400 tw:uppercase tw:tracking-wider">Sign-ins</span>
          </div>
          <div className="tw:w-px tw:h-4 tw:bg-slate-200" />
          <div className="tw:flex tw:items-center tw:gap-2">
            <span className="tw:text-lg tw:font-bold tw:text-slate-900">{monthlyStats.sitesCount}</span>
            <span className="tw:text-xs tw:font-bold tw:text-slate-400 tw:uppercase tw:tracking-wider">Locations</span>
          </div>
          <div className="tw:ml-auto tw:text-[13px] tw:font-medium tw:text-slate-400">
            Performance updated just now
          </div>
        </div> */}

        {/* Filters Section */}
        <div className="tw:bg-transparent tw:p-2  tw:border-slate-200/60 tw:mb-8">
          <div className="tw:flex tw:flex-col tw:gap-8">
            {/* Top Row: Site Pills */}
            <div className="tw:flex tw:items-center tw:gap-3 tw:flex-wrap">
              <button
                onClick={() => setFilterSiteId("")}
                className={cn(
                  "tw:px-4 tw:py-2 tw:rounded-full tw:text-[13.5px] tw:transition-all tw:flex tw:items-center tw:gap-1",
                  !filterSiteId
                    ? "tw:bg-[#EEF2FF] tw:text-[#4F46E5] tw:border-1 tw:border-[#818CF8]!"
                    : "tw:bg-[#FFFFFF] tw:text-[#4B5563] tw:border-1 tw:border-[#E5E7EB]"
                )}
              >
                <MapPin size={14} />
                All Locations
              </button>
              {sites.map(site => (
                <button
                  key={site.id}
                  onClick={() => setFilterSiteId(site.id)}
                  className={cn(
                    "tw:px-4 tw:py-2 tw:rounded-full tw:text-[13.5px] tw:transition-all",
                    filterSiteId === site.id
                      ? "tw:bg-[#EEF2FF] tw:text-[#4F46E5] tw:border-1 tw:border-[#818CF8]!"
                      : "tw:bg-[#FFFFFF] tw:text-[#4B5563] tw:border-1 tw:border-[#E5E7EB]"
                  )}
                >
                  {site.name}
                </button>
              ))}
            </div>

            <div className="tw:h-px tw:bg-slate-100 tw:w-full" />

            {/* Bottom Row: Date Range & Search */}
            <div className="tw:flex tw:flex-col tw:lg:flex-row tw:justify-between tw:items-start tw:lg:items-center tw:gap-8">
              <div className="tw:flex-1">
                <DateRangePicker value={dateRange} onChange={setDateRange} />

              </div>

              <div className="tw:flex tw:items-center tw:gap-4 tw:w-full tw:lg:w-auto">
                {/* <div className="tw:relative tw:flex-1 tw:md:w-64">
                  <Search className="tw:absolute tw:left-4 tw:top-1/2 tw:-translate-y-1/2 tw:text-slate-400" size={18} />
                  <Input
                    placeholder="Search logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="tw:pl-11 tw:rounded-[18px] tw:bg-slate-50/50 tw:border-slate-200 tw:h-12 tw:text-[14px]"
                  />
                </div> */}
                <div className="tw:h-12 tw:w-px tw:bg-slate-100 tw:hidden tw:md:block" />
                <div className="tw:flex tw:items-center tw:gap-3">
                  <span className="tw:text-sm tw:font-bold tw:text-slate-400">Rows</span>
                  <select
                    value={pageSize}
                    onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                    className="tw:bg-slate-50 tw:border tw:border-slate-200 tw:rounded-xl tw:px-3 tw:py-2 tw:text-sm tw:font-bold tw:text-slate-700 tw:cursor-pointer"
                  >
                    {[15, 25, 50, 100].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        {groupedLogs.length === 0 ? (
          <div className="tw:flex tw:flex-col tw:items-center tw:justify-center tw:py-24 tw:bg-white tw:rounded-[40px] tw:border tw:border-slate-200/60 tw:shadow-sm">
            <div className="tw:p-8 tw:bg-slate-50 tw:rounded-[32px] tw:mb-8">
              <LogIn size={48} className="tw:text-slate-300" />
            </div>
            <h3 className="tw:text-2xl tw:font-bold tw:text-slate-900">No activity found</h3>
            <p className="tw:text-slate-500 tw:mt-3 tw:text-[15px] tw:font-medium tw:text-center tw:max-w-xs">
              We couldn't find any sign-in logs matching your current filters.
            </p>
          </div>
        ) : (
          <div className="tw:space-y-10">
            {groupedLogs.map((group) => (
              <div key={group.dateKey} className="tw:relative">
                {/* Sticky Date Header */}
                <div className="tw:sticky tw:top-0 tw:z-20 tw:py-2 tw:bg-[#F8FAFC]/90 tw:backdrop-blur-sm tw:mb-1 tw:flex tw:items-center tw:gap-4">
                  <div className="tw:px-5 tw:py-2 tw:bg-white tw:border tw:border-slate-200 tw:rounded-2xl tw:shadow-sm">
                    <span className="tw:text-[14px] tw:font-bold tw:text-slate-900">
                      {group.label}
                    </span>
                  </div>
                  <div className="tw:h-px tw:flex-1 tw:bg-slate-200" />
                  <span className="tw:text-[11px] tw:font-bold tw:text-slate-400 tw:uppercase tw:tracking-widest">
                    {group.entries.length} {group.entries.length === 1 ? 'Log' : 'Logs'}
                  </span>
                </div>

                {/* Entry List */}
                <div className="tw:bg-white tw:rounded-[32px] tw:border tw:border-slate-200/60 tw:overflow-hidden tw:shadow-sm">
                  {group.entries.map((entry, idx) => (
                    <div key={entry.id}>
                      <LogEntry entry={entry} getTimeDiff={getTimeDiff} />
                      {idx < group.entries.length - 1 && (
                        <div className="tw:ml-44 tw:h-px tw:bg-slate-50" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="tw:mt-4 tw:bg-white tw:rounded-[28px] tw:border tw:border-slate-200/60 tw:shadow-sm">
          <GridFooter
            pageIndex={pageIndex}
            pageSize={pageSize}
            totalRecords={totalRecords}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
};

export default MySignInLog;
