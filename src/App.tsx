import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"; // Adicione Navigate
import { DefaultLayout } from "./components/layout/DefaultLayout";
import { AuthProvider, useAuth } from "./contexts/AuthContext"; // <--- Importe aqui


import { Login } from "./pages/Login"; // Vamos criar essa página já já
import { Dashboard } from "./pages/Dashboard";
import { Diario } from "./pages/Diario";
import { Treino } from "./pages/Treino";
import { Nutricao } from "./pages/Nutricao";
import { Exames } from "./pages/Exames";
import { Farmacos } from "./pages/Farmacos";
import { Biometria } from "./pages/Biometria";
import { Patrimonio } from "./pages/Patrimonio";
import { Compras } from "./pages/Compras";
import { Orcamento } from "./pages/Orcamento";
import { Tarefas } from "./pages/Tarefas";
import { Configuracoes } from "./pages/Configuracoes";
import { Inventario } from "./pages/Inventario";
import { Rotina } from "./pages/Rotina";

// Componente para proteger rotas privadas
function PrivateRoute({ children }: { children: JSX.Element }) {
  const { session } = useAuth();
  return session ? children : <Navigate to="/" />;
}

function App() {
  return (
    <AuthProvider> {/* <--- Envolve tudo */}
      <BrowserRouter>
        <Routes>
          {/* Rota Pública (Login) */}
          <Route path="/" element={<Login />} />

          {/* Rotas Protegidas (Layout Principal) */}
          <Route element={<PrivateRoute><DefaultLayout /></PrivateRoute>}>
             <Route path="/dashboard" element={<Dashboard />} />
             <Route path="/diario" element={<Diario />} />
             <Route path="/treino" element={<Treino />} />
             <Route path="/nutricao" element={<Nutricao />} />
             <Route path="/exames" element={<Exames />} />
             <Route path="/farmacos" element={<Farmacos />} />
             <Route path="/biometria" element={<Biometria />} />
             <Route path="/patrimonio" element={<Patrimonio />} />
             <Route path="/compras" element={<Compras />} />
             <Route path="/orcamento" element={<Orcamento />} />
             <Route path="/tarefas" element={<Tarefas />} />
             <Route path="/configuracoes" element={<Configuracoes />} />
             <Route path="/inventario" element={<Inventario />} />
             <Route path="/rotina" element={<Rotina />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;