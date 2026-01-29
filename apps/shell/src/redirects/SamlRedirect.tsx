import { Navigate, useLocation } from "react-router-dom";

export function SamlRedirect() {
  const { search } = useLocation();

  return <Navigate to={`/visitly/saml${search}`} replace />;
}
