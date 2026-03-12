import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { LoadingSkeletonCard } from "src/components/common";

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
        if (!auth.isLoading) {
          if (auth.isAuthenticated) {
            navigate("/");
            return;
          } else {
            navigate("/login?error=auth_failed");
            return;
          }
        }
      } catch (err) {
        navigate("/login?error=auth_failed_catch");
      }
    };

    authenticateUser();
  }, [navigate, auth.isAuthenticated, auth.user]);

  return (
    <div className="container">
      <LoadingSkeletonCard
        lines={1}
        height="250px"
        includeTitle={true}
        testId="auth-callback-loading-skeleton"
      />
    </div>
  );
}
