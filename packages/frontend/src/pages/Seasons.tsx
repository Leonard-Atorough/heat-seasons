import { useMemo } from "react";
import { Card } from "../components/common/Card";
import styles from "./Seasons.module.css";
import { useSeasons } from "../hooks/data/useSeason";
import { Button, LoadingSkeletonCard } from "../components/common";
import { useAuth } from "../hooks/useAuth";

export default function Seasons() {
  const { data: seasons, refresh, isLoading } = useSeasons();
  const auth = useAuth();

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

  if (isLoading) {
    return (
      <div>
        <LoadingSkeletonCard />
      </div>
    );
  }

  return (
    <div className={styles.seasonsPage}>
      <h1 className={styles.seasonsPage__title}>Seasons</h1>
      {seasons && (
        <div className={styles.seasonsPage__cards}>
          {seasons?.map((season) => (
            <Card key={season.id} className={styles.seasonCard}>
              <h2>{season.name}</h2>
              <p>Start Date: {new Date(season.startDate).toDateString()}</p>
              <p>
                End Date: {season.endDate ? new Date(season.endDate).toDateString() : "Ongoing"}
              </p>
              <p>Status: {season.status}</p>
            </Card>
          ))}
        </div>
      )}
      <div className={styles.seasonsPage__actions}>
        <Button
          onClick={handleRefresh}
          className={styles.refreshButton}
          type={"button"}
          variant="secondary"
        >
          Refresh
        </Button>
        <div className={styles.seasonsPage__contributorActions}>
          {auth?.isContributor && (
            <>
              <Button
                onClick={() => alert("Create Season functionality coming soon!")}
                className={styles.createButton}
                type={"button"}
              >
                Create Season
              </Button>
              <Button
                onClick={() => alert("Edit Season functionality coming soon!")}
                className={styles.editButton}
                type={"button"}
              >
                Edit Season
              </Button>
            </>
          )}
        </div>
      </div>
      <div className={styles.seasonsPage__footer}>
        <p>
          Note: Only one season can be active at a time. Please ensure to end the current season
          before starting a new one.
        </p>
        <p>For any issues or suggestions, please contact the development team.</p>
      </div>
    </div>
  );
}
