import { useEffect, useMemo, useState } from "react";
import { Season } from "shared";
import { Card } from "../components/common/Card";
import styles from "./Seasons.module.css";
import { useSeasons } from "../hooks/data/useSeason";
import { Button, LoadingSkeletonCard } from "../components/common";
import { useAuth } from "../hooks/useAuth";
import { AddSeasonModal, EditSeasonModal } from "../components/features/Season";
import { deleteSeason } from "../services/api/season";

const STATUS_LABELS: Record<string, string> = {
  upcoming: "Upcoming",
  active: "Active",
  completed: "Completed",
  archived: "Archived",
};

export default function Seasons() {
  const { data: seasons, refresh, isLoading } = useSeasons();
  const { isAdmin } = useAuth();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSeason, setEditingSeason] = useState<Season | null>(null);

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

  const handleDelete = async (season: Season) => {
    if (!confirm(`Delete "${season.name}"? This cannot be undone.`)) return;
    try {
      await deleteSeason(season.id);
      await handleRefresh();
    } catch {
      alert("Failed to delete season. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div>
        <LoadingSkeletonCard />
      </div>
    );
  }

  return (
    <div className={styles.seasonsPage}>
      <div className={styles.seasonsPage__header}>
        <h1 className={styles.seasonsPage__title}>Seasons</h1>
        <div className={styles.seasonsPage__actions}>
          {isAdmin && (
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className={styles.createButton}
              type="button"
            >
              Create Season
            </Button>
          )}
          <Button
            onClick={handleRefresh}
            className={styles.refreshButton}
            type="button"
            variant="secondary"
          >
            ↺ Refresh
          </Button>
        </div>
      </div>
      {seasons && (
        <div className={styles.seasonsPage__cards}>
          {sortedSeasons.map((season) => (
            <Card key={season.id} className={styles.seasonCard}>
              <div className={styles.seasonCard__header}>
                <h2 className={styles.seasonCard__name}>{season.name.toUpperCase()}</h2>
                <span
                  className={`${styles.seasonStatus} ${styles[`seasonStatus--${season.status}`]}`}
                >
                  {STATUS_LABELS[season.status] ?? season.status}
                </span>
              </div>
              <span className={styles.seasonDetails}>
                <p>
                  <strong>Start Date:</strong> {new Date(season.startDate).toDateString()}
                </p>
                <p>
                  <strong>End Date:</strong>{" "}
                  {season.endDate ? new Date(season.endDate).toDateString() : "Ongoing"}
                </p>
              </span>
              {isAdmin && (
                <div className={styles.seasonCard__actions}>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setEditingSeason(season)}
                  >
                    Edit
                  </Button>
                  <Button type="button" variant="danger" onClick={() => handleDelete(season)}>
                    Delete
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
      <div className={styles.seasonsPage__footer}>
        <p>
          Note: Only one season can be active at a time. Please ensure to end the current season
          before starting a new one.
        </p>
        <p>For any issues or suggestions, please contact the development team.</p>
      </div>
      {isAddModalOpen && (
        <AddSeasonModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={() => {
            setIsAddModalOpen(false);
            handleRefresh();
          }}
        />
      )}
      {editingSeason && (
        <EditSeasonModal
          isOpen={true}
          season={editingSeason}
          onClose={() => setEditingSeason(null)}
          onSubmit={() => {
            setEditingSeason(null);
            handleRefresh();
          }}
        />
      )}
    </div>
  );
}
