import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cancelPreRegistration } from "../api/visitorDetail.api";
import { useToastStore } from "@visitly/app-store";
import { useNavigate } from "react-router-dom";

export const useCancelVisit = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const showToast = useToastStore((state) => state.showToast);

    return useMutation({
        mutationFn: ({
            id,
            params,
        }: {
            id: string;
            params: {
                notifyVisitFlag: boolean;
                notifyHostFlag: boolean;
                updateType: "SELECTED_VISIT";
            };
        }) => cancelPreRegistration(id, params),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["visitorDetail"] });
            // Also invalidate the list of visitors if there's any
            queryClient.invalidateQueries({ queryKey: ["upcommingVisitors"] });
             navigate("/host/dashboard");
            showToast({
                message: "Visit has been cancelled successfully.",
                type: "success",
            });
        },
        onError: (error: any) => {
            showToast({
                message: error?.message || "Failed to cancel visit",
                type: "error",
            });
        },
    });
};
