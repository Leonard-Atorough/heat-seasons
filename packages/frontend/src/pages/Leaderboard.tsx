import { type Leaderboard } from "shared";
import { PageHeader } from "../components/common/PageHeader";
import { LeaderboardRow, LeaderboardHeader } from "../components/features/Leaderboard";
import styles from "./Leaderboard.module.css";
import { useLeaderboard } from "../hooks/data/useLeaderboard";
import { useEffect } from "react";

export default function Leaderboard() {
  const { data: leaderboard, refresh } = useLeaderboard();

  const handleRefresh = async () => {
    await refresh();
  };

  // we could periodically refresh the leaderboard data every 5 minutes to ensure it's up to date
  useEffect(() => {
    handleRefresh();
    const intervalId = setInterval(handleRefresh, 5 * 60 * 1000); // refresh every 5 minutes
    return () => clearInterval(intervalId); // cleanup on unmount
  }, []);

  return (
    <div className={styles.leaderboard}>
      <PageHeader
        title={leaderboard?.seasonName.toUpperCase() ?? "WINTER 2026 LEADERBOARD"}
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
