import { PageHeader } from "../components/common/PageHeader";
import { LeaderboardRow, LeaderboardHeader } from "../components/features/Leaderboard";
import styles from "./Leaderboard.module.css";

export default function Leaderboard() {
  const racers = [
    { position: 1, name: "John Doe", team: "Muckleren", points: 95, races: 5 },
    { position: 2, name: "Jane Smith", team: "Blue Bull", points: 88, races: 5 },
    { position: 3, name: "Bob Wilson", team: "Terrari", points: 82, races: 4 },
    { position: 4, name: "Alice Johnson", team: "Speed Kings", points: 76, races: 5 },
    { position: 5, name: "Charlie Brown", team: "Thunder", points: 71, races: 5 },
    { position: 6, name: "Diana Prince", team: "Warriors", points: 68, races: 4 },
    { position: 7, name: "Ethan Hunt", team: "Phoenix", points: 62, races: 5 },
    { position: 8, name: "Fiona Apple", team: "Velocity", points: 58, races: 4 },
    { position: 9, name: "George Martin", team: "Dragons", points: 52, races: 3 },
  ];

  return (
    <div className={styles.leaderboard}>
      <PageHeader
        title="Winter 2026 Leaderboard"
        subtitle="Season 1 • 5 of 12 Races Complete"
        variant="default"
      />

      <div className={styles.leaderboard__content}>
        <div className={styles.leaderboard__cards}>
          <LeaderboardHeader />
          {racers.map((racer) => (
            <LeaderboardRow key={racer.position} racer={racer} />
          ))}
        </div>
      </div>
    </div>
  );
}
