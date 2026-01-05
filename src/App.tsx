import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Diario } from './pages/Diario';
import { DefaultLayout } from './components/layout/DefaultLayout';
import { Biometria } from './pages/Biometria';
import { Treino } from './pages/Treino';
import { Exames } from './pages/Exames';
import { Farmacos } from './pages/Farmacos';
import { Nutricao } from './pages/Nutricao';
import { Patrimonio } from './pages/Patrimonio';
import { Compras } from './pages/Compras';
import { Tarefas } from './pages/Tarefas';
import { Orcamento } from './pages/Orcamento';
import { Configuracoes } from './pages/Configuracoes';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route element={<DefaultLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/diario" element={<Diario />} />
          <Route path="/biometria" element={<Biometria />} />
          <Route path="/treino" element={<Treino />} />
          <Route path="/exames" element={<Exames />} />
          <Route path="/farmacos" element={<Farmacos />} />
          <Route path="/nutricao" element={<Nutricao />} />
          <Route path="/patrimonio" element={<Patrimonio />} />
          <Route path="/compras" element={<Compras />} />
          <Route path="/tarefas" element={<Tarefas />} />
          <Route path="/orcamento" element={<Orcamento />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;