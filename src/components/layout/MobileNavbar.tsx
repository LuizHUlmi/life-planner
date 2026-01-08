import { NavLink } from "react-router-dom";
import { LayoutDashboard, Dumbbell, PenLine, Utensils, Menu } from "lucide-react";
import styles from "./MobileNavbar.module.css";

interface MobileNavbarProps {
  onOpenMenu: () => void;
}

export function MobileNavbar({ onOpenMenu }: MobileNavbarProps) {
  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        
        {/* 1. Home */}
        <NavLink 
          to="/dashboard" 
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
        >
          <LayoutDashboard size={24} />
          <span>Início</span>
        </NavLink>

        {/* 2. Treino (Piloto) */}
        <NavLink 
          to="/treino" // Ou direto para execução se preferir
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
        >
          <Dumbbell size={24} />
          <span>Treino</span>
        </NavLink>

        {/* 3. Diário (DESTAQUE CENTRAL) */}
        <NavLink 
          to="/diario" 
          className={({ }) => `${styles.navItem}`} // Removemos active padrão p/ controlar estilo
        >
          <div className={styles.navItemHighlight}>
            <PenLine size={24} />
          </div>
          {/* Sem texto para manter limpo, ou opcional */}
        </NavLink>

        {/* 4. Nutrição */}
        <NavLink 
          to="/nutricao" 
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
        >
          <Utensils size={24} />
          <span>Dieta</span>
        </NavLink>

        {/* 5. Menu (Abre a Sidebar antiga como Drawer) */}
        <button onClick={onOpenMenu} className={styles.navItem} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <Menu size={24} />
          <span>Menu</span>
        </button>

      </div>
    </nav>
  );
}