import { useAuth } from "../../../hooks/useAuth";
import styles from "./AuthForm.module.css";
import GoogleLoginButton from "./GoogleLoginButton";

export interface AuthFormProps {}

export default function AuthForm(_: AuthFormProps) {
  const auth = useAuth();

  return (
    <div className={styles.authForm}>
      <h1 className={styles.authForm__title}>Sign In</h1>
      <div className={styles.authForm__form}>
        <GoogleLoginButton onClick={auth.loginWithGoogle} />
      </div>
    </div>
  );
}
