import { useAuth } from "../../../hooks/useAuth";
import FormGroup from "../../common/FormGroup";
import { Button } from "../../common/Button";
import styles from "./AuthForm.module.css";

export interface AuthFormProps {
  isRegistering: boolean;
  onToggleMode: () => void;
}

export default function AuthForm({ isRegistering, onToggleMode }: AuthFormProps) {
  const auth = useAuth();

  const handleSubmit = (event: React.FormEvent): void => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (isRegistering) {
      const username = formData.get("username") as string;
      auth.register(username, email, password);
    } else {
      auth.login(email, password);
    }

    form.reset();
  };

  return (
    <div className={styles.authForm}>
      <h1 className={styles.authForm__title}>{isRegistering ? "Register" : "Login"}</h1>
      <form className={styles.authForm__form} onSubmit={handleSubmit}>
        {isRegistering && <FormGroup element="input" label="Username" id="username" />}

        <FormGroup element="input" label="Email Address" id="email" />

        <FormGroup element="input" label="Password" id="password" type="password" />

        <Button type="submit" variant="primary">
          {isRegistering ? "Register" : "Login"}
        </Button>
      </form>

      <Button type="button" variant="link" onClick={onToggleMode}>
        {isRegistering
          ? "Already registered? Click here to Login"
          : "Not registered? Click here to Register"}
      </Button>
    </div>
  );
}
