import { Card } from "../../common/Card";
import styles from "./StatCard.module.css";

export interface StatCardProps {
  title: string;
  value?: string | number;
  icon?: React.ReactNode;
  onClick?: () => void;
  compact?: boolean;
}

export default function StatCard({ title, value, icon, onClick, compact = true }: StatCardProps) {
  return (
    <Card variant={compact ? "compact" : "default"} onClick={onClick} className={styles.statCard}>
      {icon && <div className={styles.statCard__icon}>{icon}</div>}
      <div className={styles.statCard__content}>
        <h3 className={styles.statCard__title}>{title}</h3>
        {value && <p className={styles.statCard__value}>{value}</p>}
      </div>
    </Card>
  );
}
