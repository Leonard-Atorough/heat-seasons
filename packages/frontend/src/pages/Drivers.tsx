import { RacerCard } from "../components/features/Racer";
import styles from "./Drivers.module.css";

export default function Drivers() {
  return (
    <div>
      <h1>Drivers</h1>
      <div className={styles.driversGrid}>
        <RacerCard
          racer={{
            id: "1",
            name: "Speedy Gonzales",
            team: "Mexico",
            points: 100,
            profileUrl: "https://avatar.iran.liara.run/public/1",
            badgeUrl: "",
            teamColor: "#00482C",
          }}
        />
        <RacerCard
          racer={{
            id: "2",
            name: "The Flash",
            team: "USA",
            points: 95,
            profileUrl: "https://avatar.iran.liara.run/public/2",
            badgeUrl: "",
            teamColor: "#863400",
          }}
        />
        <RacerCard
          racer={{
            id: "3",
            name: "Lightning McQueen",
            team: "USA",
            points: 90,
            profileUrl: "https://avatar.iran.liara.run/public/3",
            badgeUrl: "",
            teamColor: "#710006",
          }}
        />
        <RacerCard
          racer={{
            id: "4",
            name: "Sonic the Hedgehog",
            team: "Japan",
            points: 85,
            profileUrl: "https://avatar.iran.liara.run/public/4",
            badgeUrl: "",
            teamColor: "#000681",
          }}
        />
        <RacerCard
          racer={{
            id: "5",
            name: "Turbo Turtle",
            team: "Italy",
            points: 80,
            profileUrl: "https://avatar.iran.liara.run/public/5",
            badgeUrl: "",
            teamColor: "#008000",
          }}
        />
      </div>
    </div>
  );
}
