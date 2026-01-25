import { Button } from "../components/common/Button";
import { PageHeader } from "../components/common/PageHeader";
import { StatCard } from "../components/features/Dashboard";
import { LeaderboardHeader } from "../components/features/Leaderboard";
import { useNavigate } from "react-router-dom";
import styles from "./Dashboard.module.css";
import { LeaderboardEntry } from "@shared/models";

export default function Dashboard({ topThreeRacers }: { topThreeRacers?: LeaderboardEntry[] }) {
  const navigate = useNavigate();

  const MEDALS = ["🥇", "🥈", "🥉"];
  const BADGE_COLORS = ["gold", "silver", "bronze"];

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
      {/* Hero Section */}
      <PageHeader
        title="SEASON ONE WINTER 2026"
        subtitle="Races: 2 / 8 Completed"
        variant="hero"
        backgroundImage="/images/dashboard-hero.webp"
        action={
          <Button type="button" variant="primary" onClick={() => navigate("/leaderboard")}>
            View Standings
          </Button>
        }
      />

      {/* Quick Stats Section */}
      <section className={styles.dashboard__content}>
        <div className={styles.dashboard__stats}>
          <StatCard title="Current Leader" value={topRacers[0].name} />
          <StatCard title="Recent Race" value="Race 2: French Grand Prix" />
          <StatCard title="Next Race" value="Coming Soon" />
        </div>

        {/* Leaderboard Preview Section */}
        <div className={styles.dashboard__leaderboardPreview}>
          <h3 className={styles.dashboard__sectionTitle}>Top 3 Leaderboard</h3>
          <div className={styles.dashboard__leaderboardCards}>
            <LeaderboardHeader variant="dashboard" />
            {topRacers.map((racer) => (
              <div key={racer.position} className={styles.dashboard__leaderboardRow}>
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
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
