import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { MobileNavbar } from "./MobileNavbar";
import styles from "./DefaultLayout.module.css";

export function DefaultLayout() {
  // Estado que controla se a Sidebar está "Recolhida/Fechada"
  // Desktop: false (Aberta) | Mobile: true (Fechada/Escondida)
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      
      // Se for mobile, garante que começa fechado (true)
      // Se for desktop, garante que começa aberto (false)
      setIsCollapsed(mobile ? true : false);
    };

    handleResize(); // Executa ao iniciar
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Ao mudar de página no mobile, fecha o menu gaveta automaticamente
  useEffect(() => {
    if (isMobile) {
      setIsCollapsed(true);
    }
  }, [location, isMobile]);

  return (
    <div className={styles.container}>
      
      {/* SIDEBAR 
          Desktop: Menu Lateral
          Mobile: Gaveta (só aparece se isCollapsed = false)
      */}
      <Sidebar 
        isCollapsed={isCollapsed} 
        toggleSidebar={() => setIsCollapsed(!isCollapsed)} 
      />

      {/* CONTEÚDO PRINCIPAL */}
      <main className={`${styles.content} ${isCollapsed ? styles.contentCollapsed : ''}`}>
        <Outlet />
        {/* Espaço extra no final para o conteúdo não ficar escondido atrás da navbar mobile */}
        <div className={styles.mobileSpacer}></div>
      </main>

      {/* BARRA INFERIOR (Só aparece no mobile via CSS) 
          O botão Menu chama setIsCollapsed(false) para mostrar a Sidebar
      */}
      <MobileNavbar onOpenMenu={() => setIsCollapsed(false)} />
      
    </div>
  );
}