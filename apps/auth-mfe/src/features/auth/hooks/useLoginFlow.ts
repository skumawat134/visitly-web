import { useAuthStore } from "@visitly/app-store";
import { useNavigate } from "react-router-dom";
import { useLoginMutation } from "../services/useLoginMutation";
import { useUserInfoQuery } from "../services/useFetchUserInfo";

export function useLoginFlow() {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);
  const setEntitlements = useAuthStore((s) => s.setEntitlements);

  const loginMutation = useLoginMutation();

  const login = async (payload: { email: string; password: string }) => {
    try {
      // 1️⃣ Login
      await loginMutation.mutateAsync(payload);

      // 2️⃣ Fetch user
      const user = await useUserInfoQuery.fetch();

      setUser(user);

      // 3️⃣ Fetch entitlements
      if (user.orgId) {
        const entitlements = await useFetchEntitlements.fetch(user.orgId);
        setEntitlements(entitlements);
      }

      // 4️⃣ Navigate only when everything is ready
      navigate("/admin");
    } catch (err) {
      console.error("Login flow failed", err);
    }
  };

  return {
    login,
    isLoading: loginMutation.isPending,
  };
}
