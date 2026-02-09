import { useMemo } from "react";
import { Card } from "../components/common/Card";
import styles from "./Seasons.module.css";
import { useSeasons } from "../hooks/data/useSeason";

export default function Seasons() {
  const { data: seasons, refresh } = useSeasons();

  const handleRefresh = async () => {
    await refresh();
  };
  // we could periodically refresh the seasons data every 10 minutes to ensure it's up to date
  useMemo(() => {
    handleRefresh();
    const intervalId = setInterval(handleRefresh, 10 * 60 * 1000); // refresh every 10 minutes
    return () => clearInterval(intervalId); // cleanup on unmount
  }, []);

  useMemo(() => {
    if (!seasons) return [];
    seasons.sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
  }, [seasons]);

  if (!seasons) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Seasons</h1>
      <div>
        {seasons?.map((season) => (
          <Card key={season.id} className={styles.seasonCard}>
            <h2>{season.name}</h2>
            <p>Start Date: {new Date(season.startDate).toDateString()}</p>
            <p>End Date: {season.endDate ? new Date(season.endDate).toDateString() : "Ongoing"}</p>
            <p>Status: {season.status}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
