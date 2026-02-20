// useSwitchLogin.ts
import { useNavigate } from "react-router-dom";

const SESSION_TO_LOCAL_KEYS = "__session_backup_keys__";

export function useSwitchLogin() {
  const navigate = useNavigate();
  const roles = getRolesFromJWT();


  function setToLocalStorageTemporarily() {
    const copiedKeys: string[] = [];
    localStorage.setItem('redirectFrom','HOST')
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (!key) continue;

      const value = sessionStorage.getItem(key);
      if (value !== null) {
        localStorage.setItem(key, value);
        copiedKeys.push(key);
      }
    }

    localStorage.setItem(SESSION_TO_LOCAL_KEYS, JSON.stringify(copiedKeys));
  }

 function getRolesFromJWT(): string[] {
  const token = sessionStorage.getItem("accessToken");
  if (!token) return [];

  try {
    const [, payloadBase64] = token.split(".");
    if (!payloadBase64) return [];

    const payload = JSON.parse(atob(payloadBase64.replace(/-/g, "+").replace(/_/g, "/")));
    const roles = payload?.roles;

    if (Array.isArray(roles)) return roles;

    if (typeof roles === "string") {
      return roles.match(/\w+/g) ?? [];
    }

    return [];
  } catch {
    return [];
  }
}



  function switchToAnotherRole() {
    setToLocalStorageTemporarily();

    // redirect to switch page
    window.open("/switch", "_blank");
  }

  function switchToHost(){
    setToLocalStorageTemporarily();
    window.open("/switch", "_blank");
  }

  return {
    switchToAnotherRole,
    roles,
    switchToHost
  };
}
