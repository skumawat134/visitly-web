import React from "react";
import AppRouter from "@/routes";
// import { useUserInfoQuery } from "./features/auth/services/useFetchUserInfo";
// import useFetchEntitlements from "./features/auth/services/useFetchEntitlements";
const App = () => {
  // const { data: user } = useUserInfoQuery();
  // const shouldFetchEntitlements =
  //   !!user?.orgId;
  // useFetchEntitlements(user?.orgId, shouldFetchEntitlements);
  return (
    <div data-test-id="auth-mfe-app-root">
      <AppRouter />
    </div>
  );
}

export default App;
