import { Navigate, useLocation } from "react-router-dom";

export function PermaVisitsRedirect() {
  const { pathname, search } = useLocation();
  const restPath = pathname.replace("/permaVisits", "");

  return (
    <Navigate
      to={`/admin/permaVisits${restPath}${search}`}
      replace
    />
  );
}
