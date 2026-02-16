import { useEffect } from "react";
import { useAuth } from "./useAuth";

export function useProtectedPage() {
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!user && !isAuthenticated) {
      window.location.href = "/login";
    }
  }, [user, isAuthenticated]);

  return isLoading;
}
