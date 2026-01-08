import { forwardRef, type ReactNode, type HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  noPadding?: boolean; // Opção para remover o padding se precisar
}

// Usamos forwardRef para permitir que o componente aceite a prop 'ref'
export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, style, className, noPadding = false, ...props }, ref) => {
    return (
      <div
        ref={ref} // Aqui conectamos a referência recebida
        {...props}
        className={className}
        style={{
          // --- Estética Base ---
          backgroundColor: '#ffffff',
          borderRadius: '12px', // Arredondamento moderno
          border: '1px solid #e2e8f0', // Borda cinza bem suave (Slate 200)
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)', // Sombra elegante
          
          // --- Layout ---
          padding: noPadding ? '0' : '1.5rem', // Padding padrão confortável (24px)
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden', // Garante que nada saia das bordas arredondadas
          
          // --- Transição Suave ---
          transition: 'all 0.2s ease-in-out',
          
          // Permite sobrescrever estilos se passados via props (ex: className do CSS Module)
          ...style, 
        }}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';