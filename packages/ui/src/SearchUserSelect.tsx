import React, { type ReactNode } from 'react';
import Select from 'react-select';
import { cn } from './utils';

export interface UserOption {
  value: string;
  label: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface SearchUserSelectProps {
  options: UserOption[];
  value?: UserOption | UserOption[] | null;
  onChange: (option: UserOption | UserOption[] | null) => void;
  placeholder?: string;
  className?: string;
  isLoading?: boolean;
  isDisabled?: boolean;
  error?: string;
  noOptionsMessage?: (inputValue: string) => ReactNode;
  onSearch?: (inputValue: string) => void;
  multi?: boolean;
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
  noOptionsMessage = (inputValue: string) =>
    inputValue.length < 3
      ? <div className="tw:text-sm tw:text-gray-500">Type at least 3 characters...</div>
      : <div className="tw:text-sm tw:text-gray-500">No users found</div>,
  onSearch,
  multi = false,
}: SearchUserSelectProps) => {

  return (
    <div className={cn('tw:w-full', className)}>

      <Select<UserOption, typeof multi>
        options={options}
        value={value}
        onChange={(selected) => {
          if (multi) onChange(selected as UserOption[]);
          else onChange(selected as UserOption | null);
        }}
        placeholder={placeholder}
        isDisabled={isDisabled || isLoading}
        isClearable
        isSearchable
        isMulti={multi}
        noOptionsMessage={({ inputValue }) => noOptionsMessage(inputValue)}
        loadingMessage={() => 'Searching...'}
        isLoading={isLoading}
        classNamePrefix="react-select"

        styles={{
          // ⭐ MATCHES YOUR NATIVE SELECT
          control: (base, state) => ({
            ...base,
            minHeight: '38px',
            borderRadius: '0.375rem',
            boxShadow: 'none',
            cursor: state.isDisabled ? 'not-allowed' : 'default',
            backgroundColor: state.isDisabled ? '#f3f4f6' : 'white',
            borderColor: error
              ? '#fca5a5'
              : state.isDisabled
              ? '#e5e7eb'
              : '#d1d5db',
            '&:hover': {
              borderColor: state.isDisabled
                ? '#e5e7eb'
                : error
                ? '#f87171'
                : '#9ca3af',
            },
          }),

          valueContainer: (base) => ({
            ...base,
            padding: '0 12px',
          }),

          placeholder: (base, state) => ({
            ...base,
            color: state.isDisabled ? '#9ca3af' : '#6b7280',
          }),

          singleValue: (base, state) => ({
            ...base,
            color: state.isDisabled ? '#9ca3af' : '#111827',
          }),

          input: (base, state) => ({
            ...base,
            color: state.isDisabled ? '#9ca3af' : '#111827',
            cursor: state.isDisabled ? 'not-allowed' : 'text',
          }),

          dropdownIndicator: (base, state) => ({
            ...base,
            color: state.isDisabled ? '#9ca3af' : '#9ca3af',
          }),

          indicatorSeparator: (base, state) => ({
            ...base,
            backgroundColor: state.isDisabled ? '#e5e7eb' : '#e5e7eb',
          }),

          // MULTI CHIP MATCH
          multiValue: (base, state) => ({
            ...base,
            backgroundColor: state.isDisabled ? '#e5e7eb' : '#dbeafe',
          }),

          multiValueLabel: (base, state) => ({
            ...base,
            color: state.isDisabled ? '#6b7280' : '#1e40af',
          }),

          multiValueRemove: (base, state) => ({
            ...base,
            display: state.isDisabled ? 'none' : 'flex',
          }),

          menu: (base) => ({
            ...base,
            zIndex: 9999,
            borderRadius: '0.375rem',
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
          }),

          option: (base, state) => ({
            ...base,
            backgroundColor: state.isSelected
              ? '#3b82f6'
              : state.isFocused
              ? '#eff6ff'
              : 'white',
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
            primary: '#3b82f6',
            primary25: '#eff6ff',
            neutral20: '#d1d5db',
            neutral30: '#9ca3af',
          },
        })}

        onInputChange={(inputValue, { action }) => {
          if (action === 'input-change') {
            onSearch?.(inputValue);
          }
        }}

        filterOption={(candidate, input) => {
          if (input) {
            return candidate.label.toLowerCase().includes(input.toLowerCase());
          }
          return true;
        }}
      />

      {error && (
        <p className="tw:mt-1 tw:text-sm tw:text-red-600">
          {error}
        </p>
      )}
    </div>
  );
};
