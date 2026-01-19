import { DriverCard } from "../components/features/Racer";
import styles from "./Drivers.module.css";
import useFetch from "../hooks/useFetch";
import { ApiResponse, RacerWithStats } from "@shared/index";
import { useMemo } from "react";
import { config } from "../config";

export default function Drivers() {
  const { data: drivers, error, loading } = useFetch<ApiResponse<RacerWithStats[]>>(config.racerRoute);

  // Derive the transformed racers instead of storing in state
  const racers = useMemo(() => {
    if (!drivers) return [];
    return drivers.data.map((driver) => ({
      ...driver,
      profileUrl: driver.profileUrl || "https://avatar.iran.liara.run/public/1",
    }));
  }, [drivers]);

  if (loading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <h1>Drivers</h1>
      <div className={styles.driversGrid}>
        {racers.map((racer) => (
          <DriverCard key={racer.id} racer={racer} />
        ))}
        {/* <DriverCard
          racer={ {
            id: "1",
            name: "Speedy Gonzales",
            team: "Mexico",
            stats: { totalPoints: 100, totalRaces: 0, wins: 0, podiums: 0, avgPosition: 0 },
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
        /> */}
      </div>
    </div>
  );
}
