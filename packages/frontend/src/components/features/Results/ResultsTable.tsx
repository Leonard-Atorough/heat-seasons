import { RaceResult } from "shared";
import { LoadingSkeletonCard } from "../../common";
import styles from "./ResultsTable.module.css";

export interface ResultsTableProps {
  results: RaceResult[];
  racersMap: Map<string, { name: string; team: string }>;
  isLoading: boolean;
  error: string | null;
  // TODO: Remove sort function for now. Not really needed on small dataset.
  onSortBy?: (field: "position" | "racerId" | "points" | "constructorPoints") => void;
}

export default function ResultsTable({
  results,
  racersMap,
  isLoading,
  error,
  onSortBy,
}: ResultsTableProps) {
  if (isLoading) return <LoadingSkeletonCard />;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.tableContainer}>
      <table className={styles.resultsTable}>
        <thead>
          <tr>
            <th onClick={() => onSortBy?.("position")}>Position</th>
            <th onClick={() => onSortBy?.("racerId")}>Racer</th>
            <th>Team</th>
            <th onClick={() => onSortBy?.("points")}>Points</th>
            <th onClick={() => onSortBy?.("constructorPoints")}>Constructor Points</th>
          </tr>
        </thead>
        <tbody>
          {results.map((result) => {
            const racer = racersMap.get(result.racerId);
            return (
              <tr key={result.racerId}>
                <td>{result.position}</td>
                <td>{racer ? racer.name : "Unknown Racer"}</td>
                <td>{racer ? racer.team : "Unknown Team"}</td>
                <td>{result.points}</td>
                <td>{result.constructorPoints}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
