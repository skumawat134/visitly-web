// packages/ui/src/components/SearchUserSelect.tsx
import React, { type ReactNode } from 'react';
import AsyncSelect from 'react-select/async';
import { cn } from './utils';

export interface UserOption {
    value: string;          // user id
    label: string;          // e.g. "First Last - email@example.com"
    firstName?: string;
    lastName?: string;
    email?: string;
}

export interface SearchUserSelectProps {
    options: UserOption[];               // ← passed from parent (React Query data)
    value?: UserOption | null;
    onChange: (option: UserOption | null) => void;
    placeholder?: string;
    className?: string;
    isLoading?: boolean;                 // ← from useQuery isLoading
    isDisabled?: boolean;
    error?: string;
    noOptionsMessage?: (inputValue: string) => ReactNode;
   onSearch?: (inputValue: string) => void;

}

export const SearchUserSelect = ({
    options,
    value,
    onChange,
    placeholder = 'Search user...',
    className,
    isLoading = false,
    isDisabled = false,
    error,
    noOptionsMessage = (inputValue: string) => inputValue.length < 3 ? <div className="text-sm text-gray-500">Type at least 3 characters...</div> : <div className="text-sm text-gray-500">No users found</div>,
    onSearch
}: SearchUserSelectProps) => {
    return (
        <div className={cn('tw:space-y-1', className)}>
            <AsyncSelect<UserOption>
                cacheOptions
                defaultOptions={options} 
                loadOptions={(inputValue, callback) => {
                    const filtered = options.filter((opt) =>
                        opt.label.toLowerCase().includes(inputValue.toLowerCase())
                    );
                    callback(filtered);
                }}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                isDisabled={isDisabled || isLoading}
                isClearable
                isSearchable
                noOptionsMessage={({ inputValue }) => noOptionsMessage(inputValue)}
                loadingMessage={() => 'Searching...'}
                isLoading={isLoading}
                classNamePrefix="react-select"
                styles={{
                    control: (base) => ({
                        ...base,
                        borderColor: error ? '#ef4444' : base.borderColor,
                        backgroundColor: 'white',
                        borderRadius: '0.375rem', // rounded-md
                        boxShadow: 'none',
                        '&:hover': {
                            borderColor: error ? '#ef4444' : '#9ca3af',
                        },
                    }),
                    menu: (base) => ({
                        ...base,
                        zIndex: 9999,
                        borderRadius: '0.375rem',
                        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                    }),
                    option: (base, state) => ({
                        ...base,
                        backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#eff6ff' : 'white',
                        color: state.isSelected ? 'white' : '#1f2937',
                        padding: '8px 12px',
                        cursor: 'pointer',
                    }),
                }}
                theme={(theme) => ({
                    ...theme,
                    borderRadius: 6,
                    colors: {
                        ...theme.colors,
                        primary: '#3b82f6',           // blue-500
                        primary75: '#60a5fa',         // blue-400
                        primary50: '#93c5fd',         // blue-300
                        primary25: '#eff6ff',         // blue-50
                        danger: '#ef4444',
                        neutral0: 'white',
                        neutral5: '#f9fafb',
                        neutral10: '#f3f4f6',
                        neutral20: '#d1d5db',
                        neutral30: '#9ca3af',
                        neutral60: '#6b7280',
                        neutral80: '#374151',
                    },
                })}
                onInputChange={(inputValue, { action }) => {
                    if (action === 'input-change') {
                        onSearch?.(inputValue);
                    }
                    return inputValue;
                }}

            />

            {error && <p className="tw:text-sm tw:text-red-600 tw:mt-1">{error}</p>}
        </div>
    );
};