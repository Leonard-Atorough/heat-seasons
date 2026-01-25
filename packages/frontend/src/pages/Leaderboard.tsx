import { type Leaderboard } from "@shared/models";
import { PageHeader } from "../components/common/PageHeader";
import { LeaderboardRow, LeaderboardHeader } from "../components/features/Leaderboard";
import styles from "./Leaderboard.module.css";

export default function Leaderboard({ leaderboard }: { leaderboard?: Leaderboard }) {
  return (
    <div className={styles.leaderboard}>
      <PageHeader
        title="Winter 2026 Leaderboard"
        subtitle="Season 1 • 1 of 8 Races Complete"
        variant="default"
      />

      <div className={styles.leaderboard__content}>
        <div className={styles.leaderboard__cards}>
          <LeaderboardHeader />
          {leaderboard?.standings.map((racer, index) => (
            <LeaderboardRow key={racer.racerId} racer={racer} position={index + 1} />
          ))}
        </div>
      </div>
    </div>
  );
}
