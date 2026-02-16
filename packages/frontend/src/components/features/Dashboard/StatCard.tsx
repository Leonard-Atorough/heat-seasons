import { Card } from "../../common/Card";
import styles from "./StatCard.module.css";

export interface StatCardProps {
  title: string;
  value?: string | number;
  icon?: React.ReactNode;
  onClick?: () => void;
  compact?: boolean;
  backgroundImage?: string;
}

export default function StatCard({
  title,
  value,
  icon,
  onClick,
  compact = true,
  backgroundImage,
}: StatCardProps) {
  return (
    <Card
      variant={compact ? "compact" : "default"}
      onClick={onClick}
      className={styles.statCard}
      style={
        backgroundImage
          ? {
              background: `url(${backgroundImage}) center center / cover no-repeat`,
              backgroundColor: "var(--card-dark-overlay)",
            }
          : undefined
      }
    >
      {icon && <div className={styles.statCard__icon}>{icon}</div>}
      <div
        className={styles.statCard__content}
        style={backgroundImage ? { backgroundColor: "rgba(0, 0, 0, 0.6)" } : undefined}
      >
        <h4 className={styles.statCard__title}>{title}</h4>
        {value && <p className={styles.statCard__value}>{value}</p>}
      </div>
    </Card>
  );
}
