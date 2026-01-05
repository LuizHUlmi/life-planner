import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Save, Flame, Plus, Trash2, Target } from 'lucide-react';

// Tipagem para uma Refeição
interface MealItem {
  id: number;
  name: string;      // Ex: Café da Manhã
  time: string;      // Ex: 08:00
  foods: string;     // Ex: 3 Ovos + 50g Aveia (Textarea para liberdade total)
}

export function Nutricao() {
  // Estado para controlar qual aba (Tipo de Dia) está ativa
  const [activeTab, setActiveTab] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('HIGH');

  // Estado das Refeições (Simulando que cada dia teria sua lista no banco)
  // No futuro, isso virá do banco de dados filtrado pelo tipo de dia
  const [meals, setMeals] = useState<MealItem[]>([
    { id: 1, name: 'Refeição 1 (Café da Manhã)', time: '07:00', foods: '3 Ovos inteiros\n50g de Aveia em Flocos\n150g de Mamão\n1 colher de Mel' },
    { id: 2, name: 'Refeição 2 (Almoço)', time: '12:00', foods: '180g Peito de Frango\n350g Mandioca\nSalada à vontade' },
  ]);

  const addMeal = () => {
    const newId = meals.length > 0 ? Math.max(...meals.map(m => m.id)) + 1 : 1;
    setMeals([...meals, { id: newId, name: '', time: '', foods: '' }]);
  };

  const removeMeal = (id: number) => {
    setMeals(meals.filter(m => m.id !== id));
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
          Planejamento Nutricional
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Definição de macros e ciclo de carboidratos.
        </p>
      </header>

      <form onSubmit={(e) => e.preventDefault()}>
        
        {/* --- BLOCO 1: METAS MACRO (TOPO) --- */}
        <section style={{ marginBottom: '2rem' }}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              <Target color="var(--primary)" size={24} />
              <h2 style={{ fontSize: '1.2rem', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>
                Metas & Metabolismo
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
              <Input label="Taxa Metabólica Basal (TMB)" placeholder="Ex: 2050 Kcal" />
              <Input label="Gasto Energético Total (GET)" placeholder="Ex: 3100 Kcal" />
              <Input label="Meta Calórica (Cutting/Bulking)" placeholder="Ex: 2500 Kcal" />
              <Input label="Proteína (g/kg)" placeholder="Ex: 2.4 g/kg" />
            </div>
          </Card>
        </section>

        {/* --- BLOCO 2: SELETOR DE ESTRATÉGIA (ABAS) --- */}
        <section style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <Button 
              type="button" 
              variant={activeTab === 'HIGH' ? 'primary' : 'secondary'}
              onClick={() => setActiveTab('HIGH')}
              style={{ flex: 1 }}
            >
              HIGH CARB
            </Button>
            <Button 
              type="button" 
              variant={activeTab === 'MEDIUM' ? 'primary' : 'secondary'}
              onClick={() => setActiveTab('MEDIUM')}
              style={{ flex: 1 }}
            >
              MEDIUM CARB
            </Button>
            <Button 
              type="button" 
              variant={activeTab === 'LOW' ? 'primary' : 'secondary'}
              onClick={() => setActiveTab('LOW')}
              style={{ flex: 1 }}
            >
              LOW CARB
            </Button>
          </div>
        </section>

        {/* --- BLOCO 3: CARDÁPIO DO DIA SELECIONADO --- */}
        <section>
          <Card style={{ borderTopLeftRadius: activeTab === 'HIGH' ? 0 : '12px', borderTopRightRadius: activeTab === 'LOW' ? 0 : '12px' }}> {/* Estilo visual legal para conectar com a aba */}
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Flame color={activeTab === 'HIGH' ? '#ef4444' : activeTab === 'MEDIUM' ? '#f59e0b' : '#10b981'} size={24} />
                <h2 style={{ fontSize: '1.2rem', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>
                  Menu: {activeTab === 'HIGH' ? 'Dia de Carbo Alto' : activeTab === 'MEDIUM' ? 'Dia de Carbo Médio' : 'Dia de Carbo Baixo'}
                </h2>
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                {activeTab === 'HIGH' ? 'Foco: Máximo glicogênio' : activeTab === 'MEDIUM' ? 'Foco: Manutenção' : 'Foco: Queima de gordura'}
              </div>
            </div>

            {/* Inputs de Macro específicos deste dia */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem', backgroundColor: 'var(--bg-page)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
              <Input label="Carboidratos (g/kg)" placeholder={activeTab === 'HIGH' ? "3.8" : activeTab === 'MEDIUM' ? "2.7" : "1.4"} />
              <Input label="Proteínas (g/kg)" placeholder="2.4" />
              <Input label="Gorduras (g/kg)" placeholder={activeTab === 'HIGH' ? "0.7" : activeTab === 'MEDIUM' ? "0.7" : "0.85"} />
            </div>

            {/* Lista de Refeições */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {meals.map((meal, index) => (
                <div key={meal.id} style={{ 
                  border: '1px solid var(--border-color)', 
                  borderRadius: 'var(--radius-sm)', 
                  padding: '1.5rem',
                  position: 'relative',
                  backgroundColor: '#fff' 
                }}>
                  
                  {/* Badge do Número da Refeição */}
                  <div style={{ 
                    position: 'absolute', 
                    top: '-10px', 
                    left: '1rem', 
                    backgroundColor: 'var(--primary)', 
                    color: 'white', 
                    padding: '0.2rem 0.6rem', 
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 700 
                  }}>
                    REFEIÇÃO {index + 1}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 40px', gap: '1rem', marginBottom: '1rem' }}>
                    <Input label="Nome da Refeição" placeholder="Ex: Café da Manhã" defaultValue={meal.name} />
                    <Input label="Horário" type="time" defaultValue={meal.time} />
                    <div style={{ display: 'flex', alignItems: 'end', paddingBottom: '2px' }}>
                       <button type="button" onClick={() => removeMeal(meal.id)} style={{ border: 'none', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                        <Trash2 size={18} className="hover:text-red-500" />
                      </button>
                    </div>
                  </div>

                  {/* Textarea para os alimentos (Estilo da sua planilha) */}
                  <Textarea 
                    label="Alimentos & Quantidades" 
                    placeholder="Ex: 3 ovos inteiros..." 
                    defaultValue={meal.foods}
                    rows={4}
                    style={{ lineHeight: '1.6' }}
                  />

                </div>
              ))}
            </div>

            {/* Botão Adicionar Refeição */}
            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
              <Button type="button" variant="secondary" onClick={addMeal} style={{ borderStyle: 'dashed' }}>
                <Plus size={16} /> Adicionar Refeição
              </Button>
            </div>

          </Card>
        </section>

        {/* Botão Salvar Geral */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem', paddingBottom: '2rem' }}>
          <Button type="submit" variant="primary" style={{ paddingLeft: '2rem', paddingRight: '2rem' }}>
            <Save size={18} />
            Salvar Dieta Completa
          </Button>
        </div>

      </form>
    </div>
  );
}