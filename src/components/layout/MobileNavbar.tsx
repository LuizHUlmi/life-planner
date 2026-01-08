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

        {/* 2. Treino */}
        <NavLink 
          to="/treino" 
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
        >
          <Dumbbell size={24} />
          <span>Treino</span>
        </NavLink>

        {/* 3. Diário (Botão Central) */}
        <NavLink 
          to="/diario" 
          className={styles.navItem}
        >
          <div className={styles.navItemHighlight}>
            <PenLine size={24} />
          </div>
        </NavLink>

        {/* 4. Nutrição */}
        <NavLink 
          to="/nutricao" 
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
        >
          <Utensils size={24} />
          <span>Dieta</span>
        </NavLink>

        {/* 5. Menu (Abre a Sidebar Lateral) */}
        <button onClick={onOpenMenu} className={styles.navItem}>
          <Menu size={24} />
          <span>Menu</span>
        </button>

      </div>
    </nav>
  );
}