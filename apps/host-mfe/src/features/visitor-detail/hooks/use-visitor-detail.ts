import { useQuery } from "@tanstack/react-query";
import {
    getPreRegistrationDetail,
    getVisitDetail,
    getOffenderDetails,
    getIdValidationDetails,
    getNotificationLogs,
    getVisitNotes
} from "../api/visitorDetail.api";
import type {
    VisitorDetail,
    OffenderDetail,
    IdValidationDetail,
    NotificationLog,
    VisitNote
} from "../api/visitorDetail.types";
import { useEntitlements } from "./useEntitlement";

export const useVisitorDetail = (id: string, isPrefill: boolean , source: string) => {
    const { offenderCheckEntitled } = useEntitlements();


    const visitorQuery = useQuery<VisitorDetail>({
    queryKey: ["visitorDetail", id, isPrefill, source],
    queryFn: () =>
      (isPrefill || source == 'pastVisitors') ? getVisitDetail(id) : getPreRegistrationDetail(id),
    enabled: !!id,
  });


    const offendersQuery = useQuery<OffenderDetail | null>({
        queryKey: ["offenders", id],
        queryFn: () => getOffenderDetails(id),
        enabled: !!id && isPrefill && offenderCheckEntitled,
    });

    const idValidationQuery = useQuery<IdValidationDetail | null>({
        queryKey: ["idValidation", id],
        queryFn: () => getIdValidationDetails(id),
        enabled: !!id && isPrefill,
    });

    const notificationsQuery = useQuery<NotificationLog[]>({
        queryKey: ["notifications", id],
        queryFn: () => getNotificationLogs(id),
        enabled: !!id && isPrefill,
    });

    const notesQuery = useQuery<VisitNote[]>({
        queryKey: ["notes", id],
        queryFn: () => getVisitNotes(id),
        enabled: !!id && source !== 'pastVisitors', // Notes are not needed for past visitors
    });

    return {
        visitor: visitorQuery.data,
        offenders: offendersQuery.data,
        idValidation: idValidationQuery.data,
        notifications: notificationsQuery.data || [],
        notes: notesQuery.data || [],
        isLoading: visitorQuery.isLoading,
        isError: visitorQuery.isError,
        error: visitorQuery.error,
    };
};
