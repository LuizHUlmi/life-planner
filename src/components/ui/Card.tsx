import type { ReactNode } from 'react';
import styles from './Card.module.css';

interface CardProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties; // Adicionamos suporte a estilos inline
}

export function Card({ children, className, style }: CardProps) {
  return (
    <div 
      className={`${styles.card} ${className || ''}`} 
      style={style}
    >
      {children}
    </div>
  );
}