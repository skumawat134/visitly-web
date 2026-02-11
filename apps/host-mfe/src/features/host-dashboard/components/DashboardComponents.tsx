import React from 'react';
import { Calendar, Users, Package, MapPin, Search, XCircle, ChevronDown, LucideIcon } from 'lucide-react';
import { cn } from '@visitly/ui';

export interface MetricPillProps {
    icon: LucideIcon;
    label: string;
    value: number;
    color: string;
    bg: string;
}

export const MetricPill: React.FC<MetricPillProps> = ({ icon: Icon, label, value, color, bg }) => {
    return (
        <div
            className="tw:flex tw:items-center tw:gap-2 tw:px-3.5 tw:py-1.5 tw:rounded-xl"
            style={{ backgroundColor: bg }}
        >
            <Icon size={14} style={{ color }} />
            <span className="tw:text-[12px] tw:font-medium tw:whitespace-nowrap" style={{ color }}>{label}</span>
            <span className="tw:text-[15px] tw:font-bold" style={{ color }}>{value}</span>
        </div>
    );
};

export const LocationFilter: React.FC<{ value: string; onChange: (v: string) => void; sites: any[] }> = ({ value, onChange, sites }) => {
    const isActive = value !== 'all';
    return (
        <div className="tw:relative">
            <MapPin
                size={13}
                className={cn(
                    "tw:absolute tw:left-2.5 tw:top-1/2 tw:-translate-y-1/2 tw:pointer-events-none",
                    isActive ? "tw:text-indigo-600" : "tw:text-gray-400"
                )}
            />
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={cn(
                    "tw:appearance-none tw:pl-8 tw:pr-7 tw:py-1.5 tw:rounded-lg tw:text-[13px] tw:font-medium tw:cursor-pointer tw:outline-none tw:min-w-[140px] tw:border tw:transition-colors",
                    isActive
                        ? "tw:border-indigo-600 tw:bg-indigo-50 tw:text-indigo-600"
                        : "tw:border-gray-200 tw:bg-gray-50 tw:text-gray-600"
                )}
            >
                <option value="all">All Locations</option>
                {sites.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                ))}
            </select>
            <ChevronDown
                size={13}
                className={cn(
                    "tw:absolute tw:right-2 tw:top-1/2 tw:-translate-y-1/2 tw:pointer-events-none",
                    isActive ? "tw:text-indigo-600" : "tw:text-gray-400"
                )}
            />
        </div>
    );
};

export const CardSearch: React.FC<{ value: string; onChange: (v: string) => void; placeholder: string }> = ({ value, onChange, placeholder }) => {
    return (
        <div className="tw:relative">
            <Search
                size={14}
                className="tw:absolute tw:left-2.5 tw:top-1/2 tw:-translate-y-1/2 tw:text-gray-400 tw:pointer-events-none"
            />
            <input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="tw:pl-8 tw:pr-7 tw:py-1.5 tw:border tw:border-gray-200 tw:rounded-lg tw:text-[13px] tw:text-gray-700 tw:bg-gray-50 tw:outline-none tw:w-[200px] focus:tw:ring-1 focus:tw:ring-indigo-500"
            />
            {value && (
                <button
                    onClick={() => onChange('')}
                    className="tw:absolute tw:right-2 tw:top-1/2 tw:-translate-y-1/2 tw:text-gray-400 hover:tw:text-gray-600 tw:p-0"
                >
                    <XCircle size={14} />
                </button>
            )}
        </div>
    );
};
