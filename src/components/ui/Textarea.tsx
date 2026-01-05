import { forwardRef, type TextareaHTMLAttributes } from 'react';
import styles from './Textarea.module.css';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, ...props }, ref) => {
    
    const textareaClasses = [
      styles.textareaField,
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
        
        <textarea 
          ref={ref} 
          className={textareaClasses} 
          {...props} 
        />
        
        {error && <span className={styles.errorText}>{error}</span>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';