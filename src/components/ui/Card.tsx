import type { ReactNode, HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  noPadding?: boolean; // Opção para remover o padding se precisar (ex: para imagens full-width)
}

export function Card({ children, style, className, noPadding = false, ...props }: CardProps) {
  return (
    <div
      {...props}
      className={className}
      style={{
        // --- Estética Base ---
        backgroundColor: '#ffffff',
        borderRadius: '12px', // Arredondamento moderno
        border: '1px solid #e2e8f0', // Borda cinza bem suave (Slate 200)
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)', // Sombra elegante e leve
        
        // --- Layout ---
        padding: noPadding ? '0' : '1.5rem', // Padding padrão confortável (24px)
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden', // Garante que nada saia das bordas arredondadas
        
        // --- Transição Suave ---
        transition: 'all 0.2s ease-in-out',
        
        // Permite sobrescrever estilos se passados via props
        ...style, 
      }}
    >
      {children}
    </div>
  );
}