import styles from "./Dashboard.module.css";
import { StatCard, PodiumCard, Hero } from "../components/features/Dashboard";
import { useActiveSeason, useRacers, useRaceResult } from "../hooks/data";
import { useMemo } from "react";
import { Button, LoadingSkeletonCard } from "../components/common";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { data: activeSeason, isLoading: isSeasonLoading } = useActiveSeason();
  const { data: racers, isLoading: isRacersLoading } = useRacers();
  const { races, results, isLoading: isResultsLoading } = useRaceResult(activeSeason?.id || "", "");
  const navigate = useNavigate();

  const MEDALS = ["🥇", "🥈", "🥉"];
  const BADGE_COLORS = ["gold", "silver", "bronze"];

  const topRacers = useMemo(() => {
    if (!results || !racers) return [];

    const racerMap = new Map(racers.map((r) => [r.id, r]));
    const standingsWithDetails = results
      .map((result) => {
        const racer = racerMap.get(result.racerId);
        return {
          racerId: result.racerId,
          name: racer?.name ?? "N/A",
          team: racer?.team ?? "N/A",
          points: result.points,
          nationality: racer?.nationality ?? "N/A",
          teamColor: racer?.teamColor ?? "#888", // Default color if team color is not available
        };
      })
      .sort((a, b) => b.points - a.points)
      .slice(0, 3);

    return Array.from({ length: 3 }, (_, i) => ({
      position: i + 1,
      name: standingsWithDetails?.[i]?.name ?? "N/A",
      team: standingsWithDetails?.[i]?.team ?? "N/A",
      nationality: standingsWithDetails?.[i]?.nationality ?? "N/A",
      teamColor: standingsWithDetails?.[i]?.teamColor ?? "#888", // Default color if team color is not available
      races: 0, // Not computed from results, can be calculated if needed
      points: standingsWithDetails?.[i]?.points ?? 0,
      medal: MEDALS[i],
      badgeColor: BADGE_COLORS[i],
    }));
  }, [results, racers]);

  const isLoading = isSeasonLoading || isResultsLoading || isRacersLoading;

  return (
    <div className={styles.dashboard}>
      {isLoading ? (
        <LoadingSkeletonCard
          lines={2}
          height="300px"
          includeTitle={true}
          testId="dashboard-hero-loading-skeleton"
        />
      ) : (
        <Hero
          title={activeSeason?.name.toUpperCase() ?? "SEASON ONE WINTER 2026"}
          subtitle={`Races Completed: ${races?.filter((r) => r.completed)?.length ?? 0} / ${races?.length ?? "?"}`}
          backgroundImage="/images/dashboard-hero.webp"
        />
      )}

      <section className={styles.dashboard__content}>
        <div className={styles.dashboard__stats}>
          {isLoading ? (
            <>
              <LoadingSkeletonCard
                lines={1}
                height="120px"
                includeTitle={true}
                testId="dashboard-stat-1-loading-skeleton"
              />
              <LoadingSkeletonCard
                lines={1}
                height="120px"
                includeTitle={true}
                testId="dashboard-stat-2-loading-skeleton"
              />
              <LoadingSkeletonCard
                lines={1}
                height="120px"
                includeTitle={true}
                testId="dashboard-stat-3-loading-skeleton"
              />
            </>
          ) : (
            <>
              <StatCard title="Current Leader" value={topRacers[0]?.name ?? ""} />
              <StatCard
                title="Recent Race"
                value={races && races.length > 1 ? races[races.length - 2]?.name ?? "N/A" : "N/A"}
                backgroundImage="/images/previous-race-bg.jpg"
              />
              <StatCard
                title="Next Race"
                value={races && races.length > 0 ? races[races.length - 1]?.name ?? "N/A" : "N/A"}
                backgroundImage="/images/next-race-bg.jpg"
              />
            </>
          )}
        </div>

        {/* Leaderboard Preview Section */}
        <div className={styles.dashboard__leaderboardPreview}>
          <h3 className={styles.dashboard__sectionTitle}>Top 3 Leaderboard</h3>
          <div className={styles.dashboard__leaderboardCards}>
            {isLoading
              ? [1, 2, 3].map((i) => (
                  <LoadingSkeletonCard
                    key={i}
                    includeTitle={false}
                    lines={1}
                    height="32px"
                    testId={`dashboard-leaderboard-${i}-loading-skeleton`}
                  />
                ))
              : topRacers && topRacers.map((racer) => (
                  <PodiumCard
                    key={racer.position}
                    medal={racer.badgeColor as "gold" | "silver" | "bronze"}
                    medalImageEmoji={racer.medal}
                    racerName={racer.name}
                    racerTeam={racer.team}
                    teamColor={racer.teamColor}
                    racerNationality={racer.nationality}
                    points={racer.points}
                    imageUrl={null}
                  />
                ))}
          </div>
          <Button
            variant="primary"
            type="button"
            className={styles.dashboard__viewFullLeaderboardButton}
            onClick={() => navigate("/results")}
          >
            View Full Standings
          </Button>
        </div>
      </section>
    </div>
  );
}
