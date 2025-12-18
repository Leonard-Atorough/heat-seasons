import { Card } from "../../common/Card";
import styles from "./LeaderboardHeader.module.css";

export interface LeaderboardHeaderProps {
  compact?: boolean;
}

export default function LeaderboardHeader({ compact = true }: LeaderboardHeaderProps) {
  return (
    <Card variant={compact ? "compact" : "default"} className={styles.leaderboardHeader}>
      <span className={styles.leaderboardHeader__position}>#</span>
      <span className={styles.leaderboardHeader__name}>Racer</span>
      <span className={styles.leaderboardHeader__team}>Team</span>
      <span className={styles.leaderboardHeader__races}>Races</span>
      <span className={styles.leaderboardHeader__points}>Points</span>
    </Card>
  );
}
