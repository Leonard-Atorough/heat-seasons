import { Suspense, useState } from "react";
import { Card } from "../components/common/Card";
import { AuthForm } from "../components/features/Auth";
import styles from "./LoginRegister.module.css";

export default function LoginRegister() {
  const [isRegistering, setIsRegistering] = useState(false);

  return (
    <Suspense fallback={<Loading />}>
      <Card className={styles.loginRegister__card}>
        <AuthForm
          isRegistering={isRegistering}
          onToggleMode={() => setIsRegistering(!isRegistering)}
        />
      </Card>
    </Suspense>
  );
}

function Loading() {
  return <div>Loading...</div>;
}
