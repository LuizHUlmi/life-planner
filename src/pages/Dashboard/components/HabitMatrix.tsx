import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Moon, Heart, Utensils, Dumbbell, Check } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { Card } from '../../../components/ui/Card';
import styles from './HabitMatrix.module.css'; // Importe o CSS

interface Habit {
  id: number;
  title: string;
}

const FIXED_METRICS = [
  { key: 'sleep_score', label: 'Sono', icon: <Moon size={14} /> },
  { key: 'libido_score', label: 'Libido', icon: <Heart size={14} /> },
  { key: 'diet_score', label: 'Dieta', icon: <Utensils size={14} /> },
  { key: 'workout_type', label: 'Treino', icon: <Dumbbell size={14} /> },
];

export function HabitMatrix() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [habitLogMap, setHabitLogMap] = useState<Set<string>>(new Set());
  const [metricLogMap, setMetricLogMap] = useState<Record<string, string>>({}); 

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  useEffect(() => { fetchData(); }, [currentDate]);

  async function fetchData() {
    setLoading(true);
    try {
      const startStr = new Date(year, month, 1).toISOString().split('T')[0];
      const endStr = new Date(year, month + 1, 0).toISOString().split('T')[0];

      // 1. Hábitos
      const { data: habitsData } = await supabase.from('habits').select('id, title').eq('is_active', true).order('created_at', { ascending: true });
      setHabits(habitsData || []);

      // 2. Logs Hábitos
      const { data: habitLogs } = await supabase.from('habit_logs').select('habit_id, date').gte('date', startStr).lte('date', endStr);
      const hMap = new Set<string>();
      habitLogs?.forEach((log: { date: string; habit_id: any; }) => hMap.add(`${log.habit_id}-${parseInt(log.date.split('-')[2])}`));
      setHabitLogMap(hMap);

      // 3. Logs Diários
      const { data: dailyLogs } = await supabase.from('daily_logs').select('date, sleep_score, libido_score, diet_score, workout_type').gte('date', startStr).lte('date', endStr);
      const mMap: Record<string, string> = {};
      dailyLogs?.forEach((log: any) => {
        const day = parseInt(log.date.split('-')[2]);
        if (log.sleep_score) mMap[`sleep_score-${day}`] = log.sleep_score;
        if (log.libido_score) mMap[`libido_score-${day}`] = log.libido_score;
        if (log.diet_score) mMap[`diet_score-${day}`] = log.diet_score;
        if (log.workout_type) mMap[`workout_type-${day}`] = log.workout_type;
      });
      setMetricLogMap(mMap);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  }

  const changeMonth = (delta: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + delta);
    setCurrentDate(newDate);
  };

  const getMetricColor = (_key: string, value: string) => {
    if (!value) return '#e2e8f0';
    if (['otimo', 'otima', '100'].includes(value)) return '#22c55e';
    if (['ok', 'mais_50'].includes(value)) return '#eab308';
    if (['pessimo', 'menos_50'].includes(value)) return '#ef4444';
    if (value === 'musculacao') return '#3b82f6';
    if (value === 'cardio') return '#ec4899';
    if (value === 'hibrido') return '#a855f7';
    return '#94a3b8';
  };

  const getTooltip = (_key: string, value: string) => {
    if (!value) return 'Sem registro';
    if (value === 'menos_50') return '< 50%';
    if (value === 'mais_50') return '> 50%';
    return value.charAt(0).toUpperCase() + value.slice(1);
  };

  return (
    <Card className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>Consistência: {monthName}</h3>
        <div className={styles.navGroup}>
          <button onClick={() => changeMonth(-1)} className={styles.navBtn}><ChevronLeft size={16} /></button>
          <button onClick={() => changeMonth(1)} className={styles.navBtn}><ChevronRight size={16} /></button>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.stickyHeader}>Métricas & Hábitos</th>
              {daysArray.map(day => {
                const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
                return (
                  <th key={day} className={styles.dayHeader} style={{ 
                    color: isToday ? 'var(--primary)' : 'var(--text-secondary)',
                    fontWeight: isToday ? 800 : 400,
                    backgroundColor: isToday ? '#f0f9ff' : 'transparent'
                  }}>{day}</th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {loading ? (
               <tr><td colSpan={daysInMonth + 1} style={{ padding: '2rem', textAlign: 'center' }}>Carregando...</td></tr>
            ) : (
              <>
                {FIXED_METRICS.map((metric) => (
                  <tr key={metric.key} style={{ borderBottom: '1px solid #f8fafc', backgroundColor: '#fafafa' }}>
                    <td className={styles.stickyCol} style={{ backgroundColor: '#fafafa' }}>
                      {metric.icon} {metric.label}
                    </td>
                    {daysArray.map(day => {
                      const value = metricLogMap[`${metric.key}-${day}`];
                      const color = getMetricColor(metric.key, value);
                      const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
                      return (
                        <td key={day} className={styles.dayCell} style={{ backgroundColor: isToday ? '#f0f9ff' : 'transparent' }}>
                          <div className={styles.dot} title={getTooltip(metric.key, value)}
                            style={{ backgroundColor: color, opacity: value ? 1 : 0.2 }} 
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
                <tr><td colSpan={daysInMonth + 1} style={{ height: '4px', backgroundColor: '#f1f5f9' }}></td></tr>
                {habits.map(habit => (
                  <tr key={habit.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                    <td className={styles.stickyCol} style={{ backgroundColor: 'white', fontWeight: 500, color: 'var(--text-primary)' }}>
                      {habit.title}
                    </td>
                    {daysArray.map(day => {
                      const isDone = habitLogMap.has(`${habit.id}-${day}`);
                      const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
                      return (
                        <td key={day} className={styles.dayCell} style={{ backgroundColor: isToday ? '#f0f9ff' : 'transparent' }}>
                          {isDone ? (
                            <div className={styles.checkContainer}><Check size={12} color="white" strokeWidth={4} /></div>
                          ) : (
                            <div className={styles.dot} style={{ width: '5px', height: '5px', backgroundColor: '#f1f5f9' }} />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}