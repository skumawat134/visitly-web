import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCompanyDirectoryUsers, getCompanyDirectoryUserDetail } from '../api/companyDirectory.api'
import type { companyDirectoryUserRecord, CompanyDirectoryResponse } from '../api/companyDirectory.types'
import { useDebounce } from "../../../shared/hooks/useDebounce"



export const useCompanyDirectory = () => {
    const [pageSize, setPageSize] = useState(24);
    const [pageIndex, setPageIndex] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [sortBy, setSortBy] = useState<string>('firstName');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const debouncedSearch = useDebounce(searchTerm, 500);



    // Fetch directory users using React Query
    const { data, isLoading, refetch, isFetching } = useQuery<CompanyDirectoryResponse>({
        queryKey: ['evacDirectory', pageIndex, pageSize, debouncedSearch, sortBy, sortOrder],
        queryFn: () =>
            getCompanyDirectoryUsers({
                limit: pageSize,
                offset: debouncedSearch.length ? 0 : pageIndex * pageSize,
                q: debouncedSearch,
                status: 'ACTIVE', // Defaulting to ACTIVE as in Angular
                sort: sortOrder,
                sortBy: sortBy,
            }),
    });

    // Fetch individual user detail when selected
    const { data: selectedUserDetail, isLoading: isDetailLoading } = useQuery({
        queryKey: ['evacUserDetail', selectedUserId],
        queryFn: () => getCompanyDirectoryUserDetail(selectedUserId || ''),
        enabled: !!selectedUserId,
    });

    const handlePageChange = (newPageIndex: number) => {
        setPageIndex(newPageIndex);
    };

    const handlePageSizeChange = (newPageSize: number) => {
        setPageSize(newPageSize);
        setPageIndex(0); // Reset to first page
    };

    const openViewUserModal = (user: companyDirectoryUserRecord) => {
        setSelectedUserId(user.id);
        setIsModalOpen(true);
    };

    const closeViewUserModal = () => {
        setIsModalOpen(false);
        setSelectedUserId(null);
    };

    const rowData = useMemo(() => {
        if (!data?.results) return [];
        return data.results;
    }, [data]);

    return {
        rowData,
        totalRecords: data?.totalRecords || 0,
        isLoading: isLoading || isFetching,
        pageIndex,
        pageSize,
        searchTerm,
        setSearchTerm,
        handlePageChange,
        handlePageSizeChange,
        refetch,
        isModalOpen,
        selectedUserDetail,
        isDetailLoading,
        openViewUserModal,
        closeViewUserModal,
        setSortBy,
        sortBy,
        sortOrder,
        setSortOrder
    };
};
