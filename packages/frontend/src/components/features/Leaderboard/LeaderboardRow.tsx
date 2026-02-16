import { LeaderboardEntry } from "shared";
import { Card } from "../../common/Card";
import styles from "./LeaderboardRow.module.css";

export interface LeaderboardRowProps {
  racer: LeaderboardEntry;
  compact?: boolean;
  position: number;
  className?: string;
}

export default function LeaderboardRow({ racer, position, compact = true, className }: LeaderboardRowProps) {
  return (
    <Card variant={compact ? "compact" : "default"} className={className}>
      <span className={styles.leaderboardRow__position}>{position}</span>
      <span className={styles.leaderboardRow__name}>{racer.racerName}</span>
      <span className={styles.leaderboardRow__team}>{racer.team}</span>
      <span className={styles.leaderboardRow__races}>
        {racer.racesParticipated} {racer.racesParticipated === 1 ? "race" : "races"}
      </span>
      <span className={styles.leaderboardRow__points}>
        {racer.totalPoints} {racer.totalPoints === 1 ? "pt" : "pts"}
      </span>
      <span className={styles.leaderboardRow__wins}>
        {racer.wins} {racer.wins > 1 ? "wins" : "win"}
      </span>
      <span className={styles.leaderboardRow__podiums}>
        {racer.podiums} {racer.podiums > 1 ? "podiums" : "podium"}
      </span>
    </Card>
  );
}
