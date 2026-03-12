import { useNavigate, useParams, useLocation } from "react-router-dom";
import { RacerWithStats } from "shared";
import { Button } from "../components/common";
import styles from "./RacerDetailsPage.module.css";

export default function RacerDetailsPage() {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const racer = (location.state as { racer?: RacerWithStats } | null)?.racer;

  const displayName = racer?.name ?? name?.replace(/-/g, " ");

  return (
    <div className={styles.page}>
      <div className={styles.page__header}>
        <Button type="button" variant="ghost" onClick={() => navigate("/racers")}>
          ← Back to Racers
        </Button>
      </div>
      <div className={styles.page__content}>
        <div className={styles.comingSoon}>
          <span className={styles.comingSoon__icon}>🏎️</span>
          <h1 className={styles.comingSoon__title}>
            {displayName}
          </h1>
          <p className={styles.comingSoon__subtitle}>Racer Details</p>
          <p className={styles.comingSoon__message}>
            This page is coming soon. Check back later for detailed race history,
            statistics, and more.
          </p>
        </div>
      </div>
    </div>
  );
}
