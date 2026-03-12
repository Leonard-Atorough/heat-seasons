import { useEffect, useMemo, useState } from "react";
import { Season } from "shared";
import styles from "./Seasons.module.css";
import { useSeasons } from "../hooks/data/useSeason";
import { Button, LoadingSkeletonCard, PageHeader, Toast } from "../components/common";
import { useAuth } from "../hooks/useAuth";
import { AddSeasonModal, EditSeasonModal, SeasonCard } from "../components/features/Season";
import { deleteSeason, getSeasonParticipants, joinSeason } from "../services/api/season";

const JOINABLE_STATUSES = new Set(["upcoming", "active"]);

export default function Seasons() {
  const { data: seasons, refresh, isLoading } = useSeasons();
  const { isAdmin, isAuthenticated, user } = useAuth();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSeason, setEditingSeason] = useState<Season | null>(null);
  const [error, setError] = useState<{ title: string; message: string } | null>(null);

  // Map of seasonId → Set of racerIds who have joined
  const [participantMap, setParticipantMap] = useState<Map<string, Set<string>>>(new Map());
  // Tracks which seasons are mid-join request
  const [joiningSeasonIds, setJoiningSeasonIds] = useState<Set<string>>(new Set());

  const handleRefresh = async () => {
    await refresh();
  };

  // When seasons load and the user is authenticated, fetch participants for
  // all joinable (non-archived) seasons so we can show the correct join state.
  useEffect(() => {
    if (!isAuthenticated || !seasons || seasons.length === 0) return;

    const fetchAll = async () => {
      const joinable = seasons.filter((s) => s.status !== "archived");
      const results = await Promise.allSettled(
        joinable.map((s) => getSeasonParticipants(s.id).then((ps) => ({ id: s.id, ps }))),
      );
      const map = new Map<string, Set<string>>();
      for (const r of results) {
        if (r.status === "fulfilled") {
          map.set(r.value.id, new Set(r.value.ps.map((p) => p.racerId)));
        }
      }
      setParticipantMap(map);
    };

    fetchAll();
  }, [isAuthenticated, seasons]);

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
    } catch (err: any) {
      const msg =
        err?.data?.message ?? err?.message ?? "Failed to delete season. Please try again.";
      setError({ title: "Error", message: msg });
    }
  };

  const handleJoin = async (season: Season) => {
    if (!user?.racerId) return;
    setJoiningSeasonIds((prev) => new Set(prev).add(season.id));
    try {
      await joinSeason(season.id, user.racerId);
      // Update local participant map optimistically
      setParticipantMap((prev) => {
        const next = new Map(prev);
        const existing = new Set(next.get(season.id) ?? []);
        existing.add(user.racerId!);
        next.set(season.id, existing);
        return next;
      });
    } catch (err: any) {
      const msg = err?.data?.message ?? err?.message ?? "Failed to join season.";
      setError({ title: "Error", message: msg });
    } finally {
      setJoiningSeasonIds((prev) => {
        const next = new Set(prev);
        next.delete(season.id);
        return next;
      });
    }
  };

  if (isLoading) {
    return (
      <div>
        <LoadingSkeletonCard includeTitle maxWidth="600px" testId="seasons-page-loading-skeleton" />
      </div>
    );
  }

  return (
    <div className={styles.seasonsPage}>
      <div className={styles.seasonsPage__header}>
        <PageHeader title="Seasons" subtitle="Explore and manage racing seasons." />
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
      {error && <Toast title={error.title} message={error.message} type="error" />}
      {seasons && (
        <div className={styles.seasonsPage__cards}>
          {sortedSeasons.map((season) => {
            const participants = participantMap.get(season.id);
            const isJoined = !!(user?.racerId && participants?.has(user.racerId));
            const canJoin =
              isAuthenticated &&
              !!user?.racerId &&
              JOINABLE_STATUSES.has(season.status) &&
              !isJoined;
            const isJoining = joiningSeasonIds.has(season.id);

            return (
              <SeasonCard
                key={season.id}
                season={season}
                isJoined={isJoined}
                participants={participants}
                canJoin={canJoin}
                isJoining={isJoining}
                isAdmin={isAdmin}
                isAuthenticated={isAuthenticated}
                user={user}
                handleJoin={handleJoin}
                setEditingSeason={setEditingSeason}
                handleDelete={handleDelete}
              />
            );
          })}
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
