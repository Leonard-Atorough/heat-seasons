import { StatCard } from "../components/features/Dashboard";
import styles from "./Dashboard.module.css";
import { useSeason, useSeasons } from "../hooks/data/useSeason";
import { useRacers } from "../hooks/data/useRacer";
import { useRaceResult } from "../hooks/data/useRaceResult";
import { useMemo } from "react";
import { Hero } from "../components/features/Dashboard";
import { Button, LoadingSkeletonCard } from "../components/common";
import PodiumCard from "../components/features/Dashboard/PodiumCard";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { data: activeSeason, isLoading: isSeasonLoading } = useSeason();
  const { data: seasons, isLoading: isSeasonsLoading } = useSeasons();
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
                value={races && races.length > 1 ? races[races.length - 2].name : "N/A"}
                backgroundImage="/images/previous-race-bg.jpg"
              />
              <StatCard
                title="Next Race"
                value={races && races.length > 0 ? races[races.length - 1].name : "N/A"}
                backgroundImage="/images/next-race-bg.jpg"
              />
            </>
          )}
        </div>

        {/* Leaderboard Preview Section */}
        <div className={styles.dashboard__leaderboardPreview}>
          <h3 className={styles.dashboard__sectionTitle}>Top 3 Leaderboard</h3>
          <div className={styles.dashboard__leaderboardCards}>
            {isLoading ? (
              <>
                <LoadingSkeletonCard
                  key={topRacers[0].position}
                  includeTitle={false}
                  lines={1}
                  height="32px"
                />
                <LoadingSkeletonCard
                  key={topRacers[1].position}
                  includeTitle={false}
                  lines={1}
                  height="32px"
                />
                <LoadingSkeletonCard
                  key={topRacers[2].position}
                  includeTitle={false}
                  lines={1}
                  height="32px"
                />
              </>
            ) : (
              <>
                <PodiumCard
                  key={topRacers[1].position}
                  medal={topRacers[1].badgeColor as "gold" | "silver" | "bronze"}
                  medalImageEmoji={topRacers[1].medal}
                  racerName={topRacers[1].name}
                  racerTeam={topRacers[1].team}
                  teamColor={topRacers[1].teamColor}
                  racerNationality={topRacers[1].nationality}
                  points={topRacers[1].points}
                  imageUrl={null}
                />
                <PodiumCard
                  key={topRacers[0].position}
                  medal={topRacers[0].badgeColor as "gold" | "silver" | "bronze"}
                  medalImageEmoji={topRacers[0].medal}
                  racerName={topRacers[0].name}
                  racerTeam={topRacers[0].team}
                  teamColor={topRacers[0].teamColor}
                  racerNationality={topRacers[0].nationality}
                  points={topRacers[0].points}
                  imageUrl={null}
                />
                <PodiumCard
                  key={topRacers[2].position}
                  medal={topRacers[2].badgeColor as "gold" | "silver" | "bronze"}
                  medalImageEmoji={topRacers[2].medal}
                  racerName={topRacers[2].name}
                  racerTeam={topRacers[2].team}
                  teamColor={topRacers[2].teamColor}
                  racerNationality={topRacers[2].nationality}
                  points={topRacers[2].points}
                  imageUrl={null}
                />
              </>
            )}
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
