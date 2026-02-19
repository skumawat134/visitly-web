import React, { useState, useRef, useImperativeHandle, forwardRef, useEffect } from 'react';
import type { ICellEditorParams, IHeaderParams, ICellRendererParams } from 'ag-grid-community';
import { getHosts } from '../api/pre-registration.api';
import { HelpCircle, X } from 'lucide-react';

// ---------------------------------------------------------------------------
// Host Cell Renderer
// ---------------------------------------------------------------------------
export const HostCellRenderer: React.FC<ICellRendererParams> = (params) => {
    const value = params.value;
    // debug: log each render so we can see what's being passed
    console.log('[HostCellRenderer] render value=', value);
    if (!value) return null;

    // Fallback for string values (e.g. from CSV)
    if (typeof value === 'string') {
        return <span className="tw:text-[13px]">{value}</span>;
    }

    const { firstName = '', lastName = '', email = '' } = value;
    const initial = firstName.charAt(0).toUpperCase();

    return (
        <div className="tw:flex tw:items-center tw:gap-2 tw:h-full">
            <div className="tw:w-6 tw:h-6 tw:rounded-full tw:bg-gray-100 tw:flex tw:items-center tw:justify-center tw:text-[11px] tw:font-semibold tw:text-gray-600 tw:border tw:border-gray-200">
                {initial}
            </div>
            <div className="tw:flex tw:flex-col tw:leading-tight tw:overflow-hidden">
                <span className="tw:text-[13px] tw:font-medium tw:text-gray-900 tw:truncate">
                    {firstName} {lastName}
                </span>
                {/* Optional: Show email on hover or if space allows, but name is usually enough for cell */}
            </div>
            {/* clear icon */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    params.context.clearHost(params.node);
                }}
                className="tw-ml-auto tw-p-1 tw-text-gray-400 hover:tw-text-red-500"
                title="Clear host"
            >
                <X size={12} />
            </button>
        </div>
    );
};

// ---------------------------------------------------------------------------
// Host Cell Editor
// ---------------------------------------------------------------------------
export const HostCellEditor = forwardRef((props: ICellEditorParams, ref) => {
    const [search, setSearch] = useState<string>(() => {
        if (props.value?.firstName) return `${props.value.firstName} ${props.value.lastName}`;
        return props.value || '';
    });
    // we keep the chosen host in a ref so that `getValue` can read it
    // immediately when ag-grid asks; using state here introduced a
    // race where the state wasn't updated yet when editing ended.
    const selectedHostRef = useRef<any>(props.value || null);
    const [selectedHost, setSelectedHost] = useState<any>(props.value || null);
    const [results, setResults] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
        getValue: () => {
            // debug: log what ag-grid reads when editing ends
            console.log('[HostCellEditor] getValue called, selectedHostRef=', selectedHostRef.current, 'search=', search);
            const val = selectedHostRef.current || search;
            // empty string should be treated as null for clearing
            return val === '' ? null : val;
        },
        afterGuiAttached: () => {
            inputRef.current?.focus();
            if (search.length >= 3) {
                fetchHosts(search);
            }
        },
    }));

    const fetchHosts = async (query: string) => {
        if (query.length < 3) {
            setResults([]);
            return;
        }
        setIsLoading(true);
        try {
            const data = await getHosts(query);
            setResults(data.results || []);
            setShowDropdown(true);
        } catch (error) {
            console.error('Failed to fetch hosts', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setSearch(val);
        setSelectedHost(null); // Reset selection when typing
        fetchHosts(val);
    };

    const handleSelect = (host: any) => {
        console.log('[HostCellEditor] handleSelect', host);
        // update both ref (for immediate retrieval) and state (for render)
        selectedHostRef.current = host;
        setSelectedHost(host);
        setSearch(`${host.firstName} ${host.lastName}`);
        setShowDropdown(false);

        // ensure the grid actually stores the object value; in some cases the
        // default blur/commit will fire *after* we call stopEditing and may
        // write an empty string instead. writing directly to the node avoids
        // that race.
        if (props.node) {
            props.node.setDataValue('host', host);
        }

        // commit editing
        if (props.api) {
            props.api.stopEditing();
        } else {
            props.stopEditing();
        }
    };

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="tw:relative tw:w-full tw:h-full tw:bg-white" ref={dropdownRef}>
            <input
                ref={inputRef}
                className="ag-input"
                style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    outline: 'none',
                    padding: '0 12px',
                    fontSize: '13px',
                }}
                value={search}
                onChange={handleSearchChange}
                placeholder="Search host..."
            />
            {showDropdown && results.length > 0 && (
                <div
                    className="tw:absolute tw:top-full tw:left-0 tw:w-full tw:bg-white tw:border tw:border-gray-200 tw:rounded-b-lg tw:shadow-xl tw:z-50 tw:max-h-60 tw:overflow-y-auto"
                >
                    {results.map((host) => (
                        <div
                            key={host.id}
                            className="tw:px-3 tw:py-2 hover:tw:bg-gray-50 tw:cursor-pointer tw:border-b tw:border-gray-50 last:tw:border-none"
                            onMouseDown={(e) => e.preventDefault()} /* keep input focused */
                            onClick={() => handleSelect(host)}
                        >
                            <div className="tw:text-[13px] tw:font-medium tw:text-gray-900">
                                {host.firstName} {host.lastName}
                            </div>
                            <div className="tw:text-[11px] tw:text-gray-500">{host.email}</div>
                        </div>
                    ))}
                </div>
            )}
            {isLoading && (
                <div className="tw:absolute tw:right-2 tw:top-1/2 tw:translate-y-[-50%] tw:text-[10px] tw:text-gray-400">
                    ...
                </div>
            )}
        </div>
    );
});

HostCellEditor.displayName = 'HostCellEditor';

// ---------------------------------------------------------------------------
// Host Header Component
// ---------------------------------------------------------------------------
export const HostHeader: React.FC<IHeaderParams> = (props) => {
    return (
        <div className="tw:flex tw:items-center tw:gap-1.5 tw:w-full">
            <span className="tw:truncate">{props.displayName}</span>
            <div
                className="tw:text-gray-400 tw:cursor-help hover:tw:text-primary-500 tw:flex tw:items-center"
                title="Uses the Host Email for each record if provided; otherwise, applies the selected Global Host."
            >
                <HelpCircle size={14} />
            </div>
        </div>
    );
};
