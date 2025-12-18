import { Card } from "../../common/Card";
import styles from "./LeaderboardRow.module.css";

export interface LeaderboardRowData {
  position: number;
  name: string;
  team: string;
  points: number;
  races: number;
}

export interface LeaderboardRowProps {
  racer: LeaderboardRowData;
  compact?: boolean;
}

export default function LeaderboardRow({ racer, compact = true }: LeaderboardRowProps) {
  return (
    <Card variant={compact ? "compact" : "default"}>
      <span className={styles.leaderboardRow__position}>{racer.position}</span>
      <span className={styles.leaderboardRow__name}>{racer.name}</span>
      <span className={styles.leaderboardRow__team}>{racer.team}</span>
      <span className={styles.leaderboardRow__races}>{racer.races} races</span>
      <span className={styles.leaderboardRow__points}>{racer.points} pts</span>
    </Card>
  );
}
