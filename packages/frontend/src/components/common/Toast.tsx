import { ReactNode } from "react";
import styles from "./Toast.module.css";

export interface ToastProps {
  title: string;
  message: string;
  type?: "success" | "error" | "info" | "warning";
  onClose?: () => void;
  variant?: "informational" | "actionable";
  action?: ReactNode; // For actionable toasts, e.g. a Retry button
}

export default function Toast({
  title,
  message,
  type = "info",
  onClose,
  variant = "informational",
  action,
}: ToastProps) {
  return (
    <div
      className={`${styles.toast} ${styles[type]}`}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      tabIndex={0}
      data-testid={`toast-root-${variant}`}
    >
      <div className={styles.toast__header}>
        <strong className={styles.toast__title}>{title}</strong>
        {onClose && (
          <button className={styles.closeButton} onClick={onClose} aria-label="Close" type="button">
            &times;
          </button>
        )}
      </div>
      <div className={styles.toast__body} aria-label={message} role="region">
        <span>{message}</span>
      </div>
      <div className={styles.toast__actions} aria-label="Actions" role="region">
        {variant === "actionable" && action}
      </div>
    </div>
  );
}
