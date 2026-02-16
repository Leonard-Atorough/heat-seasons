import { Card } from "../../common/Card";
import styles from "./LeaderboardHeader.module.css";

export interface LeaderboardHeaderProps {
  compact?: boolean;
  variant?: "default" | "dashboard";
}

export default function LeaderboardHeader({
  compact = false,
  variant = "default",
}: LeaderboardHeaderProps) {
  return (
    <Card variant={compact ? "compact" : "default"} className={styles.leaderboardHeader}>
      <span className={styles.leaderboardHeader__position}>#</span>
      <span className={styles.leaderboardHeader__name}>Racer</span>
      <span className={styles.leaderboardHeader__team}>Team</span>
      <span className={styles.leaderboardHeader__races}>Races</span>
      <span className={styles.leaderboardHeader__points}>Points</span>
      <span className={styles.leaderboardHeader__wins}>
        {variant === "default" ? "Wins" : "Position"}
      </span>
      {variant === "default" && <span className={styles.leaderboardHeader__podiums}>Podiums</span>}
    </Card>
  );
}
