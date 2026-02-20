import { Suspense, useEffect } from "react";
import { AuthForm } from "../components/features/Auth";
import styles from "./LoginRegister.module.css";
import { LoadingSkeletonCard } from "../components/common";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router";

export default function LoginRegister() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/profile");
    }
  }, [isAuthenticated, navigate]);

  return (
    <Suspense fallback={<LoadingSkeletonCard />}>
      <div className={styles.loginRegister__card}>
        <AuthForm />
      </div>
    </Suspense>
  );
}
