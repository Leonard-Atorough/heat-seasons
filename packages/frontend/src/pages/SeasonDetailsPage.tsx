import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Season } from "shared";
import { Button } from "../components/common";
import styles from "./SeasonDetailsPage.module.css";

export default function SeasonDetailsPage() {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const season = (location.state as { season?: Season } | null)?.season;

  const displayName = season?.name ?? name?.replace(/-/g, " ");

  return (
    <div className={styles.page}>
      <div className={styles.page__header}>
        <Button type="button" variant="ghost" onClick={() => navigate("/seasons")}>
          ← Back to Seasons
        </Button>
      </div>
      <div className={styles.page__content}>
        <div className={styles.comingSoon}>
          <span className={styles.comingSoon__icon}>🏆</span>
          <h1 className={styles.comingSoon__title}>
            {displayName}
          </h1>
          <p className={styles.comingSoon__subtitle}>Season Details</p>
          <p className={styles.comingSoon__message}>
            This page is coming soon. Check back later for the full race schedule,
            standings, and season highlights.
          </p>
        </div>
      </div>
    </div>
  );
}
