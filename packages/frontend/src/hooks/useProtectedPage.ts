import { useEffect } from "react";
import { useAuth } from "./useAuth";
import { useNavigate } from "react-router";

export function useProtectedPage() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user && !isLoading) {
      navigate("/login");
    }
  }, [user, isLoading, navigate]);

  return isLoading;
}
