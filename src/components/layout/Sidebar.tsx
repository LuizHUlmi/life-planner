import { NavLink, useNavigate } from "react-router-dom";
import styles from "./Sidebar.module.css";
import {
  LayoutDashboard,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X, // <--- NOVO IMPORT: Ícone de fechar
  Book,
  CheckSquare,
  Settings,
  User,
  Flower2,
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
  
  const userName = "Luiz"; 

  const handleSignOut = async () => {
    // await supabase.auth.signOut(); 
    console.log("Logout clicado (simulação)");
    navigate("/");
  };

  // Função para fechar a sidebar automaticamente no mobile ao clicar num link
  const handleMobileLinkClick = () => {
    if (window.innerWidth <= 768) {
      toggleSidebar();
    }
  };

  return (
    <>
      {/* OVERLAY: Fundo escuro para mobile. Fecha o menu ao clicar fora. */}
      <div 
        className={`${styles.overlay} ${!isCollapsed ? styles.visible : ''}`} 
        onClick={toggleSidebar}
        aria-hidden="true"
      />

      <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ""}`}>
        
        {/* Botão de Colapso (Visível APENAS em Desktop via CSS) */}
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

          {/* BOTÃO FECHAR (Visível APENAS em Mobile via CSS) */}
          {!isCollapsed && (
            <button 
              className={styles.mobileCloseBtn} 
              onClick={toggleSidebar}
              title="Fechar Menu"
            >
              <X size={24} />
            </button>
          )}
        </div>

        {/* Navegação Principal */}
        <nav className={styles.nav}>
          
          <NavLink
            to="/dashboard"
            onClick={handleMobileLinkClick}
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
            onClick={handleMobileLinkClick}
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
            onClick={handleMobileLinkClick}
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
            onClick={handleMobileLinkClick}
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
            onClick={handleMobileLinkClick}
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
            onClick={handleMobileLinkClick}
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
            onClick={handleMobileLinkClick}
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
            onClick={handleMobileLinkClick}
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
            onClick={handleMobileLinkClick}
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
            onClick={handleMobileLinkClick}
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
            onClick={handleMobileLinkClick}
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
            onClick={handleMobileLinkClick}
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
            onClick={handleMobileLinkClick}
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
            onClick={handleMobileLinkClick}
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

        {/* Footer */}
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
    </>
  );
}