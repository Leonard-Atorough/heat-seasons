import { useEffect } from "react";
import { TokenManager } from "../utils/tokenManager";
import { apiClient } from "../services/apiClient";

export function useAuthToken() {
  useEffect(() => {
    const token = TokenManager.getToken();
    if (token) {
      apiClient.setDefaultHeader("Authorization", `Bearer ${token}`);
    } else {
      apiClient.removeDefaultHeader("Authorization");
    }
  }, []);
}
