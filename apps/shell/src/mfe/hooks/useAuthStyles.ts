import { useEffect } from "react";

export function useAuthStyles() {
  useEffect(() => {
    if (document.querySelector('link[data-scope="auth"]')) return;

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/preflight.css";
    link.dataset.scope = "auth";

    document.head.appendChild(link);

    return () => {
      link.remove();
    };
  }, []);
}
