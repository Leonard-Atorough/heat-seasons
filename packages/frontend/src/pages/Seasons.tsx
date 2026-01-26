import { useMemo, useState } from "react";
import useFetch from "../hooks/useFetch";
import { config } from "../config";
import { ApiResponse, Season } from "@shared/models";
import { Card } from "../components/common/Card";
import styles from "./Seasons.module.css";

export default function Seasons() {
  const { data, error, loading } = useFetch<ApiResponse<Season[]>>(config.seasonRoute);
  const [seasons, setSeasons] = useState<Season[]>([]);

  useMemo(() => {
    if (!data) return [];
    data.data.sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
    setSeasons(data.data);
  }, [data]);

  if (loading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Error: {error.message}</div>;
  }
  return (
    <div>
      <h1>Seasons</h1>
      <div>
        {seasons.map((season) => (
          <Card key={season.id} className={styles.seasonCard}>
            <h2>{season.name}</h2>
            <p>Start Date: {new Date(season.startDate).toDateString()}</p>
            <p>End Date: {season.endDate ? new Date(season.endDate).toDateString() : "Ongoing"}</p>
            <p>Status: {season.status}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
