import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Save, Camera, Activity } from 'lucide-react';

export function Biometria() {
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Cabeçalho */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
            Biometria Semanal
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Acompanhamento de medidas corporais e evolução.
          </p>
        </div>
      </header>

      <form onSubmit={(e) => e.preventDefault()}>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
            <Activity color="var(--primary)" size={24} />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>
              Nova Medição
            </h2>
          </div>

          {/* Grid de Inputs Principais */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            
            {/* Data */}
            <Input 
              label="Data da Medição" 
              type="date" 
              defaultValue={new Date().toISOString().split('T')[0]} 
            />

            {/* Peso */}
            <Input 
              label="Peso (kg)" 
              type="number" 
              step="0.05" 
              placeholder="00.0" 
            />

            {/* BF Estimado */}
            <Input 
              label="BF% Estimado" 
              type="number" 
              step="0.1" 
              placeholder="00%" 
            />
          </div>

          <div style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Circunferências & Dobras
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            {/* Cintura */}
            <Input 
              label="Cintura (cm)" 
              type="number" 
              placeholder="00 cm" 
            />

            {/* Pescoço */}
            <Input 
              label="Pescoço (cm)" 
              type="number" 
              placeholder="00 cm" 
            />

            {/* Dobra Abdominal */}
            <Input 
              label="Dobra Abdominal (mm)" 
              type="number" 
              placeholder="00 mm" 
            />

            {/* Dobra Coxa */}
            <Input 
              label="Dobra Coxa (mm)" 
              type="number" 
              placeholder="00 mm" 
            />
          </div>

          {/* Upload de Fotos e Obs */}
          <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
             
             {/* Simulação de Upload de Fotos */}
             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                  Fotos do Físico
                </label>
                <div style={{ 
                  border: '2px dashed var(--border-color)', 
                  borderRadius: 'var(--radius-sm)', 
                  padding: '2rem', 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  backgroundColor: 'var(--bg-page)'
                }}>
                  <Camera size={32} style={{ marginBottom: '0.5rem', color: 'var(--primary)' }} />
                  <span style={{ fontSize: '0.9rem' }}>Clique para adicionar fotos (Frente, Costas, Lado)</span>
                </div>
             </div>

             <Textarea 
                label="Observações" 
                placeholder="Sentiu alguma mudança visual? Retenção? Algo a notar?" 
                rows={3}
             />
          </div>

          {/* Botão Salvar */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
            <Button type="submit" variant="primary" style={{ paddingLeft: '2rem', paddingRight: '2rem' }}>
              <Save size={18} />
              Salvar Biometria
            </Button>
          </div>

        </Card>
      </form>
    </div>
  );
}