import { useState, useEffect, ReactNode } from "react";
import { AuthContext, AuthContextType, User } from "../contexts/AuthContext";
import { config } from "../config";
import { TokenManager } from "../utils/tokenManager";

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
      const response = await fetch(`${config.authRoute}/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        TokenManager.removeToken();
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      TokenManager.removeToken();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      TokenManager.setToken(token);
      checkAuth(token);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

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
