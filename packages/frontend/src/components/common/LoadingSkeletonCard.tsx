import styles from "./LoadingSkeletonCard.module.css";

export interface LoadingSkeletonCardProps {
  lines?: number;
  height?: string;
  maxWidth?: string;
  includeTitle?: boolean;
  includeText?: boolean;
  testId?: string;
}

export default function LoadingSkeletonCard({
  lines = 3,
  height = "200px",
  maxWidth = "100%",
  includeTitle = true,
  includeText = true,
  testId = "loading-skeleton",
}: LoadingSkeletonCardProps) {
  return (
    <div
      className={styles.skeletonCard}
      style={{ height, maxWidth }}
      data-testid={testId}
      role="img"
      aria-label="Loading content"
    >
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
