import { Suspense } from "react";
import { AuthForm } from "../components/features/Auth";
import styles from "./LoginRegister.module.css";

export default function LoginRegister() {
  return (
    <Suspense fallback={<Loading />}>
      <div className={styles.loginRegister__card}>
        <AuthForm />
      </div>
    </Suspense>
  );
}

function Loading() {
  return <div>Loading...</div>;
}
