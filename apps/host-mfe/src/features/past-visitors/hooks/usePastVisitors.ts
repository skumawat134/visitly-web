import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPastVisitors, getVisitorDetail } from '../api/pastVisitors.api';
import { useAuthStore } from '@visitly/app-store';
import type { PastVisitorsResponse } from '../api/pastVisitors.types';

export interface VisitRecord {
  id: string;
  fullName: string;
  companyName: string;
  visitorType: string;
  checkinTime: string;
  checkoutTime: string | null;
  avatarUri: string | null;
  email: string;
  hostUserId : string
  phoneNumber: string;
  groupName?: string;
  visitCustomFields?: Array<{ name: string; value: string }>;
}


interface UsePastVisitorsProps {
  searchTerm?: string;
  dateRange?: { startDate: string | null; endDate: string | null };
  siteId?: string;
  visitorTypeId?: string;
  hostId?: string;
  groupName?: string;
  pageSize?: number; // ✅ Only this comes from parent
  viewAs? : string
}

export const usePastVisitors = ({
  searchTerm = '',
  dateRange,
  siteId,
  visitorTypeId,
  groupName,
  pageSize = 15,
  viewAs
}: UsePastVisitorsProps = {}) => {
  // ✅ Internal pagination state
  const [pageIndex, setPageIndex] = useState(0);

  const [selectedVisitor, setSelectedVisitor] = useState<VisitRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const currentUser = useAuthStore((state) => state.user)

  const { data, isLoading, refetch, isFetching } =
    useQuery<PastVisitorsResponse>({
      queryKey: [
        'pastVisitors',
        pageIndex,
        pageSize,
        searchTerm,
        dateRange,
        siteId,
        visitorTypeId,
        groupName,
      ],
      queryFn: () =>
        getPastVisitors({
          limit: pageSize,
          offset: pageIndex * pageSize,
          q: searchTerm,
          siteId,
          visitorTypeId,
          groupName,
          visitStartDate: dateRange?.startDate || '',
          visitEndDate: dateRange?.endDate || '',
        }),
    });

  // Visitor detail query
  const { data: selectedVisitorDetail } = useQuery({
    queryKey: ['visitorDetails', selectedVisitor?.id],
    queryFn: () => getVisitorDetail(selectedVisitor?.id || ''),
    enabled: !!selectedVisitor?.id,
  });

  // ✅ Page change handler
  const handlePageChange = (newPageIndex: number) => {
    setPageIndex(newPageIndex);
  };

  // ✅ If page size changes from parent → reset page
  const resetToFirstPage = () => {
    setPageIndex(0);
  };

  const openVisitorDetails = (visitor: VisitRecord) => {
    setSelectedVisitor(visitor);
    setIsModalOpen(true);
  };

  const closeVisitorDetails = () => {
    setIsModalOpen(false);
    setSelectedVisitor(null);
  };


  const rowData = useMemo(() => {

    if (!viewAs) return data?.results || []

    if(viewAs == 'all'){
      return data?.results;
    }
    if(viewAs == 'myself'){
      return data?.results.filter((item) =>  item?.hostUserId === currentUser?.id)
    }
    
    return data?.results.filter((item) => item?.hostUserId == viewAs) || []
  }
, [data , viewAs]);

  return {
    rowData,
    totalRecords: data?.totalRecords ?? 0,
    isLoading: isLoading || isFetching,
    pageIndex,
    pageSize,
    handlePageChange,
    resetToFirstPage,
    closeVisitorDetails,
    selectedVisitorDetail,
  };
};
