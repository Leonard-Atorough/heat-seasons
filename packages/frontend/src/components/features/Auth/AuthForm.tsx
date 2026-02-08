import { useAuth } from "../../../hooks/useAuth";
import { Button } from "../../common/Button";
import styles from "./AuthForm.module.css";

export interface AuthFormProps {}

export default function AuthForm(_: AuthFormProps) {
  const auth = useAuth();

  return (
    <div className={styles.authForm}>
      <h1 className={styles.authForm__title}>Sign In</h1>
      <div className={styles.authForm__form}>
        <Button type="button" variant="primary" onClick={auth.loginWithGoogle}>
          Sign in with Google
        </Button>
      </div>
    </div>
  );
}
