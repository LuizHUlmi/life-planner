/* src/components/layout/DefaultLayout.tsx */
import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import styles from "./DefaultLayout.module.css";
import { Menu } from "lucide-react"; // Importar ícone do menu

export function DefaultLayout() {
  // Estado inicial: No Desktop começa aberto (false), no Mobile começa fechado (true)
  // Mas para evitar erro de hidratação ou complexidade, podemos iniciar como true se a tela for pequena
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    // Verifica se estamos no browser e a largura da tela
    if (typeof window !== 'undefined') {
      return window.innerWidth <= 768; // Se for mobile, começa colapsado (true)
    }
    return false;
  });

  // Opcional: Listener para atualizar se o utilizador redimensionar a janela
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
         // Não forçamos o colapso aqui para não fechar na cara do utilizador se ele só virar o ecrã,
         // mas garante a lógica correta de layout.
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={styles.container}>
      {/* Botão Mobile para ABRIR a sidebar */}
      {isSidebarCollapsed && (
        <button 
          className={styles.mobileMenuBtn}
          onClick={() => setIsSidebarCollapsed(false)}
          aria-label="Abrir Menu"
        >
          <Menu size={24} />
        </button>
      )}

      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
      />
      
      <main className={`${styles.content} ${isSidebarCollapsed ? styles.contentCollapsed : ''}`}>
        <Outlet />
      </main>
    </div>
  );
}