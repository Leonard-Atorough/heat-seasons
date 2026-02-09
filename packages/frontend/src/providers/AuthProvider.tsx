import { useState, useEffect, ReactNode } from "react";
import { AuthContext, AuthContextType } from "../contexts/AuthContext";
import { User } from "../../types/domain/models";
import { config } from "../config";
import { TokenManager } from "../utils/tokenManager";
import apiClient from "../services/apiClient";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = TokenManager.getToken();
    if (token) {
      checkAuth(token);
    } else {
      setIsLoading(false);
    }
  }, []);

  const checkAuth = async (token: string) => {
    try {
      const response = await apiClient.get<User>("/auth/me", undefined, {
        Authorization: `Bearer ${token}`,
      });
      setUser(response);
    } catch (error) {
      console.error("Auth check failed:", error);
      TokenManager.removeToken();
    } finally {
      setIsLoading(false);
    }
  };

  // Watch for token changes from AuthCallback or TokenManager
  useEffect(() => {
    const token = TokenManager.getToken();
    if (token && !user) {
      checkAuth(token);
    }
  }, [user]);

  const loginWithGoogle = () => {
    window.location.href = `${config.apiBaseUrl}/auth/google`;
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      TokenManager.removeToken();
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
