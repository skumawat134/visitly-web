// useSwitchLogin.ts
import { useNavigate } from "react-router-dom";

const SESSION_TO_LOCAL_KEYS = "__session_backup_keys__";

export function useSwitchLogin() {
  const navigate = useNavigate();
  const roles = getRolesFromJWT();
  console.log("roles",roles)


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

function getRolesFromJWT(token?: string): string[] {
  try {
    const token = sessionStorage.getItem("accessToken");
    if (!token) return [];

    const base64Payload = token.split(".")[1];
    if (!base64Payload) return [];

    const payload = JSON.parse(
      atob(base64Payload.replace(/-/g, "+").replace(/_/g, "/"))
    );
    console.log('payload',payload.roles)
    if (Array.isArray(payload.roles)) return payload.roles;
    
    return payload.roles || [];
  } catch (e) {
    console.error("JWT decode failed", e);
    return [];
  }
}


  function switchToAnotherRole() {
    setToLocalStorageTemporarily();

    // redirect to switch page
     window.open("/switch", "_blank");
  }

  return {
    switchToAnotherRole,
    roles
  };
}
