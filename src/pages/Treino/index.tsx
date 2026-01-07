import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { 
  Plus, Dumbbell, Trash2, Save, X, Loader2, FileText, History, Calendar, ChevronDown, ChevronUp
} from 'lucide-react';

// --- TIPOS ---
interface Exercise {
  id: string;
  name: string;
  sets: string;
  reps: string;
  load: string;
  notes: string;
}

interface Workout {
  id: number;
  name: string;
  description: string;
  exercises: Exercise[];
}

// Tipos para o Histórico (Vindo do Diário)
interface ExecutedSet {
  reps: string;
  load: string;
}
interface ExecutedExercise {
  name: string;
  sets: ExecutedSet[];
}
interface WorkoutLog {
  id: number;
  date: string;
  workout_type: string;
  workout_details: ExecutedExercise[];
}

export function Treino() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // Controle de Abas: 'templates' (Fichas) ou 'history' (Execução)
  const [activeTab, setActiveTab] = useState<'templates' | 'history'>('templates');

  // --- ESTADOS: FICHAS ---
  const [mode, setMode] = useState<'list' | 'edit'>('list');
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formExercises, setFormExercises] = useState<Exercise[]>([]);

  // --- ESTADOS: HISTÓRICO ---
  const [historyLogs, setHistoryLogs] = useState<WorkoutLog[]>([]);
  const [expandedLogId, setExpandedLogId] = useState<number | null>(null);

  useEffect(() => {
    if (user) {
      if (activeTab === 'templates') fetchWorkouts();
      if (activeTab === 'history') fetchHistory();
    }
  }, [user, activeTab]);

  // --- BUSCAR DADOS ---
  async function fetchWorkouts() {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('workouts').select('*').order('name', { ascending: true });
      if (error) throw error;
      setWorkouts(data || []);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  }

  async function fetchHistory() {
    try {
      setLoading(true);
      // Busca logs onde o tipo não é 'nao_treinei' e ordena por data decrescente
      const { data, error } = await supabase
        .from('daily_logs')
        .select('id, date, workout_type, workout_details')
        .neq('workout_type', 'nao_treinei')
        .not('workout_type', 'is', null) // Garante que tem tipo
        .order('date', { ascending: false })
        .limit(30); // Limita aos últimos 30 treinos para não pesar

      if (error) throw error;
      
      // Filtra apenas os que tem detalhes válidos
      const validLogs = (data || []).filter(log => Array.isArray(log.workout_details) && log.workout_details.length > 0);
      setHistoryLogs(validLogs);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  }

  // --- LOGICA DE FORMULÁRIO (Fichas) ---
  const handleNewWorkout = () => {
    setCurrentId(null); setFormName(''); setFormDesc('');
    setFormExercises([{ id: crypto.randomUUID(), name: '', sets: '3', reps: '', load: '', notes: '' }]);
    setMode('edit');
  };

  const handleEditWorkout = (workout: Workout) => {
    setCurrentId(workout.id); setFormName(workout.name); setFormDesc(workout.description || '');
    setFormExercises(workout.exercises || []);
    setMode('edit');
  };

  const addExerciseRow = () => {
    setFormExercises([...formExercises, { id: crypto.randomUUID(), name: '', sets: '3', reps: '', load: '', notes: '' }]);
  };

  const removeExerciseRow = (index: number) => {
    const newList = [...formExercises]; newList.splice(index, 1); setFormExercises(newList);
  };

  const updateExercise = (index: number, field: keyof Exercise, value: string) => {
    const newList = [...formExercises]; newList[index] = { ...newList[index], [field]: value };
    setFormExercises(newList);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !user) return;
    try {
      const payload = { user_id: user.id, name: formName, description: formDesc, exercises: formExercises };
      if (currentId) await supabase.from('workouts').update(payload).eq('id', currentId);
      else await supabase.from('workouts').insert([payload]);
      await fetchWorkouts(); setMode('list');
    } catch (error) { alert('Erro ao salvar ficha.'); }
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Excluir esta ficha?')) return;
    await supabase.from('workouts').delete().eq('id', id);
    setWorkouts(workouts.filter(w => w.id !== id));
  };

  const toggleExpandLog = (id: number) => {
    setExpandedLogId(expandedLogId === id ? null : id);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* HEADER E ABAS */}
      <header style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>Gestão de Treino</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Planeje suas fichas e revise seu histórico.</p>
          </div>
          {activeTab === 'templates' && mode === 'list' && (
            <Button onClick={handleNewWorkout}><Plus size={18} /> Nova Ficha</Button>
          )}
        </div>

        {/* ABAS */}
        <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)' }}>
          <button 
            onClick={() => setActiveTab('templates')}
            style={activeTab === 'templates' ? activeTabStyle : tabStyle}
          >
            <FileText size={18} /> Minhas Fichas
          </button>
          
          <button 
            onClick={() => setActiveTab('history')}
            style={activeTab === 'history' ? activeTabStyle : tabStyle}
          >
            <History size={18} /> Histórico Realizado
          </button>
        </div>
      </header>

      {/* --- CONTEÚDO DA ABA: FICHAS (TEMPLATES) --- */}
      {activeTab === 'templates' && (
        <>
          {loading && mode === 'list' && <Loader2 className="animate-spin" style={{ margin: '0 auto' }} />}

          {!loading && mode === 'list' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {workouts.length === 0 ? (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Nenhuma ficha criada ainda.</div>
              ) : (
                workouts.map(workout => (
                  <Card key={workout.id} onClick={() => handleEditWorkout(workout)} style={{ cursor: 'pointer', padding: 0, overflow: 'hidden', position: 'relative' }} className="hover:shadow-lg hover:-translate-y-1">
                    <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', backgroundColor: 'var(--primary)' }} />
                    <div style={{ padding: '1.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                          <div style={{ width: '48px', height: '48px', backgroundColor: '#e0e7ff', color: 'var(--primary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Dumbbell size={24} /></div>
                          <div><h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>{workout.name}</h3><span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{workout.exercises?.length || 0} exercícios</span></div>
                        </div>
                        <button onClick={(e) => handleDelete(workout.id, e)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#cbd5e1' }}><Trash2 size={18} /></button>
                      </div>
                      {workout.exercises?.slice(0, 3).map((ex, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', marginBottom: '4px' }}>
                          <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--primary)' }} />
                          <span style={{ flex: 1 }}>{ex.name}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{ex.sets} séries</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}

          {mode === 'edit' && (
            <form onSubmit={handleSave}>
              <Card style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                  <h3>{currentId ? 'Editar Ficha' : 'Criar Ficha'}</h3>
                  <Button type="button" variant="secondary" onClick={() => setMode('list')}>Cancelar</Button>
                </div>
                <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
                  <Input label="Nome" value={formName} onChange={e => setFormName(e.target.value)} required />
                  <Input label="Descrição" value={formDesc} onChange={e => setFormDesc(e.target.value)} />
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '12px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr 2fr auto', gap: '0.8rem', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                    <div>Exercício</div><div>Séries</div><div>Reps</div><div>Carga</div><div>Obs</div><div></div>
                  </div>
                  {formExercises.map((ex, index) => (
                    <div key={ex.id} style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr 2fr auto', gap: '0.8rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <Input placeholder="Nome" value={ex.name} onChange={e => updateExercise(index, 'name', e.target.value)} />
                      <select 
                        value={ex.sets} onChange={e => updateExercise(index, 'sets', e.target.value)}
                        style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'white' }}
                      >
                        {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
                      </select>
                      <Input placeholder="10-12" value={ex.reps} onChange={e => updateExercise(index, 'reps', e.target.value)} />
                      <Input placeholder="kg" value={ex.load} onChange={e => updateExercise(index, 'load', e.target.value)} />
                      <Input placeholder="Obs" value={ex.notes} onChange={e => updateExercise(index, 'notes', e.target.value)} />
                      <button type="button" onClick={() => removeExerciseRow(index)} style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer' }}><X size={16} /></button>
                    </div>
                  ))}
                  <Button type="button" variant="secondary" onClick={addExerciseRow} ><Plus size={16} /> Adicionar Exercício</Button>
                </div>
                <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                  <Button type="submit"><Save size={18} /> Salvar Ficha</Button>
                </div>
              </Card>
            </form>
          )}
        </>
      )}

      {/* --- CONTEÚDO DA ABA: HISTÓRICO --- */}
      {activeTab === 'history' && (
        <div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}><Loader2 className="animate-spin" style={{ margin: '0 auto' }} /></div>
          ) : historyLogs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)', border: '2px dashed var(--border-color)', borderRadius: '12px' }}>
              Nenhum treino registrado no Diário ainda.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {historyLogs.map(log => {
                const isExpanded = expandedLogId === log.id;
                return (
                  <Card key={log.id} style={{ padding: '0', overflow: 'hidden' }}>
                    {/* Linha Resumo (Clicável) */}
                    <div 
                      onClick={() => toggleExpandLog(log.id)}
                      style={{ 
                        padding: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                        cursor: 'pointer', backgroundColor: isExpanded ? '#f8fafc' : 'white',
                        transition: 'background 0.2s'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          <Calendar size={18} color="var(--primary)" />
                          {new Date(log.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                        </div>
                        
                        <div style={{ 
                          padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'capitalize',
                          backgroundColor: log.workout_type === 'academia' ? '#e0e7ff' : '#fce7f3',
                          color: log.workout_type === 'academia' ? '#4338ca' : '#be185d'
                        }}>
                          {log.workout_type}
                        </div>

                        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                           {log.workout_details.length} Exercícios
                        </div>
                      </div>

                      <div style={{ color: 'var(--text-secondary)' }}>
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </div>
                    </div>

                    {/* Conteúdo Expandido (Tabela Detalhada) */}
                    {isExpanded && (
                      <div style={{ padding: '0 1.2rem 1.2rem 1.2rem', backgroundColor: '#f8fafc', borderTop: '1px solid var(--border-color)' }}>
                        <div style={{ marginTop: '1rem', display: 'grid', gap: '0.8rem' }}>
                          {log.workout_details.map((exercise, idx) => (
                            <div key={idx} style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                              <div style={{ fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                                {exercise.name || 'Exercício sem nome'}
                              </div>
                              
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {exercise.sets.map((set, sIdx) => (
                                  <div key={sIdx} style={{ 
                                    padding: '6px 10px', backgroundColor: '#f1f5f9', borderRadius: '6px', 
                                    fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px'
                                  }}>
                                    <span style={{ fontWeight: 600, color: 'var(--primary)' }}>#{sIdx + 1}</span>
                                    <span style={{ color: '#475569' }}>{set.reps || '-'} reps</span>
                                    <span style={{ color: '#0f172a', fontWeight: 600 }}>{set.load ? `${set.load}kg` : '-'}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
}

// Estilos
const activeTabStyle = { display: 'flex', alignItems: 'center', gap: '8px', padding: '0.8rem 1rem', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, color: 'var(--primary)', borderBottom: '2px solid var(--primary)' };
const tabStyle = { display: 'flex', alignItems: 'center', gap: '8px', padding: '0.8rem 1rem', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 400, color: 'var(--text-secondary)', borderBottom: '2px solid transparent' };