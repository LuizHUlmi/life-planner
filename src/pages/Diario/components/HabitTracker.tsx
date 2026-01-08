import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { Check } from 'lucide-react';

interface Habit {
  id: number;
  title: string;
}

interface HabitTrackerProps {
  date?: string;
}

export function HabitTracker({ date }: HabitTrackerProps) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completedHabits, setCompletedHabits] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  
  const currentDate = date || new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchHabits();
  }, [currentDate]);

  async function fetchHabits() {
    try {
      setLoading(true);
      // 1. Busca hábitos ativos
      const { data: habitsData } = await supabase
        .from('habits')
        .select('*')
        .eq('is_active', true)
        .order('created_at');

      if (habitsData) setHabits(habitsData);

      // 2. Busca quais foram feitos nesta data
      const { data: logsData } = await supabase
        .from('habit_logs')
        .select('habit_id')
        .eq('date', currentDate);

      if (logsData) {
        setCompletedHabits(logsData.map(log => log.habit_id));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const toggleHabit = async (habitId: number) => {
    const isCompleted = completedHabits.includes(habitId);

    // Otimista (Atualiza UI antes do banco)
    if (isCompleted) {
      setCompletedHabits(prev => prev.filter(id => id !== habitId));
      await supabase.from('habit_logs').delete().match({ habit_id: habitId, date: currentDate });
    } else {
      setCompletedHabits(prev => [...prev, habitId]);
      await supabase.from('habit_logs').insert({ habit_id: habitId, date: currentDate });
    }
  };

  if (loading) return <div style={{ padding: '1rem', textAlign: 'center', fontSize: '0.85rem', color: '#94a3b8' }}>Carregando hábitos...</div>;
  if (habits.length === 0) return null;

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.8rem', display: 'block', textTransform: 'uppercase' }}>
        Rotina & Hábitos
      </label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {habits.map(habit => {
          const isDone = completedHabits.includes(habit.id);
          return (
            <button
              key={habit.id}
              type="button"
              onClick={() => toggleHabit(habit.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '0.5rem 0.8rem', borderRadius: '20px',
                border: isDone ? '1px solid #22c55e' : '1px solid #e2e8f0',
                backgroundColor: isDone ? '#f0fdf4' : 'white',
                color: isDone ? '#15803d' : '#64748b',
                fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              {isDone ? <Check size={14} /> : <div style={{ width: 14, height: 14, borderRadius: '50%', border: '1px solid #cbd5e1' }} />}
              {habit.title}
            </button>
          );
        })}
      </div>
    </div>
  );
}