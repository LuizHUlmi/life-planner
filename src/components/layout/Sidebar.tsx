
import { NavLink, useNavigate } from "react-router-dom";
import styles from "./Sidebar.module.css";

import {
  LayoutDashboard,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Book,        // Para o Diário
  CheckSquare, // Para Tarefas
  Settings,    // Para Configurações
  User,
  Flower2,      // Logo
  Scale,
  Dumbbell,
  FlaskConical,
  Syringe,
  Utensils,
  Box,
  ShoppingCart,
  Wallet,
  Package,
  Repeat
} from "lucide-react";


interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

export function Sidebar({ isCollapsed, toggleSidebar }: SidebarProps) {
  const navigate = useNavigate();
  
  // Como é pessoal, não precisamos de complexidade aqui.
  // Futuramente pegaremos seu nome do banco, mas por hora:
  const userName = "Luiz"; 

  const handleSignOut = async () => {
  // await supabase.auth.signOut(); // Comentado
  console.log("Logout clicado (simulação)");
  navigate("/");
};

  return (
    <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ""}`}>
      
      {/* Botão de Colapso */}
      <button
        onClick={toggleSidebar}
        className={styles.toggleButton}
        title={isCollapsed ? "Expandir" : "Recolher"}
      >
        {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>

      {/* Header / Logo */}
      <div className={styles.header}>
        <div className={styles.logoContainer}>
          <Flower2 size={28} color="var(--primary)" />
          {!isCollapsed && <span>Life Planner</span>}
        </div>
      </div>

      {/* Navegação Principal */}
      <nav className={styles.nav}>
        
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `${styles.navItem} ${isActive ? styles.active : ""}`
          }
          title="Visão Geral"
          end
        >
          <div className={styles.iconContainer}>
            <LayoutDashboard />
          </div>
          {!isCollapsed && <span>Dashboard</span>}
        </NavLink>

        <NavLink
          to="/diario"
          className={({ isActive }) =>
            `${styles.navItem} ${isActive ? styles.active : ""}`
          }
          title="Meu Diário"
        >
          <div className={styles.iconContainer}>
            <Book />
          </div>
          {!isCollapsed && <span>Diário</span>}
        </NavLink>

        <NavLink
          to="/biometria"
          className={({ isActive }) =>
            `${styles.navItem} ${isActive ? styles.active : ""}`
          }
          title="Biometria"
        >
          <div className={styles.iconContainer}>
            <Scale />
          </div>
          {!isCollapsed && <span>Biometria</span>}
        </NavLink>
        <NavLink
          to="/treino"
          className={({ isActive }) =>
            `${styles.navItem} ${isActive ? styles.active : ""}`
          }
          title="Treino"
        >
          <div className={styles.iconContainer}>
            <Dumbbell />
          </div>
          {!isCollapsed && <span>Treino</span>}
        </NavLink>
        <NavLink
          to="/exames"
          className={({ isActive }) =>
            `${styles.navItem} ${isActive ? styles.active : ""}`
          }
          title="Exames"
        >
          <div className={styles.iconContainer}>
            <FlaskConical />
          </div>
          {!isCollapsed && <span>Exames</span>}
        </NavLink>

        <NavLink
          to="/farmacos"
          className={({ isActive }) =>
            `${styles.navItem} ${isActive ? styles.active : ""}`
          }
          title="Farmacologia"
        >
          <div className={styles.iconContainer}>
            <Syringe />
          </div>
          {!isCollapsed && <span>Fármacos</span>}
        </NavLink>
        <NavLink
          to="/nutricao"
          className={({ isActive }) =>
            `${styles.navItem} ${isActive ? styles.active : ""}`
          }
          title="Nutrição"
        >
          <div className={styles.iconContainer}>
            <Utensils />
          </div>
          {!isCollapsed && <span>Nutrição</span>}
        </NavLink>
        <NavLink
          to="/patrimonio"
          className={({ isActive }) =>
            `${styles.navItem} ${isActive ? styles.active : ""}`
          }
          title="Patrimônio"
        >
          <div className={styles.iconContainer}>
            <Box />
          </div>
          {!isCollapsed && <span>Bens & Ativos</span>}
        </NavLink>
        <NavLink
          to="/compras"
          className={({ isActive }) =>
            `${styles.navItem} ${isActive ? styles.active : ""}`
          }
          title="Compras"
        >
          <div className={styles.iconContainer}>
            <ShoppingCart />
          </div>
          {!isCollapsed && <span>Compras</span>}
        </NavLink>

        <NavLink
          to="/orcamento"
          className={({ isActive }) =>
            `${styles.navItem} ${isActive ? styles.active : ""}`
          }
          title="Orçamento"
        >
          <div className={styles.iconContainer}>
            <Wallet />
          </div>
          {!isCollapsed && <span>Orçamento</span>}
        </NavLink>

        <NavLink
          to="/inventario"
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ""}`}
          title="Inventário"
        >
          <div className={styles.iconContainer}>
            <Package />
          </div>
          {!isCollapsed && <span>Inventário</span>}
        </NavLink>

        <NavLink
          to="/rotina"
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ""}`}
          title="Rotina"
        >
          <div className={styles.iconContainer}>
            <Repeat />
          </div>
          {!isCollapsed && <span>Rotina</span>}
        </NavLink>

        <NavLink
          to="/tarefas"
          className={({ isActive }) =>
            `${styles.navItem} ${isActive ? styles.active : ""}`
          }
          title="Tarefas"
        >
          <div className={styles.iconContainer}>
            <CheckSquare />
          </div>
          {!isCollapsed && <span>Tarefas</span>}
        </NavLink>

        {!isCollapsed && <div className={styles.divider}></div>}

        <NavLink
          to="/configuracoes"
          className={({ isActive }) =>
            `${styles.navItem} ${isActive ? styles.active : ""}`
          }
          title="Configurações"
        >
          <div className={styles.iconContainer}>
            <Settings />
          </div>
          {!isCollapsed && <span>Ajustes</span>}
        </NavLink>

      </nav>

      {/* Footer Simples (Só você) */}
      <div className={styles.footer}>
        <div className={styles.userSection}>
          <div className={styles.userAvatar}>
            <User size={18} />
          </div>
          {!isCollapsed && (
            <div className={styles.userInfo}>
              <span className={styles.userName}>{userName}</span>
            </div>
          )}
        </div>

        <button onClick={handleSignOut} className={styles.logoutButton} title="Sair">
          <LogOut size={20} />
        </button>
      </div>
    </aside>
  );
}