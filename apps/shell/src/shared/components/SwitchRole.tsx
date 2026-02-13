// Switch.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSwitchLogin } from "../hooks/useSwitchLogin";

const SESSION_TO_LOCAL_KEYS = "__session_backup_keys__";

export default function SwitchRole() {
  const navigate = useNavigate();

  function restoreSessionStorageFromLocal() {
    const keysJson = localStorage.getItem(SESSION_TO_LOCAL_KEYS);
    if (!keysJson) return;

    const keys: string[] = JSON.parse(keysJson);

    keys.forEach((key) => {
      const value = localStorage.getItem(key);
      if (value !== null) {
        sessionStorage.setItem(key, value);
      }
    });
  }

  function cleanupTempLocalStorage() {
    const keysJson = localStorage.getItem(SESSION_TO_LOCAL_KEYS);
    if (!keysJson) return;

    const keys: string[] = JSON.parse(keysJson);

    keys.forEach((key) => {
      localStorage.removeItem(key);
    });

    localStorage.removeItem(SESSION_TO_LOCAL_KEYS);
  }

  useEffect(() => {
    restoreSessionStorageFromLocal();
    cleanupTempLocalStorage();

    // redirect to dashboard or role page
    const redirectFrom = localStorage.getItem('redirectFrom')
    if(redirectFrom == 'ADMIN'){
    navigate("/host/past-visitors", { replace: true });
    }else{
      navigate("/admin/work_area/dashboard", { replace: true });
    }
    localStorage.removeItem('redirectFrom')
  }, []);

  return <div>Switching account...</div>;
}
