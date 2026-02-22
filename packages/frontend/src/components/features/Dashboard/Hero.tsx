import { useNavigate } from "react-router-dom";
import { Button } from "../../common";
import styles from "./Hero.module.css";
import { useAuth } from "../../../hooks/useAuth";

export interface HeroProps {
  title: string;
  subtitle?: string;
  backgroundImage?: string;
}

export default function Hero({ title, subtitle, backgroundImage }: HeroProps) {
  const navigate = useNavigate();
  const auth = useAuth();
  return (
    <div
      className={styles.hero}
      style={{
        backgroundImage: backgroundImage
          ? `linear-gradient(135deg, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.3)), url(${backgroundImage})`
          : undefined,
      }}
    >
      <div className={styles.hero__content}>
        <h1 className={styles.hero__title}>{`${title} Season`}</h1>
        {subtitle && <p className={styles.hero__subtitle}>{subtitle}</p>}
      </div>
      <div className={styles.hero__actions}>
        <Button variant="primary" type="button" onClick={() => navigate("/results")}>
          View Standings
        </Button>
          {!auth.isAuthenticated && (
        <Button variant="secondary" type="button" onClick={() => navigate("/login")}>
          Sign In
        </Button>
      )}
      </div>
      <div className={styles.hero__scrollIndicator}>
        <span className={styles.hero__scrollIndicatorArrow}>↓</span>
        <span className={styles.hero__scrollIndicatorText}>Scroll down for more</span>
      </div>
    </div>
  );
}
