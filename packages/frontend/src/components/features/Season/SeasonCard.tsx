import { Card } from "../../common";
import { Season, User } from "shared";

import styles from "./SeasonCard.module.css";
import { Button } from "../../common";
import { useNavigate } from "react-router-dom";

export interface SeasonCardProps {
  season: Season;
  isJoined: boolean;
  participants?: Set<string>; // Set of racerIds for quick lookup
  canJoin: boolean;
  isJoining: boolean;
  isAdmin: boolean;
  isAuthenticated: boolean;
  user: User | null;
  handleJoin: (season: Season) => void;
  setEditingSeason: (season: Season) => void;
  handleDelete: (season: Season) => void;
}

const STATUS_LABELS: Record<string, string> = {
  upcoming: "Upcoming",
  active: "Active",
  completed: "Completed",
  archived: "Archived",
};

const JOINABLE_STATUSES = new Set(["upcoming", "active"]);

export function SeasonCard({
  season,
  isJoined,
  participants,
  canJoin,
  isJoining,
  isAdmin,
  isAuthenticated,
  user,
  handleJoin,
  setEditingSeason,
  handleDelete,
}: SeasonCardProps) {
  const navigate = useNavigate();
  const slug = season.name.toLowerCase().replace(/\s+/g, "-");
  return (
    <Card key={season.id} className={styles.seasonCard} onClick={() => navigate(`/seasons/${slug}`, { state: { season } })}>
      <div className={styles.seasonCard__header}>
        <h2 className={styles.seasonCard__name}>{season.name.toUpperCase()}</h2>
        <div className={styles.seasonCard__badges}>
          {isJoined && <span className={styles.joinedBadge}>✓ Joined</span>}
          <span className={`${styles.seasonStatus} ${styles[`seasonStatus--${season.status}`]}`}>
            {STATUS_LABELS[season.status] ?? season.status}
          </span>
        </div>
      </div>
      <span className={styles.seasonDetails}>
        <p>
          <strong>Start Date:</strong> {new Date(season.startDate).toDateString()}
        </p>
        <p>
          <strong>End Date:</strong>{" "}
          {season.endDate ? new Date(season.endDate).toDateString() : "Ongoing"}
        </p>
        {participants !== undefined && (
          <p>
            <strong>Participants:</strong> {participants.size}
          </p>
        )}
      </span>
      {/* Per-card actions — join for users, edit/delete for admins */}
      {(canJoin || isAdmin) && (
        <div className={styles.seasonCard__actions}>
          {canJoin && (
            <Button
              type="button"
              variant="secondary"
              onClick={() => handleJoin(season)}
              disabled={isJoining}
            >
              {isJoining ? "Joining..." : "Join Season"}
            </Button>
          )}
          {isAdmin && (
            <>
              <Button type="button" variant="secondary" onClick={() => setEditingSeason(season)}>
                Edit
              </Button>
              <Button type="button" variant="danger" onClick={() => handleDelete(season)}>
                Delete
              </Button>
            </>
          )}
        </div>
      )}
      {/* Nudge for authenticated users without a racer linked */}
      {isAuthenticated && !user?.racerId && JOINABLE_STATUSES.has(season.status) && (
        <p className={styles.seasonCard__racerHint}>
          <a href="/profile">Create a racer</a> to join this season.
        </p>
      )}
    </Card>
  );
}
