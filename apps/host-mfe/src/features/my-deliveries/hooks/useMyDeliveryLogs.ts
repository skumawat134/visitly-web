import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMyDeliveryLogs,
  getAllSites,
  getDeliveryAreasBySite,
  updateDeliveryLog,
  updateDeliveryLogBulk,
  updateDeliveryStatus,
  updateDeliveryStatusBulk,
  deleteDeliveryLogs,
} from "../api/myDeliveryLogs.api";
import type {
  DeliveryLogRecord,
  MyDeliveryLogsResponse,
  DeliveryLogStatus,
} from "../api/myDeliveryLogs.types";
import { format, subDays, startOfToday } from "date-fns";
import type { DateRangeValue } from "../../../shared/components/DateRangePicker";
import { useAuthStore } from "@visitly/app-store";

export const useMyDeliveryLogs = () => {
  const queryClient = useQueryClient();
  const [pageSize, setPageSize] = useState(15);
  const [pageIndex, setPageIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [filterSiteId, setFilterSiteId] = useState<string>("");
  const [siteAreaId, setSiteAreaId] = useState<string>("");
  const [dateRange, setDateRange] = useState<DateRangeValue>({
    startDate: null,
    endDate: null,
  });
  const [sortBy, setSortBy] = useState("receiveD");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Modal states
  const [selectedPackage, setSelectedPackage] =
    useState<DeliveryLogRecord | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [isPickupConfirmOpen, setIsPickupConfirmOpen] = useState(false);
  const [isBulkPickupConfirmOpen, setIsBulkPickupConfirmOpen] = useState(false);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [isNotMyDeliveryOpen, setIsNotMyDeliveryOpen] = useState(false);
  const [viewAs, setViewAs] = useState("all");
  const currentUser = useAuthStore((state) => state.user);

  // Fetch sites
  const { data: sitesData } = useQuery({
    queryKey: ["sites"],
    queryFn: getAllSites,
  });

  // Fetch delivery areas based on selected site
  const { data: areasData } = useQuery({
    queryKey: ["deliveryAreas", filterSiteId],
    queryFn: () => getDeliveryAreasBySite(filterSiteId),
    enabled: !!filterSiteId,
  });

  // Fetch logs
  const { data, isLoading, refetch, isFetching } =
    useQuery<MyDeliveryLogsResponse>({
      queryKey: [
        "myDeliveryLogs",
        pageIndex,
        pageSize,
        selectedStatus,
        filterSiteId,
        siteAreaId,
        dateRange,
        searchTerm,
        sortBy,
        sortOrder,
      ],
      queryFn: () =>
        getMyDeliveryLogs({
          limit: pageSize,
          offset: pageIndex * pageSize,
          sort: sortOrder,
          sortBy: sortBy,
          q: searchTerm,
          status: selectedStatus ? [selectedStatus] : undefined,
          siteId: filterSiteId,
          siteAreaId: siteAreaId,
          receivedStartDate: dateRange.startDate || "",
          receivedEndDate: dateRange.endDate || "",
        }),
    });

  // Mutations
  const updateStatusMutation = useMutation({
    mutationFn: ({
      id,
      status,
      pickupD,
    }: {
      id: string;
      status: string;
      pickupD?: string;
    }) => updateDeliveryStatus(id, { status, pickupD }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myDeliveryLogs"] });
      setIsDetailsModalOpen(false);
      setIsPickupConfirmOpen(false);
      setIsNotMyDeliveryOpen(false);
    },
  }); //

  const updateStatusBulkMutation = useMutation({
    mutationFn: (payload: any[]) => updateDeliveryStatusBulk(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myDeliveryLogs"] });
      setIsBulkPickupConfirmOpen(false);
    },
  });

  const updateLogMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<DeliveryLogRecord>;
    }) => updateDeliveryLog(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myDeliveryLogs"] });
      setIsDetailsModalOpen(false);
    },
  });

  const updateLogBulkMutation = useMutation({
    mutationFn: (payload: any[]) => updateDeliveryLogBulk(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myDeliveryLogs"] });
      setIsMoveModalOpen(false);
    },
  });

  const deleteLogsMutation = useMutation({
    mutationFn: (ids: string[]) =>
      deleteDeliveryLogs(ids.map((id) => ({ deliveryLogId: id }))),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myDeliveryLogs"] });
      setIsDeleteModalOpen(false);
    },
  });

  const handlePageChange = (newPageIndex: number) => {
    setPageIndex(newPageIndex);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPageIndex(0);
  };

  const getRecipientName = (row: DeliveryLogRecord) => {
    if (row.recipientFirstName || row.recipientLastName) {
      return `${row.recipientFirstName ?? ""} ${row.recipientLastName ?? ""}`.trim();
    }
    return "Unidentified";
  };

  const getCarrierName = (row: DeliveryLogRecord) => {
    return row.carrier || "Unknown Carrier";
  };

  const rowData = useMemo(() => {
    if (viewAs === "all") {
      return data?.results || [];
    }
    if (viewAs == "myself") {
      return data?.results.filter(
        (pkg) => pkg.recipientUserId === currentUser?.id,
      );
    }

    return data?.results.filter((pkg) => pkg.recipientUserId === viewAs) || [];
  }, [data, viewAs]);

  const delegates = useMemo(() => {
    const raw = sessionStorage.getItem("userinfo");
    if (!raw) return [];

    try {
      const user = JSON.parse(raw)?.delegateFor ?? [];
      const formatted = user.map((u: any) => ({
        id: u.hostUserId,
        name: u.hostFirstName + " " + u.hostLastName,
      }));
      return formatted;
    } catch (e) {
      console.error("Invalid userinfo in sessionStorage", e);
      return [];
    }
  }, []);

  return {
    rowData,
    totalRecords: data?.totalRecords || 0,
    isLoading: isLoading || isFetching,
    pageIndex,
    pageSize,
    searchTerm,
    setSearchTerm,
    selectedStatus,
    setSelectedStatus,
    filterSiteId,
    setFilterSiteId,
    siteAreaId,
    setSiteAreaId,
    sites: sitesData?.results || [],
    deliveryAreas: areasData?.results || [],
    dateRange,
    setDateRange,
    handlePageChange,
    handlePageSizeChange,
    refetch,
    getRecipientName,
    getCarrierName,
    selectedPackage,
    setSelectedPackage,
    isDetailsModalOpen,
    setIsDetailsModalOpen,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    isMoveModalOpen,
    setIsMoveModalOpen,
    isPickupConfirmOpen,
    setIsPickupConfirmOpen,
    isBulkPickupConfirmOpen,
    setIsBulkPickupConfirmOpen,
    isImageViewerOpen,
    setIsImageViewerOpen,
    isNotMyDeliveryOpen,
    setIsNotMyDeliveryOpen,
    updateStatus: updateStatusMutation.mutate,
    updateStatusBulk: updateStatusBulkMutation.mutate,
    updateLog: updateLogMutation.mutate,
    updateLogBulk: updateLogBulkMutation.mutate,
    deleteLogs: deleteLogsMutation.mutate,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    viewAs,
    setViewAs,
    delegates,
  };
};
