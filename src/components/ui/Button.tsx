import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import styles from './Button.module.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
  fullWidth?: boolean;
}

export function Button({ 
  children, 
  variant = 'primary', 
  isLoading = false,
  fullWidth = false,
  className,
  disabled,
  ...props 
}: ButtonProps) {

  // Monta a lista de classes baseada nas props
  const classes = [
    styles.button,
    styles[variant], // seleciona .primary, .secondary ou .danger
    fullWidth ? styles.fullWidth : '',
    className || ''
  ].join(' ');

  return (
    <button 
      className={classes}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? 'Carregando...' : children}
    </button>
  );
}