import { Button } from "../components/common/Button";
import { PageHeader } from "../components/common/PageHeader";
import { StatCard } from "../components/features/Dashboard";
import { LeaderboardHeader } from "../components/features/Leaderboard";
import { useNavigate } from "react-router-dom";
import styles from "./Dashboard.module.css";

export default function Dashboard() {
  const navigate = useNavigate();

  const topRacers = [
    {
      position: 1,
      name: "John Doe",
      team: "Muckleren",
      races: 5,
      points: 95,
      medal: "🥇",
      badgeColor: "gold",
    },
    {
      position: 2,
      name: "Jane Smith",
      team: "Blue Bull",
      races: 5,
      points: 88,
      medal: "🥈",
      badgeColor: "silver",
    },
    {
      position: 3,
      name: "Bob Wilson",
      team: "Terrari",
      races: 4,
      points: 82,
      medal: "🥉",
      badgeColor: "bronze",
    },
  ];

  return (
    <div className={styles.dashboard}>
      {/* Hero Section */}
      <PageHeader
        title="SEASON ONE WINTER 2026"
        subtitle="Races: 5 / 12"
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
          <StatCard title="Current Leader" />
          <StatCard title="Recent Race" />
          <StatCard title="Next Race" />
        </div>

        {/* Leaderboard Preview Section */}
        <div className={styles.dashboard__leaderboardPreview}>
          <h3 className={styles.dashboard__sectionTitle}>Top 3 Leaderboard</h3>
          <div className={styles.dashboard__leaderboardCards}>
            <LeaderboardHeader />
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
