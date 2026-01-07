import { useEffect, useState } from 'react';

import { ChevronLeft, ChevronRight, Moon, Heart, Utensils, Dumbbell, Check } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { Card } from '../../../components/ui/Card';

interface Habit {
  id: number;
  title: string;
}

// Configuração das Linhas Fixas (Métricas do Diário)
const FIXED_METRICS = [
  { key: 'sleep_score', label: 'Sono', icon: <Moon size={14} /> },
  { key: 'libido_score', label: 'Libido', icon: <Heart size={14} /> },
  { key: 'diet_score', label: 'Dieta', icon: <Utensils size={14} /> },
  { key: 'workout_type', label: 'Treino', icon: <Dumbbell size={14} /> },
];

export function HabitMatrix() {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Dados
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);

  // Mapas para acesso O(1)
  // "habitID-dia" -> true
  const [habitLogMap, setHabitLogMap] = useState<Set<string>>(new Set());
  // "metricKey-dia" -> valor (ex: "sleep_score-15" -> "otimo")
  const [metricLogMap, setMetricLogMap] = useState<Record<string, string>>({}); 

  // Configuração do Mês Atual
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  useEffect(() => {
    fetchData();
  }, [currentDate]);

  async function fetchData() {
    setLoading(true);
    try {
      const startStr = new Date(year, month, 1).toISOString().split('T')[0];
      const endStr = new Date(year, month + 1, 0).toISOString().split('T')[0];

      // 1. Buscar Hábitos Ativos (Linhas inferiores)
      const { data: habitsData } = await supabase
        .from('habits')
        .select('id, title')
        .eq('is_active', true)
        .order('created_at', { ascending: true });
      setHabits(habitsData || []);

      // 2. Buscar Logs de Hábitos (Checks)
      const { data: habitLogs } = await supabase
        .from('habit_logs')
        .select('habit_id, date')
        .gte('date', startStr)
        .lte('date', endStr);

      const hMap = new Set<string>();
      habitLogs?.forEach((log: { date: string; habit_id: any; }) => {
        const day = parseInt(log.date.split('-')[2]);
        hMap.add(`${log.habit_id}-${day}`);
      });
      setHabitLogMap(hMap);

      // 3. Buscar Logs Diários (Métricas novas)
      const { data: dailyLogs } = await supabase
        .from('daily_logs')
        .select('date, sleep_score, libido_score, diet_score, workout_type')
        .gte('date', startStr)
        .lte('date', endStr);

      const mMap: Record<string, string> = {};
      dailyLogs?.forEach((log: { date: string; sleep_score: string; libido_score: string; diet_score: string; workout_type: string; }) => {
        const day = parseInt(log.date.split('-')[2]);
        if (log.sleep_score) mMap[`sleep_score-${day}`] = log.sleep_score;
        if (log.libido_score) mMap[`libido_score-${day}`] = log.libido_score;
        if (log.diet_score) mMap[`diet_score-${day}`] = log.diet_score;
        if (log.workout_type) mMap[`workout_type-${day}`] = log.workout_type;
      });
      setMetricLogMap(mMap);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const changeMonth = (delta: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + delta);
    setCurrentDate(newDate);
  };

  // --- LÓGICA DE CORES (A Mágica acontece aqui) ---
  const getMetricColor = (_key: string, value: string) => {
    if (!value) return '#e2e8f0'; // Cinza claro (Vazio)

    // Cores Semafóricas (Verde/Amarelo/Vermelho)
    // Mapeando os valores do banco para cores
    if (['otimo', 'otima', '100'].includes(value)) return '#22c55e'; // Verde (Success)
    if (['ok', 'mais_50'].includes(value)) return '#eab308'; // Amarelo (Warning)
    if (['pessimo', 'menos_50'].includes(value)) return '#ef4444'; // Vermelho (Danger)

    // Cores Específicas de Treino
    if (value === 'musculacao') return '#3b82f6'; // Azul
    if (value === 'cardio') return '#ec4899'; // Rosa
    if (value === 'hibrido') return '#a855f7'; // Roxo

    return '#94a3b8'; // Fallback
  };

  // Tooltip simples para saber o que a cor significa
  const getTooltip = (_key: string, value: string) => {
    if (!value) return 'Sem registro';
    if (value === 'menos_50') return '< 50%';
    if (value === 'mais_50') return '> 50%';
    return value.charAt(0).toUpperCase() + value.slice(1); // Capitalize
  };

  return (
    <Card style={{ overflow: 'hidden', padding: 0 }}>
      {/* HEADER DO MÊS */}
      <div style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
        padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)',
        backgroundColor: '#f8fafc'
      }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'capitalize' }}>
          Consistência: {monthName}
        </h3>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => changeMonth(-1)} style={navBtnStyle}><ChevronLeft size={16} /></button>
          <button onClick={() => changeMonth(1)} style={navBtnStyle}><ChevronRight size={16} /></button>
        </div>
      </div>

      {/* TABELA COM SCROLL HORIZONTAL */}
      <div style={{ overflowX: 'auto', paddingBottom: '0.5rem' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              {/* Coluna Fixa (Sticky) */}
              <th style={{ 
                minWidth: '140px', position: 'sticky', left: 0, backgroundColor: 'white', zIndex: 20, 
                textAlign: 'left', paddingLeft: '1.5rem', borderRight: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9',
                fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase'
              }}>
                Métricas & Hábitos
              </th>
              
              {/* Colunas dos Dias */}
              {daysArray.map(day => {
                const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
                return (
                  <th key={day} style={{ 
                    minWidth: '34px', textAlign: 'center', fontSize: '0.7rem', 
                    color: isToday ? 'var(--primary)' : 'var(--text-secondary)',
                    fontWeight: isToday ? 800 : 400, 
                    backgroundColor: isToday ? '#f0f9ff' : 'transparent',
                    borderBottom: '1px solid #f1f5f9'
                  }}>
                    {day}
                  </th>
                );
              })}
            </tr>
          </thead>
          
          <tbody>
            {loading ? (
               <tr><td colSpan={daysInMonth + 1} style={{ padding: '2rem', textAlign: 'center' }}>Carregando...</td></tr>
            ) : (
              <>
                {/* --- SEÇÃO 1: MÉTRICAS (Bolinhas Coloridas) --- */}
                {FIXED_METRICS.map((metric) => (
                  <tr key={metric.key} style={{ borderBottom: '1px solid #f8fafc', backgroundColor: '#fafafa' }}>
                    <td style={{ 
                      padding: '0.6rem 0.5rem 0.6rem 1.5rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)',
                      position: 'sticky', left: 0, backgroundColor: '#fafafa', zIndex: 10, borderRight: '1px solid #f1f5f9',
                      display: 'flex', alignItems: 'center', gap: '8px'
                    }}>
                      {metric.icon} {metric.label}
                    </td>

                    {daysArray.map(day => {
                      const value = metricLogMap[`${metric.key}-${day}`];
                      const color = getMetricColor(metric.key, value);
                      const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();

                      return (
                        <td key={day} style={{ textAlign: 'center', padding: '0.3rem', backgroundColor: isToday ? '#f0f9ff' : 'transparent' }}>
                          <div 
                            title={getTooltip(metric.key, value)}
                            style={{ 
                              width: '10px', height: '10px', borderRadius: '50%', margin: '0 auto',
                              backgroundColor: color,
                              // Efeito sutil: se não tem valor, fica transparente
                              opacity: value ? 1 : 0.2
                            }} 
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}

                {/* Divisor Visual */}
                <tr><td colSpan={daysInMonth + 1} style={{ height: '4px', backgroundColor: '#f1f5f9' }}></td></tr>

                {/* --- SEÇÃO 2: HÁBITOS (Checks Verdes) --- */}
                {habits.map(habit => (
                  <tr key={habit.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                    <td style={{ 
                      padding: '0.6rem 0.5rem 0.6rem 1.5rem', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-primary)',
                      position: 'sticky', left: 0, backgroundColor: 'white', zIndex: 10, borderRight: '1px solid #f1f5f9',
                      whiteSpace: 'nowrap'
                    }}>
                      {habit.title}
                    </td>
                    
                    {daysArray.map(day => {
                      const isDone = habitLogMap.has(`${habit.id}-${day}`);
                      const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
                      
                      return (
                        <td key={day} style={{ textAlign: 'center', padding: '0.3rem', backgroundColor: isToday ? '#f0f9ff' : 'transparent' }}>
                          {isDone ? (
                            <div style={{ 
                              width: '18px', height: '18px', borderRadius: '4px', margin: '0 auto',
                              backgroundColor: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                              <Check size={12} color="white" strokeWidth={4} />
                            </div>
                          ) : (
                            <div style={{ width: '5px', height: '5px', borderRadius: '50%', margin: '0 auto', backgroundColor: '#f1f5f9' }} />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}

                {habits.length === 0 && (
                  <tr>
                    <td colSpan={daysInMonth + 1} style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                      Nenhum hábito cadastrado ainda no Diário.
                    </td>
                  </tr>
                )}
              </>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

const navBtnStyle: React.CSSProperties = {
  border: '1px solid var(--border-color)', backgroundColor: 'white', 
  borderRadius: '6px', width: '28px', height: '28px', 
  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
};