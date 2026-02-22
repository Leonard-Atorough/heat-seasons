import { StatCard } from "../components/features/Dashboard";
import { LeaderboardHeader } from "../components/features/Leaderboard";
import styles from "./Dashboard.module.css";
import { Card } from "../components/common/Card";
import { useSeason, useSeasons } from "../hooks/data/useSeason";
import { useRacers } from "../hooks/data/useRacer";
import { useRaceResult } from "../hooks/data/useRaceResult";
import { useMemo } from "react";
import { Hero } from "../components/features/Dashboard";
import { LoadingSkeletonCard } from "../components/common";

export default function Dashboard() {
  const { data: activeSeason, isLoading: isSeasonLoading } = useSeason();
  const { data: seasons, isLoading: isSeasonsLoading } = useSeasons();
  const { data: racers, isLoading: isRacersLoading } = useRacers();
  const { results, isLoading: isResultsLoading } = useRaceResult(activeSeason?.id || "", "");

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
        };
      })
      .sort((a, b) => b.points - a.points)
      .slice(0, 3);

    return Array.from({ length: 3 }, (_, i) => ({
      position: i + 1,
      name: standingsWithDetails?.[i]?.name ?? "N/A",
      team: standingsWithDetails?.[i]?.team ?? "N/A",
      races: 0, // Not computed from results, can be calculated if needed
      points: standingsWithDetails?.[i]?.points ?? 0,
      medal: MEDALS[i],
      badgeColor: BADGE_COLORS[i],
    }));
  }, [results, racers]);

  const isLoading = isSeasonLoading || isSeasonsLoading || isResultsLoading || isRacersLoading;

  return (
    <div className={styles.dashboard}>
      {isLoading ? (
        <LoadingSkeletonCard lines={2} height="300px" includeTitle={true} />
      ) : (
        <Hero
          title={activeSeason?.name.toUpperCase() ?? "SEASON ONE WINTER 2026"}
          subtitle={`Races Completed: ${seasons?.[0]?.racesCompleted ?? 0} / ${
            seasons?.[0]?.totalRaces ?? "?"
          }`}
          backgroundImage="/images/dashboard-hero.webp"
        />
      )}

      <section className={styles.dashboard__content}>
        <div className={styles.dashboard__stats}>
          {isLoading ? (
            <>
              <LoadingSkeletonCard lines={1} height="120px" includeTitle={true} />
              <LoadingSkeletonCard lines={1} height="120px" includeTitle={true} />
              <LoadingSkeletonCard lines={1} height="120px" includeTitle={true} />
            </>
          ) : (
            <>
              <StatCard title="Current Leader" value={topRacers[0].name} />
              <StatCard
                title="Recent Race"
                value="Race 2: Mexican Grand Prix"
                backgroundImage="/images/previous-race-bg.jpg"
              />
              <StatCard
                title="Next Race"
                value="Japanese Grand Prix"
                backgroundImage="/images/next-race-bg.jpg"
              />
            </>
          )}
        </div>

        {/* Leaderboard Preview Section */}
        <div className={styles.dashboard__leaderboardPreview}>
          <h3 className={styles.dashboard__sectionTitle}>Top 3 Leaderboard</h3>
          <div className={styles.dashboard__leaderboardCards}>
            <LeaderboardHeader variant="dashboard" />
            {topRacers.map((racer) =>
              isLoading ? (
                <LoadingSkeletonCard
                  key={racer.position}
                  includeTitle={false}
                  lines={1}
                  height="32px"
                />
              ) : (
                <Card key={racer.position} className={styles.dashboard__leaderboardRow}>
                  <span className={styles.dashboard__leaderboardPosition}>{racer.medal}</span>
                  <span className={styles.dashboard__leaderboardName}>{racer.name}</span>
                  <span className={styles.dashboard__leaderboardTeam}>{racer.team}</span>
                  <span className={styles.dashboard__leaderboardRaces}>{racer.races} races</span>
                  <span className={styles.dashboard__leaderboardPoints}>{racer.points} pts</span>
                  <span
                    className={`${styles.dashboard__colorBadge} ${
                      styles[`dashboard__colorBadge--${racer.badgeColor}`]
                    }`}
                  ></span>
                </Card>
              ),
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
