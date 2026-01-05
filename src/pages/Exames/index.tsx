import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Save, FlaskConical } from 'lucide-react';

export function Exames() {
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
          Exames Laboratoriais
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Histórico dos seus principais marcadores fisiológicos.
        </p>
      </header>

      <form onSubmit={(e) => e.preventDefault()}>
        <Card>
          
          {/* Cabeçalho do Card */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <FlaskConical color="var(--primary)" size={24} />
              <h2 style={{ fontSize: '1.2rem', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>
                Novo Resultado
              </h2>
            </div>
            {/* Input de Data no topo */}
            <div style={{ width: '200px' }}>
               <Input type="date" label="Data da Coleta" defaultValue={new Date().toISOString().split('T')[0]} />
            </div>
          </div>

          <div style={{ display: 'grid', gap: '2rem' }}>

            {/* --- GRUPO 1: HORMÔNIOS --- */}
            <section>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Painel Hormonal
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                <Input 
                  label="Testosterona Total" 
                  type="number" 
                  placeholder="ng/dL" 
                />
                <Input 
                  label="Testosterona Livre" 
                  type="number" 
                  step="0.01"
                  placeholder="ng/dL" 
                />
                <Input 
                  label="Estradiol (E2)" 
                  type="number" 
                  placeholder="pg/mL" 
                />
                <Input 
                  label="SHBG" 
                  type="number" 
                  placeholder="nmol/L" 
                />
              </div>
            </section>

            {/* --- GRUPO 2: FÍGADO E SANGUE --- */}
            <section>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Função Hepática & Hematologia
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                {/* Separando TGO e TGP para precisão */}
                <Input 
                  label="TGO (AST)" 
                  type="number" 
                  placeholder="U/L" 
                />
                <Input 
                  label="TGP (ALT)" 
                  type="number" 
                  placeholder="U/L" 
                />
                <Input 
                  label="Ferritina" 
                  type="number" 
                  placeholder="ng/mL" 
                />
                <Input 
                  label="Hematócrito" 
                  type="number" 
                  step="0.1"
                  placeholder="%" 
                />
              </div>
            </section>

            {/* --- GRUPO 3: PERFIL LIPÍDICO --- */}
            <section>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Perfil Lipídico
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                <Input 
                  label="Colesterol HDL" 
                  type="number" 
                  placeholder="mg/dL" 
                />
                <Input 
                  label="Colesterol LDL" 
                  type="number" 
                  placeholder="mg/dL" 
                />
                <Input 
                  label="Triglicérides" 
                  type="number" 
                  placeholder="mg/dL" 
                />
              </div>
            </section>
            
            {/* Campo extra para anexar link ou observação */}
            <section>
               <Textarea 
                 label="Observações / Link do PDF" 
                 placeholder="Cole aqui o link do Google Drive com o PDF ou anotações médicas..."
                 rows={2}
               />
            </section>

          </div>

          {/* Botão Salvar */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '3rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
            <Button type="submit" variant="primary" style={{ paddingLeft: '2rem', paddingRight: '2rem' }}>
              <Save size={18} />
              Salvar Exames
            </Button>
          </div>

        </Card>
      </form>
    </div>
  );
}