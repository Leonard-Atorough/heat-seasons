import { useNavigate } from "react-router-dom";
import { Button } from "../components/common";
import styles from "./NotFound.module.css";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className={styles.notFound}>
      <span className={styles.notFound__code}>404</span>
      <h1 className={styles.notFound__title}>Page Not Found</h1>
      <p className={styles.notFound__message}>
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Button onClick={() => navigate("/")}>Go to Dashboard</Button>
    </div>
  );
}
