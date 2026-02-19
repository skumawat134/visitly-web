import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getVisitorDetail } from "../api/pastVisitors.api";

export const useVisitorDetails = () => {
  const [visitorId, setVisitorId] = useState<string>("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["visitorDetails", visitorId],
    queryFn: () => getVisitorDetail(visitorId),
    enabled: !!visitorId, // 🔥 only call when visitorId exists
  });

  return {
    data,
    isLoading,
    error,
    setVisitorId,
  };
};
