import { useEffect, useMemo, useState } from "react";
import { Card } from "../components/common/Card";
import styles from "./Seasons.module.css";
import { useSeasons } from "../hooks/data/useSeason";
import { Button, LoadingSkeletonCard } from "../components/common";
import { useAuth } from "../hooks/useAuth";
import { AddSeasonModal } from "../components/features/Season/AddSeasonModal";

export default function Seasons() {
  const { data: seasons, refresh, isLoading } = useSeasons();
  const auth = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRefresh = async () => {
    await refresh();
  };
  // Refresh on mount and every 10 minutes
  useEffect(() => {
    handleRefresh();
    const intervalId = setInterval(handleRefresh, 10 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, []);

  const sortedSeasons = useMemo(() => {
    if (!seasons) return [];
    return [...seasons].sort(
      (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
    );
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
          {sortedSeasons.map((season) => (
            <Card key={season.id} className={styles.seasonCard}>
              <h2>{season.name.toUpperCase()}</h2>
              <span className={styles.seasonDetails}>
                <p>
                  <strong>Start Date:</strong> {new Date(season.startDate).toDateString()}
                </p>
                <p>
                  <strong>End Date:</strong>{" "}
                  {season.endDate ? new Date(season.endDate).toDateString() : "Ongoing"}
                </p>
                <p>
                  <strong>Status:</strong> {season.status}
                </p>
              </span>
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
                onClick={() => setIsModalOpen(true)}
                className={styles.createButton}
                type={"button"}
              >
                Create Season
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
      {isModalOpen && auth.isContributor && (
        <AddSeasonModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={() => {
            setIsModalOpen(false);
            handleRefresh();
          }}
        />
      )}
    </div>
  );
}
