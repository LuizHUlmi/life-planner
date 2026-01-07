import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

// UI
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { 
  Save, Calendar, Loader2, PenLine, History, 
  Scale, Moon, Heart, Utensils, Dumbbell, ChevronDown, ChevronUp, Plus, Trash2, Flame
} from 'lucide-react';

import { DiaryHistory } from './components/DiaryHistory';
import { HabitTracker } from './components/HabitTracker';

// --- TIPOS ---
// Tipos de Treino
interface SetData { reps: string; load: string; targetReps?: string; targetLoad?: string; }
interface ExerciseSession { id: string; name: string; notes: string; sets: SetData[]; }
interface SavedWorkout { id: number; name: string; exercises: any[]; }

// Tipos de Nutrição
interface Food { kcal: number; protein: number; carbs: number; fat: number; }
interface Meal { foods: Food[]; }
interface DietPlan { id: number; name: string; meals: Meal[]; }

// Helper: Select Rápido
function QuickSelector({ label, icon, options, value, onChange }: any) {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, marginBottom: '0.8rem', color: 'var(--text-primary)' }}>
        {icon} {label}
      </label>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {options.map((opt: any) => {
          const isSelected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              style={{
                flex: 1, padding: '0.8rem', borderRadius: '8px',
                border: isSelected ? `2px solid ${opt.color || 'var(--primary)'}` : '1px solid var(--border-color)',
                backgroundColor: isSelected ? (opt.color ? `${opt.color}20` : '#e0e7ff') : 'white',
                color: isSelected ? (opt.color || 'var(--primary)') : 'var(--text-secondary)',
                fontWeight: isSelected ? 700 : 400, cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.9rem'
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function Diario() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'form' | 'history'>('form');
  const [selectedDate, setSelectedDate] = useState(searchParams.get('date') || new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Estados Form
  const [weight, setWeight] = useState('');
  const [sleep, setSleep] = useState('');
  const [libido, setLibido] = useState('');
  const [dietScore, setDietScore] = useState(''); // 'off', 'mais_50', '100'
  const [workoutType, setWorkoutType] = useState('');

  // Estados Nutrição
  const [savedDiets, setSavedDiets] = useState<DietPlan[]>([]);
  const [selectedDietId, setSelectedDietId] = useState<string>('');

  // Estados Treino
  const [workoutDetails, setWorkoutDetails] = useState<ExerciseSession[]>([]);
  const [isWorkoutExpanded, setIsWorkoutExpanded] = useState(true);
  const [savedWorkouts, setSavedWorkouts] = useState<SavedWorkout[]>([]);
  const [historyMap, setHistoryMap] = useState<Record<string, SetData[]>>({});

  useEffect(() => {
    if (user && selectedDate && viewMode === 'form') {
      fetchDailyLog();
      fetchSavedWorkouts();
      fetchSavedDiets(); // Buscar dietas cadastradas
      fetchExerciseHistory();
    }
  }, [selectedDate, user, viewMode]);

  async function fetchSavedWorkouts() {
    const { data } = await supabase.from('workouts').select('*');
    if (data) setSavedWorkouts(data);
  }

  async function fetchSavedDiets() {
    const { data } = await supabase.from('diet_plans').select('*').order('name');
    if (data) setSavedDiets(data);
  }

  async function fetchExerciseHistory() {
    try {
      const { data } = await supabase
        .from('daily_logs')
        .select('workout_details, date')
        .eq('workout_type', 'academia')
        .lt('date', selectedDate)
        .order('date', { ascending: false })
        .limit(15);

      if (!data) return;
      const map: Record<string, SetData[]> = {};
      data.forEach(log => {
        if (Array.isArray(log.workout_details)) {
          log.workout_details.forEach((ex: any) => {
            const key = ex.name.trim().toLowerCase();
            if (!map[key] && Array.isArray(ex.sets)) map[key] = ex.sets;
          });
        }
      });
      setHistoryMap(map);
    } catch (error) { console.error(error); }
  }

  async function fetchDailyLog() {
    try {
      setLoading(true);
      const { data } = await supabase.from('daily_logs').select('*').eq('date', selectedDate).maybeSingle();
      
      if (data) {
        setWeight(data.weight ? String(data.weight) : '');
        setSleep(data.sleep_score || '');
        setLibido(data.libido_score || '');
        setDietScore(data.diet_score || '');
        setWorkoutType(data.workout_type || '');
        setSelectedDietId(data.diet_plan_id ? String(data.diet_plan_id) : '');
        
        if (Array.isArray(data.workout_details)) {
            const sanitizedExercises = data.workout_details.map((ex: any) => ({
                ...ex,
                sets: Array.isArray(ex.sets) ? ex.sets : [{ reps: '', load: '' }, { reps: '', load: '' }, { reps: '', load: '' }]
            }));
            setWorkoutDetails(sanitizedExercises);
        } else {
            setWorkoutDetails([]);
        }
      } else {
        resetForm();
      }
    } catch (error) { console.error(error); } finally { setLoading(false); }
  }

  function resetForm() {
    setWeight(''); setSleep(''); setLibido(''); setDietScore(''); setWorkoutType(''); 
    setWorkoutDetails([]); setSelectedDietId('');
  }

  // --- LÓGICA DE TREINO ---
  const importWorkout = (workoutId: string) => {
    const ficha = savedWorkouts.find(w => w.id === Number(workoutId));
    if (ficha && ficha.exercises) {
      const newDetails = ficha.exercises.map(ex => {
        const numberOfSets = Number(ex.sets) || 3; 
        const setsArray = Array.from({ length: numberOfSets }, () => ({
          reps: '', load: '', targetReps: ex.reps, targetLoad: ex.load
        }));
        return { id: crypto.randomUUID(), name: ex.name, notes: ex.notes, sets: setsArray };
      });
      setWorkoutDetails(newDetails);
      setIsWorkoutExpanded(true);
    }
  };

  const updateSet = (exerciseIndex: number, setIndex: number, field: keyof SetData, value: string) => {
    const newDetails = [...workoutDetails];
    if (newDetails[exerciseIndex] && newDetails[exerciseIndex].sets[setIndex]) {
        newDetails[exerciseIndex].sets[setIndex][field] = value;
        setWorkoutDetails(newDetails);
    }
  };

  const addExercise = () => {
    setWorkoutDetails([...workoutDetails, {
      id: crypto.randomUUID(), name: '', notes: '', sets: [{ reps: '', load: '' }, { reps: '', load: '' }, { reps: '', load: '' }]
    }]);
  };
  const removeExercise = (index: number) => { const list = [...workoutDetails]; list.splice(index, 1); setWorkoutDetails(list); };
  const updateExerciseName = (index: number, val: string) => { const list = [...workoutDetails]; list[index].name = val; setWorkoutDetails(list); };
  const getHistoryForSet = (exerciseName: string, setIndex: number) => {
    const key = exerciseName.trim().toLowerCase();
    const historySets = historyMap[key];
    if (historySets && historySets[setIndex]) return { load: historySets[setIndex].load, reps: historySets[setIndex].reps };
    return null;
  };

  // --- LÓGICA DE NUTRIÇÃO (Cálculo de Macros) ---
  const getDietSummary = () => {
    if (!selectedDietId) return null;
    const plan = savedDiets.find(d => d.id === Number(selectedDietId));
    if (!plan) return null;

    let totals = { kcal: 0, p: 0, c: 0, f: 0 };
    plan.meals?.forEach(m => {
      m.foods?.forEach(f => {
        totals.kcal += f.kcal || 0;
        totals.p += f.protein || 0;
        totals.c += f.carbs || 0;
        totals.f += f.fat || 0;
      });
    });
    return totals;
  };

  const dietSummary = getDietSummary();

  // Salvar
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = {
        user_id: user?.id,
        date: selectedDate,
        weight: weight ? Number(weight) : null,
        sleep_score: sleep, libido_score: libido, 
        
        // Nutrição Atualizada
        diet_score: dietScore, 
        diet_plan_id: (dietScore === 'off') ? null : (selectedDietId ? Number(selectedDietId) : null),

        workout_type: workoutType,
        workout_details: workoutType === 'nao_treinei' ? [] : workoutDetails
      };
      const { error } = await supabase.from('daily_logs').upsert(payload, { onConflict: 'user_id, date' });
      if (error) throw error;
      alert('Check-in salvo!');
      fetchExerciseHistory();
    } catch (e) { alert('Erro ao salvar'); } finally { setSaving(false); }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div><h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>Check-in Diário</h1></div>
        {viewMode === 'form' && <div style={{ width: '180px' }}><Input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}  /></div>}
      </header>

      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)', marginBottom: '2rem' }}>
        <button onClick={() => setViewMode('form')} style={viewMode === 'form' ? activeTabStyle : tabStyle}><PenLine size={18} /> Registar</button>
        <button onClick={() => setViewMode('history')} style={viewMode === 'history' ? activeTabStyle : tabStyle}><History size={18} /> Histórico</button>
      </div>

      {viewMode === 'history' ? <DiaryHistory /> : (
        loading ? <div style={{ textAlign: 'center', padding: '4rem' }}><Loader2 className="animate-spin" size={40} /></div> : (
          <div style={{ display: 'grid', gap: '2rem' }}>
            <HabitTracker date={selectedDate} />
            <form onSubmit={handleSave}>
              <Card>
                <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: 'var(--primary)', fontWeight: 600 }}>Métricas</h2>
                
                <div style={{ marginBottom: '2rem' }}><Input label="Peso (kg)" type="number" step="0.05" value={weight} onChange={e => setWeight(e.target.value)}  /></div>
                
                <QuickSelector label="Sono" icon={<Moon size={18} />} value={sleep} onChange={setSleep} options={[{ value: 'pessimo', label: 'Péssimo', color: '#ef4444' }, { value: 'ok', label: 'OK', color: '#f59e0b' }, { value: 'otimo', label: 'Ótimo', color: '#10b981' }]} />
                <QuickSelector label="Libido" icon={<Heart size={18} />} value={libido} onChange={setLibido} options={[{ value: 'pessimo', label: 'Péssimo', color: '#ef4444' }, { value: 'ok', label: 'OK', color: '#f59e0b' }, { value: 'otimo', label: 'Ótima', color: '#10b981' }]} />

                {/* --- SEÇÃO DE NUTRIÇÃO --- */}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
                    <QuickSelector 
                        label="Dieta" icon={<Utensils size={18} />} value={dietScore} onChange={setDietScore} 
                        options={[
                            { value: 'off', label: 'Off', color: '#ef4444' }, 
                            { value: 'mais_50', label: '> 50%', color: '#f59e0b' }, 
                            { value: '100', label: '100%', color: '#10b981' }
                        ]} 
                    />
                    
                    {/* Seletor de Plano Alimentar (Só aparece se não for Off) */}
                    {dietScore !== 'off' && dietScore !== '' && (
                        <div style={{ backgroundColor: '#f0fdf4', padding: '1rem', borderRadius: '12px', border: '1px solid #bbf7d0', animation: 'fadeIn 0.3s' }}>
                            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#166534', marginBottom: '0.5rem', display: 'block' }}>
                                Qual plano você seguiu?
                            </label>
                            <select 
                                value={selectedDietId}
                                onChange={(e) => setSelectedDietId(e.target.value)}
                                style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #86efac', backgroundColor: 'white', color: '#14532d' }}
                            >
                                <option value="" disabled>Selecione a dieta...</option>
                                {savedDiets.map(d => (
                                    <option key={d.id} value={d.id}>{d.name}</option>
                                ))}
                            </select>

                            {/* Resumo Visual dos Macros */}
                            {dietSummary && (
                                <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', justifyContent: 'space-around', borderTop: '1px dashed #86efac', paddingTop: '1rem' }}>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '0.75rem', color: '#15803d' }}>Calorias</div>
                                        <div style={{ fontWeight: 700, color: '#166534', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Flame size={12} fill="#166534" /> {Math.round(dietSummary.kcal)}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '0.75rem', color: '#15803d' }}>Prot</div>
                                        <div style={{ fontWeight: 700, color: '#166534' }}>{Math.round(dietSummary.p)}g</div>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '0.75rem', color: '#15803d' }}>Carb</div>
                                        <div style={{ fontWeight: 700, color: '#166534' }}>{Math.round(dietSummary.c)}g</div>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '0.75rem', color: '#15803d' }}>Gord</div>
                                        <div style={{ fontWeight: 700, color: '#166534' }}>{Math.round(dietSummary.f)}g</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* --- SEÇÃO DE TREINO --- */}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
                  <QuickSelector 
                    label="Treino" icon={<Dumbbell size={18} />} value={workoutType} onChange={(v: string) => { setWorkoutType(v); setIsWorkoutExpanded(true); }}
                    options={[{ value: 'nao_treinei', label: 'Off', color: '#94a3b8' }, { value: 'alternativo', label: 'Alternativo', color: '#ec4899' }, { value: 'academia', label: 'Academia', color: '#3b82f6' }]} 
                  />

                  {(workoutType === 'academia' || workoutType === 'alternativo') && (
                    <div style={{ backgroundColor: '#f8fafc', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                      <div onClick={() => setIsWorkoutExpanded(!isWorkoutExpanded)} style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', cursor: 'pointer', backgroundColor: '#f1f5f9' }}>
                        <span style={{ fontWeight: 600 }}>Log do Treino ({workoutDetails.length} ex.)</span>
                        {isWorkoutExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </div>

                      {isWorkoutExpanded && (
                        <div style={{ padding: '1rem' }}>
                          <div style={{ marginBottom: '1.5rem' }}>
                             <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Importar Ficha</label>
                             <select style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} onChange={(e) => importWorkout(e.target.value)} defaultValue="">
                               <option value="" disabled>Selecione...</option>
                               {savedWorkouts.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                             </select>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {workoutDetails.map((ex, exIndex) => (
                              <div key={ex.id} style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                                  <input 
                                    value={ex.name} onChange={e => updateExerciseName(exIndex, e.target.value)} 
                                    placeholder="Nome do Exercício"
                                    style={{ fontSize: '1rem', fontWeight: 700, border: 'none', borderBottom: '1px solid #e2e8f0', width: '80%', outline: 'none' }} 
                                  />
                                  <button type="button" onClick={() => removeExercise(exIndex)} style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={18} /></button>
                                </div>
                                
                                <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 1fr', gap: '0.5rem', marginBottom: '0.4rem', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700, textAlign: 'center' }}>
                                  <div>Set</div><div>Reps</div><div>Carga (kg)</div>
                                </div>

                                {Array.isArray(ex.sets) && ex.sets.map((set, setIndex) => {
                                  const historyData = getHistoryForSet(ex.name, setIndex);
                                  return (
                                    <div key={setIndex} style={{ position: 'relative', marginBottom: '0.8rem' }}>
                                      {historyData && (
                                        <div style={{ position: 'absolute', top: '-14px', right: '0', fontSize: '0.65rem', color: '#3b82f6', fontWeight: 600, display: 'flex', gap: '8px', paddingRight: '4px' }}>
                                          <span>Ant: {historyData.reps}x</span><span>{historyData.load}kg</span>
                                        </div>
                                      )}
                                      <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 1fr', gap: '0.5rem', alignItems: 'center' }}>
                                        <div style={{ textAlign: 'center', fontWeight: 600, color: 'var(--primary)', backgroundColor: '#eff6ff', borderRadius: '4px', padding: '4px' }}>{setIndex + 1}</div>
                                        <input value={set.reps} onChange={e => updateSet(exIndex, setIndex, 'reps', e.target.value)} placeholder={set.targetReps ? `Meta: ${set.targetReps}` : 'Reps'} style={inputTableStyle} />
                                        <input value={set.load} onChange={e => updateSet(exIndex, setIndex, 'load', e.target.value)} placeholder={set.targetLoad ? `Meta: ${set.targetLoad}` : 'kg'} style={inputTableStyle} />
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            ))}
                          </div>
                          <Button type="button" variant="secondary"  onClick={addExercise} style={{ marginTop: '1rem', width: '100%' }}><Plus size={14} /> Adicionar Exercício</Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
                  <Button type="submit" disabled={saving}>{saving ? <Loader2 className="animate-spin" /> : <><Save size={18} /> Salvar</>}</Button>
                </div>
              </Card>
            </form>
          </div>
        )
      )}
    </div>
  );
}

const activeTabStyle = { display: 'flex', alignItems: 'center', gap: '8px', padding: '0.8rem 1rem', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, color: 'var(--primary)', borderBottom: '2px solid var(--primary)' };
const tabStyle = { display: 'flex', alignItems: 'center', gap: '8px', padding: '0.8rem 1rem', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 400, color: 'var(--text-secondary)', borderBottom: '2px solid transparent' };
const inputTableStyle = { width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #e2e8f0', textAlign: 'center' as const, fontSize: '0.9rem' };