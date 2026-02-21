import styles from "./FormGroup.module.css";

type FormGroupProps = {
  element: string;
  type?: string;
  label: string;
  id?: string;
  name?: string;
  children?: React.ReactNode;
  className?: string;
  placeholder?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
};

export default function FormGroup({
  element,
  type,
  label,
  id,
  name,
  children,
  className,
  placeholder,
  value,
  onChange,
}: FormGroupProps) {
  switch (element) {
    case "input":
      return (
        <div className={`${styles.formGroup} ${className || ""}`}>
          <label className={styles.formGroup__label} htmlFor={id}>
            {label}
          </label>
          <input
            type={type}
            id={id}
            name={id}
            className={`${styles.formGroup__input} ${className || ""}`}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
          />
        </div>
      );
    case "textarea":
      return (
        <div className={`${styles.formGroup} ${className || ""}`}>
          <label className={styles.formGroup__label} htmlFor={id}>
            {label}
          </label>
          <textarea
            id={id}
            name={id}
            className={`${styles.formGroup__textarea} ${className || ""}`}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
          />
        </div>
      );
    default:
      return (
        <div className={`${styles.formGroup} ${className || ""}`}>
          <label className={styles.formGroup__label} htmlFor={id}>
            {label}
          </label>
          {children}
        </div>
      );
  }
}
