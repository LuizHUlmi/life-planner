import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { CheckCircle2, Circle, Plus, Trash2, Zap, Loader2 } from 'lucide-react';

interface Habit {
  id: number;
  title: string;
  is_active: boolean;
}

interface HabitTrackerProps {
  date: string; // Recebe a data selecionada no Diário
}

export function HabitTracker({ date }: HabitTrackerProps) {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completedIds, setCompletedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Estado para criar novo hábito
  const [newHabit, setNewHabit] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Recarrega sempre que a data (date) ou o usuário mudar
  useEffect(() => {
    if (user) {
      fetchHabitsAndLogs();
    }
  }, [user, date]);

  async function fetchHabitsAndLogs() {
    try {
      setLoading(true);
      
      // 1. Busca os hábitos ativos (Definição)
      const { data: habitsData } = await supabase
        .from('habits')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      setHabits(habitsData || []);

      // 2. Busca os logs (o que foi feito) NA DATA SELECIONADA
      const { data: logsData } = await supabase
        .from('habit_logs')
        .select('habit_id')
        .eq('date', date); // Usa a data passada via props

      // Cria lista de IDs feitos: [1, 5, 8]
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

    // Atualização Otimista (Visual)
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
          .match({ habit_id: habitId, date: date });
      } else {
        // Criar o log (Marcar)
        await supabase
          .from('habit_logs')
          .insert([{ habit_id: habitId, user_id: user?.id, date: date }]);
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
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  };

  // --- AÇÃO: ARQUIVAR HÁBITO ---
  const handleDeleteHabit = async (id: number) => {
    if (!confirm('Arquivar este hábito?')) return;
    
    // Soft delete: apenas desativa
    await supabase.from('habits').update({ is_active: false }).eq('id', id);
    setHabits(habits.filter(h => h.id !== id));
  };

  const progress = habits.length > 0 ? Math.round((completedIds.length / habits.length) * 100) : 0;

  if (loading && habits.length === 0) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}><Loader2 className="animate-spin" size={24} /></div>;
  }

  return (
    <section>
      {/* Header do Bloco */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.2rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Zap size={20} /> Rotina & Hábitos
        </h2>
        {habits.length > 0 && (
           <span style={{ fontSize: '0.9rem', fontWeight: 700, color: progress === 100 ? '#16a34a' : 'var(--primary)' }}>
             {progress}% Concluído
           </span>
        )}
      </div>

      <Card>
        {/* Barra de Progresso */}
        {habits.length > 0 && (
          <div style={{ width: '100%', height: '6px', backgroundColor: '#e0f2fe', borderRadius: '3px', overflow: 'hidden', marginBottom: '1.5rem' }}>
            <div style={{ width: `${progress}%`, height: '100%', backgroundColor: progress === 100 ? '#16a34a' : 'var(--primary)', transition: 'width 0.4s ease' }} />
          </div>
        )}

        {/* Lista de Hábitos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          {habits.map(habit => {
            const isDone = completedIds.includes(habit.id);
            return (
              <div 
                key={habit.id} 
                style={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.8rem', borderRadius: '8px',
                  backgroundColor: isDone ? '#f0fdf4' : '#f8fafc',
                  border: isDone ? '1px solid #86efac' : '1px solid transparent',
                  transition: 'all 0.2s'
                }}
              >
                <div 
                  onClick={() => toggleHabit(habit.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer', flex: 1 }}
                >
                  <div style={{ color: isDone ? '#16a34a' : '#cbd5e1' }}>
                     {isDone ? <CheckCircle2 size={24} fill="#dcfce7" /> : <Circle size={24} />}
                  </div>
                  <span style={{ 
                    fontWeight: 500, 
                    color: isDone ? '#15803d' : 'var(--text-primary)',
                    textDecoration: isDone ? 'line-through' : 'none'
                  }}>
                    {habit.title}
                  </span>
                </div>

                <button 
                  onClick={() => handleDeleteHabit(habit.id)}
                  style={{ border: 'none', background: 'transparent', color: '#cbd5e1', cursor: 'pointer' }}
                  className="hover:text-red-500"
                  title="Arquivar Hábito"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}

          {habits.length === 0 && !loading && (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem', padding: '1rem' }}>
              Nenhum hábito cadastrado. Adicione um abaixo!
            </div>
          )}
        </div>

        {/* Adicionar Novo */}
        <form onSubmit={handleAddHabit} style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '0.5rem' }}>
          <div style={{ flex: 1 }}>
             <Input 
              placeholder="Novo hábito (ex: Ler 10 pág)..." 
              value={newHabit} 
              onChange={e => setNewHabit(e.target.value)} 
              disabled={isCreating} 
            />
          </div>
          <Button type="submit" variant="secondary" disabled={isCreating || !newHabit}>
            <Plus size={18} />
          </Button>
        </form>
      </Card>
    </section>
  );
}