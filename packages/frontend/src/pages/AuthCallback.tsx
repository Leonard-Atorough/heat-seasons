import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TokenManager } from "../utils/tokenManager";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const error = params.get("error");

    if (error) {
      navigate("/login?error=" + error);
      return;
    }

    if (token) {
      TokenManager.setToken(token);
      // Give the auth provider a moment to verify the token
      const timer = setTimeout(() => {
        navigate("/dashboard");
      }, 500);
      return () => clearTimeout(timer);
    } else {
      navigate("/login?error=no_token");
    }
  }, [navigate]);

  return <div>Authenticating...</div>;
}
