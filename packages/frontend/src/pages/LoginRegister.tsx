import { Suspense } from "react";
import { Card } from "../components/common/Card";
import { AuthForm } from "../components/features/Auth";
import styles from "./LoginRegister.module.css";

export default function LoginRegister() {
  return (
    <Suspense fallback={<Loading />}>
      <Card className={styles.loginRegister__card}>
        <AuthForm />
      </Card>
    </Suspense>
  );
}

function Loading() {
  return <div>Loading...</div>;
}
