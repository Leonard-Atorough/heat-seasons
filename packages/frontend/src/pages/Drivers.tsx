import { DriverCard } from "../components/features/Racer";
import styles from "./Drivers.module.css";
import { RacerWithStats } from "@shared/index";
import { useEffect, useMemo, useState } from "react";
import apiClient from "../services/apiClient";

export default function Drivers() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [drivers, setDrivers] = useState<RacerWithStats[]>([]);

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const response = await apiClient.get<RacerWithStats[]>("/racers");
        console.log("API response:", response);
        setDrivers(response);
      } catch (error) {
        console.error("Error fetching drivers:", error);
        setError(error instanceof Error ? error : new Error("Unknown error"));
      } finally {
        setLoading(false);
      }
    };
    fetchDrivers();
  }, []);
  console.log("Fetched drivers:", drivers);
  // Derive the transformed racers instead of storing in state
  // This ensures the data is always in sync with the source
  const racers = useMemo(() => {
    if (!drivers) return [];
    return drivers
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
