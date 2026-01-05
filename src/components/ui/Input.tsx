import { type InputHTMLAttributes, forwardRef } from 'react';
import styles from './Input.module.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

// forwardRef é necessário para que bibliotecas de formulário (como React Hook Form) funcionem depois
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => {
    
    // Combina classes de erro se houver erro
    const inputClasses = error 
      ? `${styles.inputField} ${styles.inputError}` 
      : styles.inputField;

    return (
      <div className={`${styles.container} ${className || ''}`}>
        {label && (
          <label htmlFor={props.id} className={styles.label}>
            {label}
          </label>
        )}
        
        <input 
          ref={ref} 
          className={inputClasses} 
          {...props} 
        />
        
        {error && <span className={styles.errorText}>{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';