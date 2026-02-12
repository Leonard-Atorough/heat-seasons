import { useState, useEffect, ReactNode } from "react";
import { AuthContext, AuthContextType } from "../contexts/AuthContext";
import { User } from "../../types/domain/models";
import { config } from "../config";
import apiClient from "../services/apiClient";
import { ApiResponse } from "@shared/index";

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
        // fail silently, we still want to clear the user and redirect to login page even if the logout request fails
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
