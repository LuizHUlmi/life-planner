import { useNavigate, useLocation } from "react-router-dom";
import { Wallet, Dumbbell, PenLine, Utensils, Menu } from "lucide-react";
import styles from "./MobileNavbar.module.css";

interface MobileNavbarProps {
  onOpenMenu: () => void;
}

export function MobileNavbar({ onOpenMenu }: MobileNavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // Função inteligente de navegação com scroll
  const handleScrollTo = (hash: string) => {
    // Se já estiver no diário, apenas rola
    if (location.pathname === '/diario') {
      const element = document.getElementById(hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      // Se estiver noutra página, navega para o diário com o hash
      navigate(`/diario#${hash}`);
    }
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        
        {/* 1. Financeiro (Novo Foco em Input) */}
        <button 
          onClick={() => handleScrollTo('financeiro')} 
          className={styles.navItem}
        >
          <Wallet size={24} />
          <span>Gastos</span>
        </button>

        {/* 2. Treino (Âncora) */}
        <button 
          onClick={() => handleScrollTo('treino')} 
          className={styles.navItem}
        >
          <Dumbbell size={24} />
          <span>Treino</span>
        </button>

        {/* 3. Diário (Topo - Métricas) */}
        <button 
          onClick={() => handleScrollTo('metrics')} // Topo da página
          className={styles.navItem}
        >
          <div className={styles.navItemHighlight}>
            <PenLine size={24} />
          </div>
        </button>

        {/* 4. Nutrição (Âncora) */}
        <button 
          onClick={() => handleScrollTo('nutricao')} 
          className={styles.navItem}
        >
          <Utensils size={24} />
          <span>Dieta</span>
        </button>

        {/* 5. Menu (Abre Dashboard, Configs, etc) */}
        <button onClick={onOpenMenu} className={styles.navItem}>
          <Menu size={24} />
          <span>Menu</span>
        </button>

      </div>
    </nav>
  );
}