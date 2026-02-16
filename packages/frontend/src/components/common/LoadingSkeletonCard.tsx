import styles from "./LoadingSkeletonCard.module.css";

interface LoadingSkeletonCardProps {
  lines?: number;
  height?: string;
  maxWidth?: string;
  includeTitle?: boolean;
  includeText?: boolean;
}

export default function LoadingSkeletonCard({
  lines = 3,
  height = "200px",
  maxWidth = "100%",
  includeTitle = true,
  includeText = true,
}: LoadingSkeletonCardProps) {
  return (
    <div className={styles.skeletonCard} style={{ height, maxWidth }}>
      <div className={styles.skeletonContent}>
        {includeTitle && <div className={styles.skeletonTitle} />}
        {includeText &&
          Array.from({ length: lines }).map((_, i) => (
            <div
              key={i}
              className={styles.skeletonText}
              style={{
                width: i === lines - 1 ? "80%" : "100%",
              }}
            />
          ))}
      </div>
    </div>
  );
}
