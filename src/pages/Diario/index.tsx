import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Slider } from '../../components/ui/Slider';
import { Textarea } from '../../components/ui/Textarea';
import { Save } from 'lucide-react';

export function Diario() {
  const [formData, setFormData] = useState({
    sonoQualidade: 3,
    libido: 3,
    fome: 3,
    energiaTreino: 3
  });

  const handleRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: Number(value) }));
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>Diário de Performance</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Registre seus dados de hoje.</p>
        </div>
        <div style={{ width: '200px' }}>
            <Input type="date" name="data" defaultValue={new Date().toISOString().split('T')[0]} />
        </div>
      </header>

      <form onSubmit={(e) => e.preventDefault()} style={{ display: 'grid', gap: '2rem' }}>
        
        {/* --- BLOCO 1: RECUPERAÇÃO E FÍSICO --- */}
        <section>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--primary)', fontWeight: 600 }}>
            1. Recuperação & Físico
          </h2>
          <Card>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
              <Slider 
                label="Qualidade do Sono"
                name="sonoQualidade"
                min={1} max={5} step={1}
                value={formData.sonoQualidade}
                onChange={handleRangeChange}
                valueDisplay={formData.sonoQualidade}
                minLabel="1. Péssimo"
                maxLabel="5. Reparador"
              />
              <Input label="Horas de Sono" type="number" step="0.1" placeholder="Ex: 7.5" />
              <Input label="BPM Repouso" type="number" placeholder="Ex: 55" />
              <Input label="Peso (kg)" type="number" step="0.05" placeholder="Ex: 80.5" />
              <Slider 
                label="Libido / Ereção Matinal"
                name="libido"
                min={1} max={5} step={1}
                value={formData.libido}
                onChange={handleRangeChange}
                valueDisplay={formData.libido}
                minLabel="1. Morta"
                maxLabel="5. Adolescente"
              />
            </div>
          </Card>
        </section>

        {/* --- BLOCO 2: NUTRIÇÃO & HIDRATAÇÃO (ALTERADO) --- */}
        <section>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--primary)', fontWeight: 600 }}>
            2. Nutrição
          </h2>
          <Card>
             {/* Parte da Dieta */}
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <Input 
                  label="Aderência à Dieta (%)" 
                  type="number" 
                  min={0} max={100}
                  placeholder="Ex: 100" 
                />
                <Slider 
                  label="Fome / Saciedade"
                  name="fome"
                  min={1} max={5} step={1}
                  value={formData.fome}
                  onChange={handleRangeChange}
                  valueDisplay={formData.fome}
                  minLabel="1. Faminto"
                  maxLabel="5. Sem Fome"
                />
             </div>

             {/* Nova Área: Hidratação e Líquidos */}
             <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                Hidratação & Estimulantes
             </h3>
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                
                {/* Água */}
                <Input 
                  label="Água (Litros)" 
                  type="number" 
                  step="0.1" 
                  placeholder="Ex: 3.5" 
                />

                {/* Café */}
                <Input 
                  label="Café (ml)" 
                  type="number" 
                  step="10" 
                  placeholder="Ex: 200" 
                />

                {/* Refrigerante */}
                <Input 
                  label="Refrigerante (ml/latas)" 
                  type="number" 
                  placeholder="Ex: 350" 
                />

             </div>
          </Card>
        </section>

        {/* --- BLOCO 3: TREINO --- */}
        <section>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--primary)', fontWeight: 600 }}>
            3. Treino
          </h2>
          <Card>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <Slider 
                label="Energia no Treino"
                name="energiaTreino"
                min={1} max={5} step={1}
                value={formData.energiaTreino}
                onChange={handleRangeChange}
                valueDisplay={formData.energiaTreino}
                minLabel="1. Arrastado"
                maxLabel="5. Explosivo"
              />
              <Input label="Aderência ao Treino (%)" type="number" min={0} max={100} placeholder="Ex: 100" />
              <Input label="Treino do Dia" placeholder="Ex: Upper, Leg Day..." />
            </div>

            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '1rem' }}>Exercícios Realizados</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Input placeholder="Exercício 1" />
              <Input placeholder="Exercício 2" />
              <Input placeholder="Exercício 3" />
              <Input placeholder="Exercício 4" />
              <Input placeholder="Exercício 5" />
              <Input placeholder="Exercício 6" />
              <Input placeholder="Exercício 7" />
              <Input placeholder="Exercício 8" />
            </div>
            <div style={{ marginTop: '1.5rem' }}>
               <Textarea label="Observações extras" placeholder="Algo mais a relatar?" rows={2} />
            </div>
          </Card>
        </section>

        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingBottom: '2rem' }}>
          <Button type="submit" variant="primary" style={{ paddingLeft: '2rem', paddingRight: '2rem' }}>
            <Save size={18} />
            Salvar Registro do Dia
          </Button>
        </div>

      </form>
    </div>
  );
}