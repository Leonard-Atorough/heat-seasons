import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../services/apiClient";
import { User } from "../../types/domain/models";
import { useAuth } from "../hooks/useAuth";

export default function AuthCallback() {
  const navigate = useNavigate();
  const auth = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");

    if (error) {
      navigate("/login?error=" + error);
      return;
    }

    const authenticateUser = async () => {
      try {
        //TODO: This is a bit of a hack, we should ideally have a dedicated endpoint to verify the token
        // and get the user info instead of relying on the /auth/me endpoint which is used for fetching
        // user info in general. This is because if the token is invalid or expired, we want to redirect
        // the user to the login page instead of showing an error message on the dashboard page.
        const user: User = auth.isAuthenticated
          ? auth.user!
          : await apiClient.get<User>("/auth/me");
        if (user) {
          navigate("/");
        } else {
          navigate("/login?error=auth_failed");
        }
      } catch (err) {
        navigate("/login?error=auth_failed_catch");
      }
    };

    authenticateUser();
  }, [navigate, auth.isAuthenticated, auth.user]);

  return <div>Authenticating...</div>;
}
