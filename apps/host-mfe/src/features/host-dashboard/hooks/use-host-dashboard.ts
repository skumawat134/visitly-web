import { useState, useMemo } from "react";
import type {
  MatrixData,
  MySignInLogResponse,
} from "../api/hoastDashboard.types";
import {
  getUpCommingVisitors,
  getPastVisitors,
  getMyDeliveryLogs,
  updateDeliveryStatus,
  getMySignInLogs,
  getHostSites,
} from "../api/hostDashboard.api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@visitly/app-store";
import type { VisitorVisit } from "../api/hoastDashboard.types";
import { useEntitlements } from "@/features/visitor-detail/hooks/useEntitlement";
export const useHostDashboard = () => {
  const { isDeliveryManagerEntitled } = useEntitlements();

  const queryClient = useQueryClient();
  const [viewAs, setViewAs] = useState("all"); // 'all' | 'myself' | delegate userId
  const [upcomingSearch, setUpcomingSearch] = useState("");
  const [checkedInSearch, setCheckedInSearch] = useState("");
  const [upcomingLocation, setUpcomingLocation] = useState("all");
  const [checkedInLocation, setCheckedInLocation] = useState("all");
  const currentUser = useAuthStore((state) => state.user);

  const now = new Date();
  const todayDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  const { data: upcomingVisitorsData = [] } = useQuery<any>({
    queryKey: ["upcoming-visitors"],
    queryFn: () =>
      getUpCommingVisitors({
        //  userId: currentUser?.id,
        scheduleCheckinStartDate: new Date().toISOString().split("T")[0],
      }),
      refetchOnMount: "always",
  });

  const { data: pastVisitorsData = [] } = useQuery<any>({
    queryKey: ["past-visitors"],
    queryFn: () =>
      getPastVisitors({
        visitStartDate: new Date().toISOString().split("T")[0],
        visitEndDate: new Date().toISOString().split("T")[0],
      }),
      refetchOnMount: "always",
  });

  const { data: deliveriesData = [] } = useQuery<any>({
    queryKey: ["deliveries"],
    queryFn: () => getMyDeliveryLogs({}),
    enabled: isDeliveryManagerEntitled,
    refetchOnMount: "always",
  });

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
      queryClient.invalidateQueries({ queryKey: ["deliveries"] });
    },
  });

 const { data: mySignInLogsData } = useQuery<
  MySignInLogResponse,
  Error,
  MySignInLogResponse
>({
  queryKey: ["mySignInLogs"],
  queryFn: () =>
    getMySignInLogs({
      limit: 1,
      offset: 0,
      sort: "desc",
      sortBy: "checkinTime",
    }),
    refetchOnMount: "always",
  select: (data) => {
    const updatedResults = data.results.map((item) => ({
      ...item,
      currentActive:
        item.checkinTime && !item.checkoutTime ? "Active" : "In-Active",
    }));

    return {
      ...data,
      results: updatedResults,
    };
  },
});


  const { data: sites } = useQuery({
    queryKey: ["hostSites"],
    queryFn: getHostSites,
  });


  const filterByHost = (v: VisitorVisit) => {
    if (viewAs === "all") return true;
    if (viewAs === "myself") return v.hostUserId === currentUser?.id;
    return v.hostUserId === viewAs;
  };

  // Helper to ensure we always have an array
  const ensureArray = (data: any): any[] => {
    if (Array.isArray(data)) return data;
    if (data && typeof data === "object" && Array.isArray(data.items))
      return data.items;
    if (data && typeof data === "object" && Array.isArray(data.data))
      return data.data;
    if (data && typeof data === "object" && Array.isArray(data.results))
      return data.results;
    return [];
  };

  const expectedToday = useMemo(() => {
    const list = ensureArray(upcomingVisitorsData).filter((v) =>
      filterByHost(v),
    );
    let filtered = list;
    if (upcomingLocation !== "all") {
      filtered = filtered.filter((v) => v.siteId === upcomingLocation);
    }
    if (upcomingSearch.trim()) {
      const q = upcomingSearch.toLowerCase();
      filtered = filtered.filter(
        (v) =>
          v?.fullName?.toLowerCase()?.includes(q) ||
          v?.email?.toLowerCase()?.includes(q) ||
          (v?.companyName || "")?.toLowerCase()?.includes(q) ||
          (v?.hostName || "")?.toLowerCase()?.includes(q),
      );
    }
    return filtered;
  }, [
    viewAs,
    upcomingSearch,
    upcomingLocation,
    todayDate,
    upcomingVisitorsData,
  ]);

  const todaysVisitors = useMemo(() => {
    const list = ensureArray(pastVisitorsData).filter((v) => {
      if (!v.checkinTime) return false;
      return filterByHost(v);
    });
    let filtered = list;
    if (checkedInLocation !== "all") {
      filtered = filtered.filter((v) => v.siteId === checkedInLocation);
    }
    if (checkedInSearch.trim()) {
      const q = checkedInSearch.toLowerCase();
      filtered = filtered.filter(
        (v) =>
          v.fullName.toLowerCase().includes(q) ||
          v.email.toLowerCase().includes(q) ||
          (v.companyName || "").toLowerCase().includes(q) ||
          (v.hostName || "").toLowerCase().includes(q),
      );
    }
    // Sort: CHECKED_IN first, then CHECKED_OUT
    filtered.sort((a, b) => {
      if (a.visitStatus === "CHECKED_IN" && b.visitStatus !== "CHECKED_IN")
        return -1;
      if (a.visitStatus !== "CHECKED_IN" && b.visitStatus === "CHECKED_IN")
        return 1;
      return 0;
    });
    return filtered;
  }, [viewAs, checkedInSearch, checkedInLocation, todayDate, pastVisitorsData]);

  const pendingPackages = useMemo(() => {
    return ensureArray(deliveriesData).filter((d) => d.status === "Pending");
  }, [deliveriesData]);

  const metrics: MatrixData = useMemo(() => {
    const upcoming = ensureArray(upcomingVisitorsData);
    const past = ensureArray(pastVisitorsData);
    const deliveriesRes = ensureArray(deliveriesData);
    return {
      expectedToday: expectedToday.length,
      checkedInToday: todaysVisitors.length,
      pendingDeliveries: deliveriesRes.filter((d) => d.status === "Pending")
        .length,
    };
  }, [upcomingVisitorsData, pastVisitorsData, deliveriesData, todayDate]);

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
    viewAs,
    setViewAs,
    upcomingSearch,
    setUpcomingSearch,
    checkedInSearch,
    setCheckedInSearch,
    upcomingLocation,
    setUpcomingLocation,
    checkedInLocation,
    setCheckedInLocation,
    expectedToday,
    todaysVisitors,
    pendingPackages,
    metrics,
    currentUser,
    updateDeliveryStatus: updateStatusMutation.mutate,
    mySignInLogsData: mySignInLogsData?.results[0],
    sites: sites?.results || [],
    delegates,
    isDeliveryManagerEntitled,
  };
};
