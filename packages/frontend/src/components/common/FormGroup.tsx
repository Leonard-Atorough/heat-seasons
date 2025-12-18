import styles from "./FormGroup.module.css";

export default function FormGroup({
  element,
  type,
  label,
  id,
  children,
}: {
  element: string;
  type?: string;
  label: string;
  id?: string;
  children?: React.ReactNode;
}) {
  switch (element) {
    case "input":
      return (
        <div className={styles.formGroup}>
          <label className={styles.formGroup__label} htmlFor={id}>
            {label}
          </label>
          <input type={type} id={id} name={id} className={styles.formGroup__input} />
        </div>
      );
    case "textarea":
      return (
        <div className={styles.formGroup}>
          <label className={styles.formGroup__label} htmlFor={id}>
            {label}
          </label>
          <textarea id={id} name={id} className={styles.formGroup__textarea} />
        </div>
      );
    default:
      return (
        <div className={styles.formGroup}>
          <label className={styles.formGroup__label} htmlFor={id}>
            {label}
          </label>
          {children}
        </div>
      );
  }
}
