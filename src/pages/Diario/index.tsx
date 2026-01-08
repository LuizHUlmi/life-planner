import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

// Estilos
import styles from './Diario.module.css';

// Componentes UI
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { DiaryHistory } from './components/DiaryHistory';
import { HabitTracker } from './components/HabitTracker';

// Ícones
import { 
  Save, Loader2, PenLine, History, 
  Moon, Heart, Utensils, Dumbbell, ChevronDown, ChevronUp, Plus, Trash2, Flame
} from 'lucide-react';

// --- TIPOS ---
interface SetData { reps: string; load: string; targetReps?: string; targetLoad?: string; }
interface ExerciseSession { id: string; name: string; notes: string; sets: SetData[]; }
interface SavedWorkout { id: number; name: string; exercises: any[]; }
interface Food { kcal: number; protein: number; carbs: number; fat: number; }
interface Meal { foods: Food[]; }
interface DietPlan { id: number; name: string; meals: Meal[]; }

// Componente Helper: Select Rápido (Refatorado com CSS Modules)
function QuickSelector({ label, icon, options, value, onChange }: any) {
  return (
    <div className={styles.qsContainer}>
      <label className={styles.qsLabel}>
        {icon} {label}
      </label>
      <div className={styles.qsOptions}>
        {options.map((opt: any) => {
          const isSelected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`${styles.qsButton} ${isSelected ? styles.qsButtonSelected : ''}`}
              style={isSelected ? { 
                borderColor: opt.color, 
                backgroundColor: `${opt.color}15`, 
                color: opt.color 
              } : {}}
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
  const [dietScore, setDietScore] = useState(''); 
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
      fetchSavedDiets();
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

  // Lógica Treino
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

  // Lógica Nutrição
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = {
        user_id: user?.id,
        date: selectedDate,
        weight: weight ? Number(weight) : null,
        sleep_score: sleep, libido_score: libido, 
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
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Check-in</h1>
        {viewMode === 'form' && (
          <div className={styles.dateWrapper}>
            <Input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
          </div>
        )}
      </header>

      <div className={styles.tabContainer}>
        <button onClick={() => setViewMode('form')} className={`${styles.tab} ${viewMode === 'form' ? styles.activeTab : ''}`}>
          <PenLine size={18} /> Registrar
        </button>
        <button onClick={() => setViewMode('history')} className={`${styles.tab} ${viewMode === 'history' ? styles.activeTab : ''}`}>
          <History size={18} /> Histórico
        </button>
      </div>

      {viewMode === 'history' ? <DiaryHistory /> : (
        loading ? <div style={{ textAlign: 'center', padding: '4rem' }}><Loader2 className="animate-spin" size={40} /></div> : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            <HabitTracker date={''} />
            
            <form onSubmit={handleSave}>
              <Card>
                <div className={styles.sectionTitle}>Métricas Básicas</div>
                
                <div className={styles.inputGroup}>
                   <Input label="Peso (kg)" type="number" step="0.05" value={weight} onChange={e => setWeight(e.target.value)} />
                </div>
                
                <QuickSelector 
                  label="Sono" icon={<Moon size={18} />} value={sleep} onChange={setSleep} 
                  options={[{ value: 'pessimo', label: 'Péssimo', color: '#ef4444' }, { value: 'ok', label: 'OK', color: '#f59e0b' }, { value: 'otimo', label: 'Ótimo', color: '#10b981' }]} 
                />
                <QuickSelector 
                  label="Libido" icon={<Heart size={18} />} value={libido} onChange={setLibido} 
                  options={[{ value: 'pessimo', label: 'Péssima', color: '#ef4444' }, { value: 'ok', label: 'OK', color: '#f59e0b' }, { value: 'otimo', label: 'Alta', color: '#10b981' }]} 
                />

                {/* --- NUTRIÇÃO --- */}
                <div className={styles.nutritionSection}>
                    <QuickSelector 
                        label="Dieta" icon={<Utensils size={18} />} value={dietScore} onChange={setDietScore} 
                        options={[
                            { value: 'off', label: 'Off', color: '#ef4444' }, 
                            { value: 'mais_50', label: '> 50%', color: '#f59e0b' }, 
                            { value: '100', label: '100%', color: '#10b981' }
                        ]} 
                    />
                    
                    {dietScore !== 'off' && dietScore !== '' && (
                        <div className={styles.dietPlanBox}>
                            <label className={styles.dietLabel}>Qual plano você seguiu?</label>
                            <select 
                                value={selectedDietId} onChange={(e) => setSelectedDietId(e.target.value)}
                                className={styles.dietSelect}
                            >
                                <option value="" disabled>Selecione a dieta...</option>
                                {savedDiets.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>

                            {dietSummary && (
                                <div className={styles.macroGrid}>
                                    <div className={styles.macroItem}>
                                        <div className={styles.macroLabel}>Calorias</div>
                                        <div className={styles.macroValue}><Flame size={12} /> {Math.round(dietSummary.kcal)}</div>
                                    </div>
                                    <div className={styles.macroItem}>
                                        <div className={styles.macroLabel}>Prot</div>
                                        <div className={styles.macroValue}>{Math.round(dietSummary.p)}g</div>
                                    </div>
                                    <div className={styles.macroItem}>
                                        <div className={styles.macroLabel}>Carb</div>
                                        <div className={styles.macroValue}>{Math.round(dietSummary.c)}g</div>
                                    </div>
                                    <div className={styles.macroItem}>
                                        <div className={styles.macroLabel}>Gord</div>
                                        <div className={styles.macroValue}>{Math.round(dietSummary.f)}g</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* --- TREINO --- */}
                <div className={styles.workoutSection}>
                  <QuickSelector 
                    label="Treino" icon={<Dumbbell size={18} />} value={workoutType} onChange={(v: string) => { setWorkoutType(v); setIsWorkoutExpanded(true); }}
                    options={[{ value: 'nao_treinei', label: 'Off', color: '#94a3b8' }, { value: 'alternativo', label: 'Outro', color: '#ec4899' }, { value: 'academia', label: 'Gym', color: '#3b82f6' }]} 
                  />

                  {(workoutType === 'academia' || workoutType === 'alternativo') && (
                    <div className={styles.workoutCard}>
                      <div className={styles.workoutHeader} onClick={() => setIsWorkoutExpanded(!isWorkoutExpanded)}>
                        <span>Log do Treino ({workoutDetails.length} ex.)</span>
                        {isWorkoutExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </div>

                      {isWorkoutExpanded && (
                        <div className={styles.workoutBody}>
                          <div style={{ marginBottom: '1.5rem' }}>
                             <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Importar Ficha</label>
                             <select style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} onChange={(e) => importWorkout(e.target.value)} defaultValue="">
                               <option value="" disabled>Selecione...</option>
                               {savedWorkouts.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                             </select>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {workoutDetails.map((ex, exIndex) => (
                              <div key={ex.id} className={styles.exerciseCard}>
                                <div className={styles.exerciseHeader}>
                                  <input 
                                    value={ex.name} onChange={e => updateExerciseName(exIndex, e.target.value)} 
                                    placeholder="Nome do Exercício"
                                    className={styles.exerciseNameInput}
                                  />
                                  <button type="button" onClick={() => removeExercise(exIndex)} className={styles.deleteBtn}><Trash2 size={18} /></button>
                                </div>
                                
                                <div className={styles.setGridHeader}>
                                  <div>Set</div><div>Reps</div><div>Carga</div>
                                </div>

                                {Array.isArray(ex.sets) && ex.sets.map((set, setIndex) => {
                                  const historyData = getHistoryForSet(ex.name, setIndex);
                                  return (
                                    <div key={setIndex} className={styles.setRow}>
                                      {historyData && (
                                        <div className={styles.historyBadge}>
                                          {historyData.reps}x {historyData.load}kg
                                        </div>
                                      )}
                                      <div className={styles.setIndex}>{setIndex + 1}</div>
                                      <input 
                                        type="number"
                                        value={set.reps} onChange={e => updateSet(exIndex, setIndex, 'reps', e.target.value)} 
                                        placeholder={set.targetReps || '-'} 
                                        className={styles.setInput} 
                                      />
                                      <input 
                                        type="number"
                                        value={set.load} onChange={e => updateSet(exIndex, setIndex, 'load', e.target.value)} 
                                        placeholder={set.targetLoad || '-'} 
                                        className={styles.setInput} 
                                      />
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

                <div className={styles.footerActions}>
                  <Button type="submit" disabled={saving}>{saving ? <Loader2 className="animate-spin" /> : <><Save size={18} /> Salvar Check-in</>}</Button>
                </div>
              </Card>
            </form>
          </div>
        )
      )}
    </div>
  );
}