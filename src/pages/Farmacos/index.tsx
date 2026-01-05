import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Save, Plus, Trash2, Syringe, Pill } from 'lucide-react';

// Tipagem para os Hormônios
interface HormoneItem {
  id: number;
  substance: string;    // Nome do Hormônio
  totalDose: string;    // Dose Semanal Total
  app1: string;         // Aplicação 1
  app2: string;         // Aplicação 2
  app3: string;         // Aplicação 3
  app4: string;         // Aplicação 4
}

// Tipagem para os Manipulados
interface SupplementItem {
  id: number;
  compound: string;     // Composto
  dose: string;         // Dose
  time: string;         // Horário
  function: string;     // Função
}

export function Farmacos() {
  
  // Estado para Hormônios (Começa com 1 linha vazia)
  const [hormones, setHormones] = useState<HormoneItem[]>([
    { id: 1, substance: '', totalDose: '', app1: '', app2: '', app3: '', app4: '' }
  ]);

  // Estado para Manipulados (Começa com 1 linha vazia)
  const [supplements, setSupplements] = useState<SupplementItem[]>([
    { id: 1, compound: '', dose: '', time: '', function: '' }
  ]);

  // --- Handlers para Hormônios ---
  const addHormone = () => {
    const newId = hormones.length > 0 ? Math.max(...hormones.map(h => h.id)) + 1 : 1;
    setHormones([...hormones, { id: newId, substance: '', totalDose: '', app1: '', app2: '', app3: '', app4: '' }]);
  };

  const removeHormone = (id: number) => {
    if (hormones.length > 1) {
      setHormones(hormones.filter(h => h.id !== id));
    }
  };

  // --- Handlers para Manipulados ---
  const addSupplement = () => {
    const newId = supplements.length > 0 ? Math.max(...supplements.map(s => s.id)) + 1 : 1;
    setSupplements([...supplements, { id: newId, compound: '', dose: '', time: '', function: '' }]);
  };

  const removeSupplement = (id: number) => {
    if (supplements.length > 1) {
      setSupplements(supplements.filter(s => s.id !== id));
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
          Farmacologia
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Gestão de protocolo hormonal e suplementação.
        </p>
      </header>

      <form onSubmit={(e) => e.preventDefault()}>
        
        {/* --- SEÇÃO 1: HORMONAL --- */}
        <section style={{ marginBottom: '2rem' }}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Syringe color="var(--primary)" size={24} />
                <h2 style={{ fontSize: '1.2rem', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>
                  Protocolo Hormonal (Semanal)
                </h2>
              </div>
              <div style={{ width: '200px' }}>
                <Input type="date" label="Semana de:" defaultValue={new Date().toISOString().split('T')[0]} />
              </div>
            </div>

            {/* Cabeçalho Desktop */}
            <div className="desktop-headers" style={{ 
                display: 'grid', 
                gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 40px', 
                gap: '1rem',
                marginBottom: '0.5rem',
                padding: '0 0.5rem'
            }}>
               <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Hormônio</span>
               <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Dose Total</span>
               <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Aplic. 1</span>
               <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Aplic. 2</span>
               <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Aplic. 3</span>
               <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Aplic. 4</span>
            </div>

            <style>{`
              @media (max-width: 1023px) {
                .desktop-headers { display: none !important; }
                .hormone-row { display: flex; flex-direction: column; gap: 1rem; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem; marginBottom: 1rem; }
              }
              @media (min-width: 1024px) {
                .hormone-row { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr 40px; gap: 1rem; align-items: end; }
              }
            `}</style>

            {hormones.map((item) => (
              <div key={item.id} className="hormone-row">
                <Input placeholder="Ex: Enantato de Testo" defaultValue={item.substance} label="Hormônio (Mobile)" className="mobile-label-input" />
                <Input placeholder="Ex: 500mg" defaultValue={item.totalDose} label="Dose Total (Mobile)" />
                <Input placeholder="Seg" defaultValue={item.app1} label="Aplic 1 (Mobile)" />
                <Input placeholder="Qua" defaultValue={item.app2} label="Aplic 2 (Mobile)" />
                <Input placeholder="Sex" defaultValue={item.app3} label="Aplic 3 (Mobile)" />
                <Input placeholder="Dom" defaultValue={item.app4} label="Aplic 4 (Mobile)" />
                
                <button type="button" onClick={() => removeHormone(item.id)} style={{ border: 'none', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.5rem' }}>
                  <Trash2 size={18} className="hover:text-red-500" />
                </button>
              </div>
            ))}

            <div style={{ marginTop: '1rem' }}>
              <Button type="button" variant="secondary" onClick={addHormone} style={{ borderStyle: 'dashed' }}>
                <Plus size={16} /> Adicionar Hormônio
              </Button>
            </div>
          </Card>
        </section>

        {/* --- SEÇÃO 2: MANIPULADOS --- */}
        <section>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              <Pill color="var(--primary)" size={24} />
              <h2 style={{ fontSize: '1.2rem', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>
                Manipulados & Fitoterápicos
              </h2>
            </div>

            {/* Cabeçalho Desktop */}
            <div className="desktop-headers-supp" style={{ 
                display: 'grid', 
                gridTemplateColumns: '2fr 1fr 1fr 2fr 40px', 
                gap: '1rem',
                marginBottom: '0.5rem',
                padding: '0 0.5rem'
            }}>
               <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Composto</span>
               <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Dose</span>
               <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Horário</span>
               <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Função</span>
            </div>

            <style>{`
              @media (max-width: 1023px) {
                .desktop-headers-supp { display: none !important; }
                .supp-row { display: flex; flex-direction: column; gap: 1rem; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem; marginBottom: 1rem; }
              }
              @media (min-width: 1024px) {
                .supp-row { display: grid; grid-template-columns: 2fr 1fr 1fr 2fr 40px; gap: 1rem; align-items: end; }
              }
            `}</style>

            {supplements.map((item) => (
              <div key={item.id} className="supp-row">
                <Input placeholder="Ex: Creatina" defaultValue={item.compound} label="Composto" />
                <Input placeholder="Ex: 5g" defaultValue={item.dose} label="Dose" />
                <Input type="time" defaultValue={item.time} label="Horário" />
                <Input placeholder="Ex: Força/Cognição" defaultValue={item.function} label="Função" />
                
                <button type="button" onClick={() => removeSupplement(item.id)} style={{ border: 'none', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.5rem' }}>
                  <Trash2 size={18} className="hover:text-red-500" />
                </button>
              </div>
            ))}

            <div style={{ marginTop: '1rem' }}>
              <Button type="button" variant="secondary" onClick={addSupplement} style={{ borderStyle: 'dashed' }}>
                <Plus size={16} /> Adicionar Item
              </Button>
            </div>
          </Card>
        </section>

        {/* Botão Salvar Geral */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
          <Button type="submit" variant="primary" style={{ paddingLeft: '2rem', paddingRight: '2rem' }}>
            <Save size={18} />
            Salvar Protocolo
          </Button>
        </div>

      </form>
    </div>
  );
}