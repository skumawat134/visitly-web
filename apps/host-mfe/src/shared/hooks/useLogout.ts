import { useAuthStore } from "@visitly/app-store";
import { useNavigate } from "react-router-dom";
import { useToastStore } from "@visitly/app-store";
import { deleteAllCookies } from "@/utils/cookie.utils";
import { useMutation } from "@tanstack/react-query";
import { logoutApi } from "../../shared/services/auth.api";

export function useLogout() {
  const navigate = useNavigate();
  const clearAuthStore = useAuthStore((s) => s.logout);
  const toast = useToastStore((state) => state.showToast);

  const logoutMutation = useMutation({
    mutationFn: logoutApi,
    onSettled: () => {
      sessionStorage.clear();
      localStorage.clear();
      clearAuthStore();
      deleteAllCookies("/");
      CheckFreshworksWidget();
      navigate("/visitly/login");
      toast({ message: "Logout Successfully!" });
    },
  });

  function CheckFreshworksWidget() {
    if ((window as any).FreshworksWidget) {
      try {
        (window as any).FreshworksWidget("hide");
      } catch (e) {
        console.warn("Error hiding FreshworksWidget:", e);
      }
    }
  }

  const logOut = async () => {
    logoutMutation.mutate();
  };

  return { logOut };
}
