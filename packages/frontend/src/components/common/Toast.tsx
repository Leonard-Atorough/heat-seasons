import styles from "./Toast.module.css";

export interface ToastProps {
  message: string;
  type?: "success" | "error" | "info" | "warning";
  onClose?: () => void;
}

export default function Toast({ message, type = "info", onClose }: ToastProps) {
  return (
    <div className={`${styles.toast} ${styles[type]}`}>
      <span>{message}</span>
      {onClose && (
        <button
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
      )}
    </div>
  );
}
