import { type InputHTMLAttributes, forwardRef } from 'react';
import styles from './Slider.module.css';

interface SliderProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  minLabel?: string; // Legenda da esquerda (ex: Péssimo)
  maxLabel?: string; // Legenda da direita (ex: Ótimo)
  valueDisplay?: string | number; // Para mostrar o valor atual no topo
}

export const Slider = forwardRef<HTMLInputElement, SliderProps>(
  ({ label, minLabel, maxLabel, valueDisplay, className, ...props }, ref) => {
    return (
      <div className={`${styles.container} ${className || ''}`}>
        <div className={styles.header}>
          <label className={styles.label}>{label}</label>
          {/* Mostra o valor atual se passado */}
          {valueDisplay !== undefined && (
            <span className={styles.value}>{valueDisplay}</span>
          )}
        </div>
        
        <input 
          type="range" 
          ref={ref} 
          className={styles.inputRange} 
          {...props} 
        />

        {/* Legendas das pontas (ex: 1 = Ruim, 5 = Bom) */}
        {(minLabel || maxLabel) && (
          <div className={styles.legends}>
            <span>{minLabel}</span>
            <span>{maxLabel}</span>
          </div>
        )}
      </div>
    );
  }
);

Slider.displayName = 'Slider';