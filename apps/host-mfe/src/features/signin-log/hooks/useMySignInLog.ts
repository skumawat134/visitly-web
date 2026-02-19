import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMySignInLogs, getHostSites } from '../api/mySignInLog.api';
import type { SignInLogRecord, MySignInLogResponse, Site } from '../api/mySignInLog.types'
import { format, subDays, startOfDay, startOfToday, endOfDay } from 'date-fns';
import type { DateRangeValue } from '../../../shared/components/DateRangePicker';

export const useMySignInLog = () => {
    const [pageSize, setPageSize] = useState(15);
    const [pageIndex, setPageIndex] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterSiteId, setFilterSiteId] = useState<string>('');
    const [dateRange, setDateRange] = useState<DateRangeValue>({
  startDate: null,
  endDate: null,
});

    const [sortBy, setSortBy] = useState('checkinTime');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    // Fetch sites for filter
    const { data: sitesData } = useQuery({
        queryKey: ['hostSites'],
        queryFn: getHostSites,
    });

   

    // Fetch sign-in logs
    const { data, isLoading, refetch, isFetching } = useQuery<MySignInLogResponse>({
        queryKey: ['mySignInLogs', pageIndex, pageSize, filterSiteId, dateRange, sortBy, sortOrder],
        queryFn: () =>
            getMySignInLogs({
                limit: pageSize,
                offset: pageIndex * pageSize,
                sort: sortOrder,
                sortBy: sortBy,
                q: searchTerm,  
                siteId: filterSiteId,
                signinStartDate: dateRange.startDate || "",
                signinEndDate: dateRange.endDate || "",
            }),
    });

    const handlePageChange = (newPageIndex: number) => {
        setPageIndex(newPageIndex);
    };

    const handlePageSizeChange = (newPageSize: number) => {
        setPageSize(newPageSize);
        setPageIndex(0);
    };

    const getTimeDiff = (t1: string, t2: string) => {
        const t1Date = new Date(t1);
        const t2Date = new Date(t2);
        const date_now = t2Date.valueOf();
        const date_future = t1Date.valueOf();
        let delta = Math.abs(date_future - date_now) / 1000;

        const days = Math.floor(delta / 86400);
        delta -= days * 86400;
        const hours = Math.floor(delta / 3600) % 24;
        delta -= hours * 3600;
        const minutes = Math.floor(delta / 60) % 60;

        return (
            (days !== 0 ? `${days} d ` : '') +
            (hours !== 0 ? `${hours} h ` : '') +
            (minutes !== 0 ? `${minutes} min` : (days === 0 && hours === 0 ? '0 Minutes' : ''))
        ).trim();
    };

    const rowData = useMemo(() => {
        return data?.results || [];
    }, [data]);

    return {
        rowData,
        totalRecords: data?.totalRecords || 0,
        isLoading: isLoading || isFetching,
        pageIndex,
        pageSize,
        searchTerm,
        setSearchTerm,
        filterSiteId,
        setFilterSiteId,
        sites: sitesData?.results || [],
        dateRange,
        setDateRange,
        handlePageChange,
        handlePageSizeChange,
        refetch,
        getTimeDiff,
        setSortBy,
        setSortOrder
    };
};
