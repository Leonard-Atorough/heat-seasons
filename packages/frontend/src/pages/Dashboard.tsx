import { StatCard } from "../components/features/Dashboard";
import { LeaderboardHeader } from "../components/features/Leaderboard";
import styles from "./Dashboard.module.css";
import { Card } from "../components/common/Card";
import { useLeaderboard } from "../hooks/data/useLeaderboard";
import { useSeasons } from "../hooks/data/useSeason";
import { useEffect } from "react";
import { Hero } from "../components/features/Dashboard";
import LoadingSkeletonCard from "../components/common/LoadingSkeletonCard";

export default function Dashboard() {
  const { data: leaderboard, refresh, isLoading: isLeaderboardLoading } = useLeaderboard();
  const { data: seasons, isLoading: isSeasonsLoading } = useSeasons();

  const handleRefresh = async () => {
    await refresh();
  };

  // we could periodically refresh the leaderboard data every 5 minutes to ensure it's up to date
  useEffect(() => {
    handleRefresh();
    const intervalId = setInterval(handleRefresh, 5 * 60 * 1000); // refresh every 5 minutes
    return () => clearInterval(intervalId); // cleanup on unmount
  }, []);
  // This is a bit hacky, but it allows us to show the most up to date leaderboard data on the dashboard without having to wait for the user to navigate to the leaderboard page. We can look into a more elegant solution later, but for now this should work fine.

  const MEDALS = ["🥇", "🥈", "🥉"];
  const BADGE_COLORS = ["gold", "silver", "bronze"];
  const topThreeRacers = leaderboard?.standings.slice(0, 3) || [];

  const topRacers = Array.from({ length: 3 }, (_, i) => ({
    position: i + 1,
    name: topThreeRacers?.[i]?.racerName ?? "N/A",
    team: topThreeRacers?.[i]?.team ?? "N/A",
    races: topThreeRacers?.[i]?.racesParticipated ?? 0,
    points: topThreeRacers?.[i]?.totalPoints ?? 0,
    medal: MEDALS[i],
    badgeColor: BADGE_COLORS[i],
  }));

  return (
    <div className={styles.dashboard}>
      <Hero
        title={leaderboard?.seasonName.toUpperCase() ?? "SEASON ONE WINTER 2026"}
        subtitle={`Races Completed: ${seasons?.[0]?.racesCompleted ?? 0} / ${
          seasons?.[0]?.totalRaces ?? "?"
        }`}
        backgroundImage="/images/dashboard-hero.webp"
      />

      <section className={styles.dashboard__content}>
        <div className={styles.dashboard__stats}>
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
        </div>

        {/* Leaderboard Preview Section */}
        <div className={styles.dashboard__leaderboardPreview}>
          <h3 className={styles.dashboard__sectionTitle}>Top 3 Leaderboard</h3>
          <div className={styles.dashboard__leaderboardCards}>
            <LeaderboardHeader variant="dashboard" />
            {topRacers.map((racer) =>
              isLeaderboardLoading ? (
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
