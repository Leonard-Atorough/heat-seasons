import { useState, useEffect, ReactNode } from "react";
import { AuthContext, AuthContextType } from "../contexts/AuthContext";
import { User } from "../../types/domain/models";
import { config } from "../config";
import apiClient from "../services/apiClient";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Q. How can i prevent this from 429'ing if the user refreshes the page multiple times?
  // A. Implement a debounce mechanism or use a library like lodash.debounce to limit the frequency
  // of API calls. You can also implement caching to store the authentication status for a short period,
  // reducing the need for repeated API calls on page refresh.
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
      setUser(null);
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
      await apiClient.post("/auth/logout", {});
      setUser(null);
      window.location.href = "/";
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Logout failed:", error);
      }
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
