import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { 
  CheckCircle2, Circle, Plus, Calendar, Trash2, Zap 
} from 'lucide-react';

interface Habit {
  id: number;
  title: string;
  is_active: boolean;
}

export function Rotina() {
  const { user } = useAuth();
  
  // Data selecionada (Padrão: Hoje)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completedIds, setCompletedIds] = useState<number[]>([]); // Lista de IDs feitos hoje
  const [loading, setLoading] = useState(false);

  // Estado para criar novo hábito
  const [newHabit, setNewHabit] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (user) {
      fetchHabitsAndLogs();
    }
  }, [user, selectedDate]);

  async function fetchHabitsAndLogs() {
    try {
      setLoading(true);
      
      // 1. Busca os hábitos ativos
      const { data: habitsData, error: habitsError } = await supabase
        .from('habits')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (habitsError) throw habitsError;
      setHabits(habitsData || []);

      // 2. Busca os logs (o que foi feito) NA DATA SELECIONADA
      const { data: logsData, error: logsError } = await supabase
        .from('habit_logs')
        .select('habit_id')
        .eq('date', selectedDate);

      if (logsError) throw logsError;
      
      // Cria um array só com os IDs completados: [1, 5, 8]
      const done = logsData ? logsData.map(log => log.habit_id) : [];
      setCompletedIds(done);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  // --- AÇÃO: MARCAR/DESMARCAR ---
  const toggleHabit = async (habitId: number) => {
    const isDone = completedIds.includes(habitId);

    // Atualização Otimista (Muda na tela antes do banco)
    if (isDone) {
      setCompletedIds(completedIds.filter(id => id !== habitId));
    } else {
      setCompletedIds([...completedIds, habitId]);
    }

    try {
      if (isDone) {
        // Remover o log (Desmarcar)
        await supabase
          .from('habit_logs')
          .delete()
          .match({ habit_id: habitId, date: selectedDate });
      } else {
        // Criar o log (Marcar)
        await supabase
          .from('habit_logs')
          .insert([{ habit_id: habitId, user_id: user?.id, date: selectedDate }]);
      }
    } catch (error) {
      console.error(error);
      fetchHabitsAndLogs(); // Reverte se der erro
    }
  };

  // --- AÇÃO: CRIAR NOVO HÁBITO ---
  const handleAddHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabit.trim() || !user) return;

    try {
      setIsCreating(true);
      const { data, error } = await supabase
        .from('habits')
        .insert([{ title: newHabit, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      if (data) setHabits([...habits, data]);
      setNewHabit('');
    } catch (error) {
      alert('Erro ao criar hábito.');
    } finally {
      setIsCreating(false);
    }
  };

  // --- AÇÃO: EXCLUIR HÁBITO (Arquivar) ---
  const handleDeleteHabit = async (id: number) => {
    if (!confirm('Deseja parar de rastrear este hábito?')) return;
    
    // Soft delete: apenas desativa
    await supabase.from('habits').update({ is_active: false }).eq('id', id);
    setHabits(habits.filter(h => h.id !== id));
  };

  // Cálculos de Progresso
  const progress = habits.length > 0 ? Math.round((completedIds.length / habits.length) * 100) : 0;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
            Rotina Diária
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Construa disciplina, um dia de cada vez.
          </p>
        </div>
        
        {/* Seletor de Data */}
        <div style={{ width: '180px' }}>
            <Input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
        </div>
      </header>

      {/* BARRA DE PROGRESSO DO DIA */}
      <Card style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontWeight: 600, color: '#0284c7', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={18} fill="#0284c7" /> Progresso Hoje
          </span>
          <span style={{ fontWeight: 700, color: '#0284c7' }}>{progress}%</span>
        </div>
        <div style={{ width: '100%', height: '10px', backgroundColor: '#e0f2fe', borderRadius: '5px', overflow: 'hidden' }}>
          <div style={{ width: `${progress}%`, height: '100%', backgroundColor: '#0284c7', transition: 'width 0.4s ease' }} />
        </div>
      </Card>

      {/* LISTA DE HÁBITOS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        
        {habits.map(habit => {
          const isDone = completedIds.includes(habit.id);
          return (
            <Card 
              key={habit.id} 
              style={{ 
                padding: '1rem 1.5rem', 
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                transition: 'all 0.2s',
                backgroundColor: isDone ? '#f0fdf4' : 'white', // Verde claro se feito
                border: isDone ? '1px solid #86efac' : '1px solid var(--border-color)',
                opacity: selectedDate !== new Date().toISOString().split('T')[0] ? 0.9 : 1
              }}
            >
              <div 
                onClick={() => toggleHabit(habit.id)}
                style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', flex: 1 }}
              >
                <div style={{ color: isDone ? '#16a34a' : '#cbd5e1', display: 'flex' }}>
                   {isDone ? <CheckCircle2 size={28} fill="#dcfce7" /> : <Circle size={28} />}
                </div>
                <span style={{ 
                  fontSize: '1.1rem', fontWeight: 500, 
                  color: isDone ? '#15803d' : 'var(--text-primary)',
                  textDecoration: isDone ? 'line-through' : 'none'
                }}>
                  {habit.title}
                </span>
              </div>

              <button 
                onClick={() => handleDeleteHabit(habit.id)}
                style={{ border: 'none', background: 'transparent', color: '#e2e8f0', cursor: 'pointer' }}
                className="hover:text-red-500"
              >
                <Trash2 size={18} />
              </button>
            </Card>
          );
        })}

        {/* INPUT PARA NOVO HÁBITO */}
        <form onSubmit={handleAddHabit} style={{ marginTop: '1rem' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <Input 
                placeholder="Novo hábito (ex: Beber 2L de água)..." 
                value={newHabit}
                onChange={e => setNewHabit(e.target.value)}
                disabled={isCreating}
              />
            </div>
            <Button type="button" onClick={handleAddHabit} disabled={isCreating || !newHabit}>
               <Plus size={18} /> Adicionar
            </Button>
          </div>
        </form>

      </div>
    </div>
  );
}