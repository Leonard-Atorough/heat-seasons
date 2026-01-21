import { DriverCard } from "../components/features/Racer";
import styles from "./Drivers.module.css";
import useFetch from "../hooks/useFetch";
import { ApiResponse, RacerWithStats } from "@shared/index";
import { useMemo } from "react";
import { config } from "../config";

export default function Drivers() {
  const {
    data: drivers,
    error,
    loading,
  } = useFetch<ApiResponse<RacerWithStats[]>>(config.racerRoute);

  // Derive the transformed racers instead of storing in state
  // This ensures the data is always in sync with the source
  const racers = useMemo(() => {
    if (!drivers) return [];
    return drivers.data
      .map((driver) => ({
        ...driver,
        profileUrl: driver.profileUrl || "https://avatar.iran.liara.run/public/1",
      }))
      .sort((a, b) => a.team.localeCompare(b.team));
  }, [drivers]);

  if (loading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className={styles.driversPage}>
      <h1>Drivers</h1>
      <div className={styles.driversGrid}>
        {racers.map((racer) => (
          <DriverCard key={racer.id} racer={racer} />
        ))}
      </div>
    </div>
  );
}
