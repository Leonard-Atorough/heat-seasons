import { RacerCard } from "../components/features/Racer";
import styles from "./Racers.module.css";
import { useEffect, useMemo } from "react";
import { useRacers } from "../hooks/data/useRacer";

export default function Racers() {
  const { data: racers, refresh } = useRacers();

  const handleRefresh = async () => {
    await refresh();
  };

  // we could periodically refresh the racers data every 10 minutes to ensure it's up to date
  useEffect(() => {
    handleRefresh();
    const intervalId = setInterval(handleRefresh, 10 * 60 * 1000); // refresh every 10 minutes
    return () => clearInterval(intervalId); // cleanup on unmount
  }, []);

  const racersWithProfile = useMemo(() => {
    if (!racers) return [];
    return racers
      .map((racer) => ({
        ...racer,
        profileUrl: racer.profileUrl || "https://avatar.iran.liara.run/public/1",
      }))
      .sort((a, b) => a.team.localeCompare(b.team));
  }, [racers]);

  if (!racersWithProfile) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.racersPage}>
      <h1>Racers</h1>
      <div className={styles.racersGrid}>
        {racersWithProfile.map((racer) => (
          <RacerCard key={racer.id} racer={racer} />
        ))}
      </div>
    </div>
  );
}
