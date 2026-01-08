import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { MobileNavbar } from "./MobileNavbar"; // Importe o novo componente
import styles from "./DefaultLayout.module.css";

export function DefaultLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Desktop: Aberto por padrão
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  // Detecta se é mobile
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      // Se virou desktop, garante que a sidebar abre
      if (!mobile) setIsSidebarOpen(false); 
      // Se virou mobile, garante que a sidebar começa fechada
      if (mobile) setIsSidebarOpen(true); // true aqui significa "Colapsado/Fechado" na lógica invertida do seu Sidebar.tsx?
      // Nota: No seu Sidebar.tsx, isCollapsed=true significa FECHADO.
    };

    handleResize(); // Executa ao iniciar
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fecha o "Menu Gaveta" automaticamente ao navegar no mobile
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(true); // Fecha a sidebar (colapsa) ao mudar de rota
    }
  }, [location, isMobile]);

  return (
    <div className={styles.container}>
      
      {/* SIDEBAR (Funciona como Menu Lateral no Desktop e Gaveta no Mobile) 
         Passamos a função para fechar (toggle)
      */}
      <Sidebar 
        isCollapsed={isSidebarOpen} 
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
      />

      {/* CONTEÚDO PRINCIPAL */}
      <main className={`${styles.content} ${isSidebarOpen ? styles.contentCollapsed : ''}`}>
        <Outlet />
        {/* Espaço extra no final para o conteúdo não ficar escondido atrás da navbar mobile */}
        <div className={styles.mobileSpacer}></div>
      </main>

      {/* BARRA INFERIOR (Só aparece no mobile via CSS) */}
      <MobileNavbar onOpenMenu={() => setIsSidebarOpen(false)} /> {/* False = Abrir Sidebar */}
      
    </div>
  );
}