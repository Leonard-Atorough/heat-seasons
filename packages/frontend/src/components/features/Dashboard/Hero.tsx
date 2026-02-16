import { useNavigate } from "react-router-dom";
import { Button } from "../../common";
import styles from "./Hero.module.css";

export interface HeroProps {
  title: string;
  subtitle?: string;
  backgroundImage?: string;
}

export default function Hero({ title, subtitle, backgroundImage }: HeroProps) {
  const navigate = useNavigate();
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
        <Button variant="primary" type="button" onClick={() => navigate("/leaderboard")}>
          View Standings
        </Button>
        <Button variant="secondary" type="button" onClick={() => navigate("/login")}>
          Sign In
        </Button>
      </div>
    </div>
  );
}
