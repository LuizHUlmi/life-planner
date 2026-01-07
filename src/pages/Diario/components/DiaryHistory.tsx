import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Search, Loader2, Calendar, CheckCircle2 } from 'lucide-react';

interface DailyLog {
  id: number;
  date: string;
  weight: number;
  sleep_score: string;
  libido_score: string;
  diet_score: string;
  workout_type: string;
}

export function DiaryHistory() {
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [habitCounts, setHabitCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);

  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const [startDate, setStartDate] = useState(thirtyDaysAgo.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);

  async function fetchHistory() {
    try {
      setLoading(true);
      
      const { data: diaryData, error: diaryError } = await supabase
        .from('daily_logs')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });

      if (diaryError) throw diaryError;
      setLogs(diaryData || []);

      const { data: habitData, error: habitError } = await supabase
        .from('habit_logs')
        .select('date')
        .gte('date', startDate)
        .lte('date', endDate);

      if (habitError) throw habitError;

      const counts: Record<string, number> = {};
      habitData?.forEach((log) => {
        counts[log.date] = (counts[log.date] || 0) + 1;
      });
      setHabitCounts(counts);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchHistory();
  }, [startDate, endDate]);

  // HELPER PARA RENDERIZAR TAGS COLORIDAS
  const renderTag = (value: string) => {
    if (!value) return <span style={{color: '#94a3b8'}}>-</span>;
    
    let label = value;
    let bg = '#e2e8f0';
    let color = '#475569';

    // Mapeamento de Cores
    if (['pessimo', 'menos_50'].includes(value)) { bg = '#fee2e2'; color = '#ef4444'; label = value === 'menos_50' ? '< 50%' : 'Péssimo'; }
    if (['ok', 'mais_50'].includes(value)) { bg = '#fef3c7'; color = '#d97706'; label = value === 'mais_50' ? '> 50%' : 'OK'; }
    if (['otimo', 'otima', '100'].includes(value)) { bg = '#dcfce7'; color = '#16a34a'; label = value === '100' ? '100%' : 'Ótimo'; }
    
    if (value === 'musculacao') { label = 'Musculação'; bg = '#e0e7ff'; color = '#4338ca'; }
    if (value === 'cardio') { label = 'Cardio'; bg = '#fce7f3'; color = '#be185d'; }
    if (value === 'hibrido') { label = 'Híbrido'; bg = '#f3e8ff'; color = '#7e22ce'; }

    return (
      <span style={{ 
        backgroundColor: bg, color: color, 
        padding: '2px 8px', borderRadius: '6px', 
        fontSize: '0.75rem', fontWeight: 700, textTransform: 'capitalize' 
      }}>
        {label}
      </span>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      <Card style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'end', flexWrap: 'wrap' }}>
          <Input label="De:" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          <Input label="Até:" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
          <Button onClick={fetchHistory} variant="secondary" style={{ height: '42px', marginBottom: '1px' }}>
            <Search size={18} /> Filtrar
          </Button>
        </div>
      </Card>

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
            <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border-color)' }}>
              <tr>
                <th style={thStyle}>Data</th>
                <th style={thStyle}>Hábitos</th>
                <th style={thStyle}>Peso</th>
                <th style={thStyle}>Sono</th>
                <th style={thStyle}>Libido</th>
                <th style={thStyle}>Dieta</th>
                <th style={thStyle}>Treino</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ padding: '3rem', textAlign: 'center' }}><Loader2 className="animate-spin" style={{ margin: '0 auto' }} /></td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Nenhum registro.</td></tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                        <Calendar size={14} color="var(--primary)" />
                        {new Date(log.date).toLocaleDateString('pt-BR')}
                      </div>
                    </td>
                    <td style={tdStyle}>
                       {habitCounts[log.date] ? (
                         <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#166534', fontWeight: 600, fontSize: '0.85rem', backgroundColor: '#dcfce7', padding: '2px 8px', borderRadius: '12px', width: 'fit-content' }}>
                           <CheckCircle2 size={14} /> {habitCounts[log.date]}
                         </span>
                       ) : '-'}
                    </td>
                    <td style={tdStyle}>{log.weight ? <b>{log.weight} kg</b> : '-'}</td>
                    <td style={tdStyle}>{renderTag(log.sleep_score)}</td>
                    <td style={tdStyle}>{renderTag(log.libido_score)}</td>
                    <td style={tdStyle}>{renderTag(log.diet_score)}</td>
                    <td style={tdStyle}>{renderTag(log.workout_type)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

const thStyle: React.CSSProperties = { padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' };
const tdStyle: React.CSSProperties = { padding: '1rem', fontSize: '0.9rem', color: 'var(--text-primary)' };