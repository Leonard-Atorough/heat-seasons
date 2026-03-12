import { RacerCard } from "../components/features/Racer";
import styles from "./Racers.module.css";
import { useMemo } from "react";
import { useRacers } from "../hooks/data/useRacer";
import { LoadingSkeletonCard, Toast } from "src/components/common";

export default function Racers() {
  const { data: racers, isLoading } = useRacers();

  const racersWithProfile = useMemo(() => {
    if (!racers) return [];
    return racers
      .map((racer) => ({
        ...racer,
        profileUrl: racer.profileUrl || "https://avatar.iran.liara.run/public/1",
      }))
      .sort((a, b) => a.team.localeCompare(b.team));
  }, [racers]);

  return (
    <div className={styles.racersPage}>
      <h1 className={styles.racersPage__title}>Racers</h1>
      <div className={styles.racersGrid}>
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <LoadingSkeletonCard
              key={i}
              lines={1}
              height="300px"
              includeTitle={true}
              testId={`racers-page-loading-skeleton-${i}`}
            />
          ))
        ) : racersWithProfile.length > 0 ? (
          racersWithProfile.map((racer) => <RacerCard key={racer.id} racer={racer} />)
        ) : (
          <Toast message="No racers found for the current season." title={""} />
        )}
      </div>
    </div>
  );
}
