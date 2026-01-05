import { useState } from "react";
import { Outlet } from "react-router-dom"; // Onde as páginas serão renderizadas
import { Sidebar } from "./Sidebar";
import styles from "./DefaultLayout.module.css";

export function DefaultLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className={styles.container}>
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
      />
      
      <main className={`${styles.content} ${isSidebarCollapsed ? styles.contentCollapsed : ''}`}>
        {/* O Outlet é onde o React Router joga o conteúdo da página atual (Dashboard, Diário, etc) */}
        <Outlet />
      </main>
    </div>
  );
}