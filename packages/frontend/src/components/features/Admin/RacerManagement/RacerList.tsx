import { Racer } from "shared";
import { Button, LoadingSkeletonCard } from "../../../common";
import styles from "../RacerManagementTab.module.css";

interface RacerListProps {
  racers: Racer[];
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
  onEdit: (racer: Racer) => void;
  onDelete: (racer: Racer) => void;
}

export function RacerList({
  racers,
  isLoading,
  error,
  onRefresh,
  onEdit,
  onDelete,
}: RacerListProps) {
  return (
    <div className={styles.listSection}>
      <div className={styles.listHeader}>
        <h2 className={styles.title}>All Racers</h2>
        <Button
          type="button"
          variant="secondary"
          onClick={onRefresh}
          disabled={isLoading}
        >
          Refresh
        </Button>
      </div>

      {error && <p className={styles.listError}>{error}</p>}

      {isLoading ? (
        <LoadingSkeletonCard includeTitle={false} maxWidth="100%" testId="racer-list-loading" />
      ) : (
        <div className={styles.tableWrapper}>
          {racers.length === 0 ? (
            <p className={styles.emptyState}>No racers found. Create one below.</p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Team</th>
                  <th>Nationality</th>
                  <th>Age</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {racers.map((racer) => (
                  <tr key={racer.id}>
                    <td>
                      <div className={styles.racerNameCell}>
                        <span
                          className={styles.teamColorDot}
                          style={{ backgroundColor: racer.teamColor }}
                          aria-hidden="true"
                        />
                        {racer.name}
                      </div>
                    </td>
                    <td>{racer.team}</td>
                    <td>{racer.nationality}</td>
                    <td>{racer.age}</td>
                    <td>
                      <span
                        className={`${styles.badge} ${racer.active ? styles["badge--active"] : styles["badge--inactive"]}`}
                      >
                        {racer.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => onEdit(racer)}
                        >
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="danger"
                          onClick={() => onDelete(racer)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
