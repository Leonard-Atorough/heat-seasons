import { forwardRef } from "react";
import styles from "./FormGroup.module.css";

export interface FormGroupProps {
  element: string;
  type?: string;
  label: string;
  id?: string;
  name?: string;
  children?: React.ReactNode;
  className?: string;
  placeholder?: string;
  value?: string | number;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  hint?: string;
  min?: number | string;
  max?: number | string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const FormGroup = forwardRef<HTMLInputElement | HTMLTextAreaElement, FormGroupProps>(
  function FormGroup(
    {
      element,
      type,
      label,
      id,
      name,
      children,
      className,
      placeholder,
      value,
      disabled,
      required,
      error,
      hint,
      min,
      max,
      onChange,
      onBlur,
    }: FormGroupProps,
    ref,
  ) {
    const errorId = error && id ? `${id}-error` : undefined;
    const hintId = hint && id ? `${id}-hint` : undefined;
    const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

    const labelNode = (
      <label className={styles.formGroup__label} htmlFor={id}>
        {label}
        {required && (
          <span className={styles.formGroup__required} aria-hidden="true">
            {" "}
            *
          </span>
        )}
      </label>
    );

    const hintNode = hint && (
      <span id={hintId} className={styles.formGroup__hint}>
        {hint}
      </span>
    );

    const errorNode = error && (
      <span id={errorId} className={styles.formGroup__error} role="alert" aria-live="polite">
        {error}
      </span>
    );

    switch (element) {
      case "input":
        return (
          <div className={`${styles.formGroup} ${className || ""}`}>
            {labelNode}
            {hintNode}
            <input
              type={type}
              id={id}
              name={name ?? id}
              className={`${styles.formGroup__input}${error ? ` ${styles["formGroup__input--error"]}` : ""}`}
              placeholder={placeholder}
              ref={ref as React.Ref<HTMLInputElement>}
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              disabled={disabled}
              required={required}
              aria-required={required ? "true" : undefined}
              aria-invalid={error ? "true" : undefined}
              aria-describedby={describedBy}
              min={min}
              max={max}
            />
            {errorNode}
          </div>
        );
      case "textarea":
        return (
          <div className={`${styles.formGroup} ${className || ""}`}>
            {labelNode}
            {hintNode}
            <textarea
              id={id}
              name={name ?? id}
              className={`${styles.formGroup__textarea}${error ? ` ${styles["formGroup__textarea--error"]}` : ""}`}
              placeholder={placeholder}
              ref={ref as React.Ref<HTMLTextAreaElement>}
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              disabled={disabled}
              required={required}
              aria-required={required ? "true" : undefined}
              aria-invalid={error ? "true" : undefined}
              aria-describedby={describedBy}
            />
            {errorNode}
          </div>
        );
      default:
        return (
          <div className={`${styles.formGroup} ${className || ""}`}>
            {labelNode}
            {hintNode}
            {children}
            {errorNode}
          </div>
        );
    }
  },
);

export default FormGroup;
