import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPastVisitors , getVisitorDetail} from '../api/pastVisitors.api';

// Types based on the Angular models
export interface VisitRecord {
  id: string;
  fullName: string;
  companyName: string;
  visitorType: string;
  checkinTime: string;
  checkoutTime: string | null;
  avatarUri: string | null;
  email: string;
  phoneNumber: string;
  visitCustomFields?: Array<{ name: string; value: string }>;
}

export interface PastVisitorsResponse {
  results: VisitRecord[];
  totalRecords: number;
}

export const usePastVisitors = () => {
  const [pageSize, setPageSize] = useState(15);
  const [pageIndex, setPageIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVisitor, setSelectedVisitor] = useState<VisitRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch past visitors using React Query
  const { data, isLoading, refetch, isFetching } = useQuery<PastVisitorsResponse>({
    queryKey: ['pastVisitors', pageIndex, pageSize],
    queryFn: () =>
    getPastVisitors({
      limit: pageSize,
      offset: pageIndex * pageSize,
    }),
    
  });

  const { data: selectedVisitorDetail } = useQuery({
      queryKey: ["visitorDetails", selectedVisitor?.id],
      queryFn: () => getVisitorDetail(selectedVisitor?.id || ''),
      enabled: !!selectedVisitor?.id, // 🔥 only call when visitorId exists
    });


  const handlePageChange = (newPageIndex: number) => {
    setPageIndex(newPageIndex);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPageIndex(0); // Reset to first page
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
    if (!data?.results) return [];
    // If you want to apply local search filtering as well
    if (searchTerm) {
      return data.results.filter(row => 
        row.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.companyName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return data.results;
  }, [data, searchTerm]);

  

  return {
    rowData,
    totalRecords: data?.totalRecords || 0,
    isLoading: isLoading || isFetching,
    pageSize,
    pageIndex,
    searchTerm,
    setSearchTerm,
    handlePageChange,
    handlePageSizeChange,
    refetch,
    selectedVisitor,
    isModalOpen,
    openVisitorDetails,
    closeVisitorDetails,
    selectedVisitorDetail
  };
};
