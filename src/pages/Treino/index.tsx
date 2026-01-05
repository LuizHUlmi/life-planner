import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Save, Plus, Trash2, Dumbbell } from 'lucide-react';

// Define a estrutura de um exercício baseada na sua imagem
interface ExerciseItem {
  id: number; // Identificador único temporário para o React não se perder
  name: string;
  setsReps: string;
  technique: string;
  load: string;
  substitution: string;
}

export function Treino() {
  // Estado inicial com um exercício vazio para não começar a tela em branco
  const [exercises, setExercises] = useState<ExerciseItem[]>([
    { id: 1, name: '', setsReps: '3 x 8-12', technique: '', load: '', substitution: '' }
  ]);

  // Função para adicionar nova linha
  const handleAddExercise = () => {
    const newId = exercises.length > 0 ? Math.max(...exercises.map(e => e.id)) + 1 : 1;
    setExercises([
      ...exercises, 
      { id: newId, name: '', setsReps: '3 x 8-12', technique: '-', load: '', substitution: '' }
    ]);
  };

  // Função para remover uma linha específica
  const handleRemoveExercise = (id: number) => {
    if (exercises.length === 1) {
      alert("O treino precisa ter pelo menos um exercício!");
      return;
    }
    setExercises(exercises.filter(exercise => exercise.id !== id));
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
          Planejador de Treino
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Monte a estrutura do seu treino e registre as cargas.
        </p>
      </header>

      <form onSubmit={(e) => e.preventDefault()}>
        <Card>
          
          {/* --- CABEÇALHO DO TREINO --- */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
            <Select 
              label="Divisão do Treino"
              placeholder="Selecione..."
              options={[
                { value: 'lower', label: 'Lower (Pernas)' },
                { value: 'upper1', label: 'Upper 1 (Superior Foco 1)' },
                { value: 'upper2', label: 'Upper 2 (Superior Foco 2)' },
                { value: 'fullbody', label: 'Full Body' },
              ]}
            />
            
            <Input 
              label="Data" 
              type="date" 
              defaultValue={new Date().toISOString().split('T')[0]} 
            />

            <Input 
              label="Características / Foco" 
              placeholder="Ex: Foco em Quadríceps..." 
            />
          </div>

          {/* --- LISTA DE EXERCÍCIOS DINÂMICA --- */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <Dumbbell color="var(--primary)" size={24} />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>
              Lista de Exercícios
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            {/* Cabeçalho das Colunas (Visível apenas em Desktop) */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '40px 2fr 1fr 1fr 0.8fr 1.5fr 40px', 
                gap: '1rem',
                padding: '0 0.5rem',
                marginBottom: '-0.5rem'
             }} className="desktop-only-headers">
               <span>#</span>
               <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Exercício</span>
               <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Séries x Reps</span>
               <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Técnica</span>
               <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Carga (kg)</span>
               <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Substituição</span>
            </div>

            {/* Mapeamento das Linhas */}
            {exercises.map((exercise, index) => (
              <div 
                key={exercise.id} 
                style={{ 
                  display: 'grid', 
                  // Responsividade: Em mobile vira coluna, em desktop segue a tabela
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: '0.75rem',
                  alignItems: 'end',
                  backgroundColor: 'var(--bg-page)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)'
                }}
                className="exercise-row" // Classe para estilizarmos o grid desktop depois se precisar
              >
                
                {/* Desktop Grid Hack: Usamos style inline para forçar layout de tabela em telas grandes */}
                <style>{`
                  @media (min-width: 1024px) {
                    .exercise-row {
                      grid-template-columns: 40px 2fr 1fr 1fr 0.8fr 1.5fr 40px !important;
                      background-color: transparent !important;
                      padding: 0 !important;
                      border: none !important;
                    }
                    .mobile-label { display: none; }
                    .desktop-only-headers { display: grid !important; }
                  }
                  @media (max-width: 1023px) {
                    .desktop-only-headers { display: none !important; }
                  }
                `}</style>

                {/* Número da Sequência */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', paddingBottom: '12px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
                  {index + 1}
                </div>

                {/* Campos */}
                <Input placeholder="Nome do Exercício" defaultValue={exercise.name} />
                <Input placeholder="Séries x Reps" defaultValue={exercise.setsReps} />
                <Input placeholder="Técnica" defaultValue={exercise.technique} />
                <Input type="number" placeholder="Carga" defaultValue={exercise.load} />
                <Input placeholder="Substituição" defaultValue={exercise.substitution} />

                {/* Botão Remover Linha */}
                <button 
                  type="button"
                  onClick={() => handleRemoveExercise(exercise.id)}
                  style={{ 
                    border: 'none', 
                    background: 'transparent', 
                    color: 'var(--text-secondary)', 
                    cursor: 'pointer',
                    padding: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%'
                  }}
                  title="Remover exercício"
                >
                  <Trash2 size={18} className="hover:text-red-500" />
                </button>

              </div>
            ))}
          </div>

          {/* Botão Adicionar Novo Exercício */}
          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
            <Button 
              type="button" 
              variant="secondary" 
              onClick={handleAddExercise}
              style={{ borderStyle: 'dashed' }}
            >
              <Plus size={18} />
              Adicionar Exercício
            </Button>
          </div>

          {/* Botão Salvar Geral */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '3rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
            <Button type="submit" variant="primary" style={{ paddingLeft: '2rem', paddingRight: '2rem' }}>
              <Save size={18} />
              Salvar Treino
            </Button>
          </div>

        </Card>
      </form>
    </div>
  );
}