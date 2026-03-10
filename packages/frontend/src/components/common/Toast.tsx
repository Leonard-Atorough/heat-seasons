import { ReactNode } from "react";
import { Button } from "./Button";
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
          <Button
            type="button"
            variant="none"
            className={styles.closeButton}
            aria-label="Close"
            onClick={onClose}
          >
            &times;
          </Button>
        )}
      </div>
      <div className={styles.toast__body} aria-label={message} role="region">
        <span>{message.split("\n").map((line, index) => (
          <span key={index}>
            {line}
            <br />
          </span>
        ))}</span>
      </div>
      <div className={styles.toast__actions} aria-label="Actions" role="region">
        {variant === "actionable" && action}
      </div>
    </div>
  );
}
