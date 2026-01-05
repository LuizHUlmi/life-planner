import { forwardRef, type SelectHTMLAttributes } from 'react';
import styles from './Select.module.css';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string; // <--- Adicionamos isso aqui manualmente
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className, placeholder, ...props }, ref) => {
    
    const selectClasses = [
      styles.selectField,
      error ? styles.inputError : '',
      className
    ].join(' ');

    return (
      <div className={styles.container}>
        {label && (
          <label htmlFor={props.id} className={styles.label}>
            {label}
          </label>
        )}
        
        <select ref={ref} className={selectClasses} {...props}>
          {/* O placeholder funciona como a opção padrão desabilitada */}
          <option value="" disabled hidden>
            {placeholder || "Selecione..."}
          </option>
          
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        {error && <span className={styles.errorText}>{error}</span>}
      </div>
    );
  }
);

Select.displayName = 'Select';