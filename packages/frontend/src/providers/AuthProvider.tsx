import { useState, useEffect, ReactNode } from "react";
import { AuthContext, AuthContextType } from "../contexts/AuthContext";
import { User } from "../../types/domain/models";
import { config } from "../config";
import apiClient from "../services/apiClient";
import { ApiResponse } from "shared";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await apiClient.get<User>("/auth/me");
      setUser(response);
    } catch (error) {
      console.error("Auth check failed:", error);
      await logout();
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = () => {
    window.location.href = `${config.apiBaseUrl}/auth/google`;
  };

  const logout = async (): Promise<void> => {
    // TODO: Handle loading suspense transitions better
    setIsLoading(true);
    try {
      const response: ApiResponse<null> = await apiClient.post("/auth/logout", {});
      if (!response.success) {
        // What to do here that isn't logging to console
        // Maybe we can show a toast notification that logout failed and the user should try again?
        console.error("Logout failed:", response);
      }
      setUser(null);
      window.location.href = "/";
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    loginWithGoogle,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
