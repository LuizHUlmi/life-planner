import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
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
  Moon, Heart, Utensils, Dumbbell, ChevronDown, ChevronUp, Plus, Trash2, Wallet, CheckCircle2, Activity
} from 'lucide-react';

// Tipos
interface SetData { reps: string; load: string; targetReps?: string; targetLoad?: string; }
interface ExerciseSession { id: string; name: string; notes: string; sets: SetData[]; }
interface SavedWorkout { id: number; name: string; exercises: any[]; }
interface DietPlan { id: number; name: string; meals: any[]; }

// Select Rápido
function QuickSelector({ label, icon, options, value, onChange }: any) {
  return (
    <div className={styles.qsContainer}>
      <label className={styles.qsLabel}>{icon} {label}</label>
      <div className={styles.qsOptions}>
        {options.map((opt: any) => {
          const isSelected = value === opt.value;
          return (
            <button
              key={opt.value} type="button" onClick={() => onChange(opt.value)}
              className={`${styles.qsButton} ${isSelected ? styles.qsButtonSelected : ''}`}
              style={isSelected ? { borderColor: opt.color, backgroundColor: `${opt.color}15`, color: opt.color } : {}}
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
  const location = useLocation();
  
  const [viewMode, setViewMode] = useState<'form' | 'history'>('form');
  const [selectedDate, setSelectedDate] = useState(searchParams.get('date') || new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Refs para Scroll
  const metricsRef = useRef<HTMLDivElement>(null);
  const nutritionRef = useRef<HTMLDivElement>(null);
  const workoutRef = useRef<HTMLDivElement>(null);
  const financeRef = useRef<HTMLDivElement>(null);

  // Scroll Automático
  useEffect(() => {
    if (location.hash) {
      const section = location.hash.replace('#', '');
      let element = null;
      if (section === 'metrics') element = metricsRef.current;
      else if (section === 'nutricao') element = nutritionRef.current;
      else if (section === 'treino') element = workoutRef.current;
      else if (section === 'financeiro') element = financeRef.current;

      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      }
    }
  }, [location.hash, viewMode]);

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

  // Estados Financeiro
  const [finDesc, setFinDesc] = useState('');
  const [finAmount, setFinAmount] = useState('');
  const [finCategory, setFinCategory] = useState('Alimentação');
  const [savingFinance, setSavingFinance] = useState(false);

  useEffect(() => {
    if (user && selectedDate && viewMode === 'form') {
      fetchDailyLog();
      fetchSavedWorkouts();
      fetchSavedDiets();
      fetchExerciseHistory();
    }
  }, [selectedDate, user, viewMode]);

  // Funções de Fetch
  async function fetchSavedWorkouts() { const { data } = await supabase.from('workouts').select('*'); if (data) setSavedWorkouts(data); }
  async function fetchSavedDiets() { const { data } = await supabase.from('diet_plans').select('*').order('name'); if (data) setSavedDiets(data); }
  async function fetchExerciseHistory() { 
      const { data } = await supabase.from('daily_logs').select('workout_details').eq('workout_type', 'academia').lt('date', selectedDate).order('date', { ascending: false }).limit(10);
      if (!data) return;
      const map: Record<string, SetData[]> = {};
      data.forEach(log => { if (Array.isArray(log.workout_details)) { log.workout_details.forEach((ex: any) => { const key = ex.name.trim().toLowerCase(); if (!map[key] && Array.isArray(ex.sets)) map[key] = ex.sets; }); }});
      setHistoryMap(map);
  }
  async function fetchDailyLog() {
    try { setLoading(true); const { data } = await supabase.from('daily_logs').select('*').eq('date', selectedDate).maybeSingle();
      if (data) {
        setWeight(data.weight ? String(data.weight) : ''); setSleep(data.sleep_score || ''); setLibido(data.libido_score || ''); setDietScore(data.diet_score || ''); setWorkoutType(data.workout_type || ''); setSelectedDietId(data.diet_plan_id ? String(data.diet_plan_id) : '');
        if (Array.isArray(data.workout_details)) { setWorkoutDetails(data.workout_details.map((ex: any) => ({ ...ex, sets: Array.isArray(ex.sets) ? ex.sets : [{ reps: '', load: '' }, { reps: '', load: '' }, { reps: '', load: '' }] }))); } else setWorkoutDetails([]);
      } else resetForm();
    } catch (error) { console.error(error); } finally { setLoading(false); }
  }
  function resetForm() { setWeight(''); setSleep(''); setLibido(''); setDietScore(''); setWorkoutType(''); setWorkoutDetails([]); setSelectedDietId(''); }

  // Actions
  const handleSaveDaily = async (e: React.FormEvent) => {
    e.preventDefault();
    try { setSaving(true); const payload = { user_id: user?.id, date: selectedDate, weight: weight ? Number(weight) : null, sleep_score: sleep, libido_score: libido, diet_score: dietScore, diet_plan_id: (dietScore === 'off') ? null : (selectedDietId ? Number(selectedDietId) : null), workout_type: workoutType, workout_details: workoutType === 'nao_treinei' ? [] : workoutDetails }; await supabase.from('daily_logs').upsert(payload, { onConflict: 'user_id, date' }); alert('Check-in salvo!'); } catch (e) { alert('Erro'); } finally { setSaving(false); }
  };

  const handleQuickFinance = async () => {
    if (!finDesc || !finAmount || !user) return;
    try { setSavingFinance(true); const { error } = await supabase.from('transactions').insert([{ user_id: user.id, description: finDesc, amount: Number(finAmount), type: 'expense', category: finCategory, cost_type: 'variable', date: selectedDate }]); if (error) throw error; alert('Gasto lançado!'); setFinDesc(''); setFinAmount(''); } catch (e) { alert('Erro ao lançar gasto'); } finally { setSavingFinance(false); }
  };

  // Helpers Treino
  const importWorkout = (workoutId: string) => { const ficha = savedWorkouts.find(w => w.id === Number(workoutId)); if (ficha?.exercises) { setWorkoutDetails(ficha.exercises.map(ex => ({ id: crypto.randomUUID(), name: ex.name, notes: ex.notes, sets: Array.from({ length: Number(ex.sets) || 3 }, () => ({ reps: '', load: '', targetReps: ex.reps, targetLoad: ex.load })) }))); setIsWorkoutExpanded(true); } };
  const updateSet = (exIdx: number, sIdx: number, field: keyof SetData, val: string) => { const newD = [...workoutDetails]; newD[exIdx].sets[sIdx][field] = val; setWorkoutDetails(newD); };
  const addExercise = () => setWorkoutDetails([...workoutDetails, { id: crypto.randomUUID(), name: '', notes: '', sets: [{ reps: '', load: '' }, { reps: '', load: '' }, { reps: '', load: '' }] }]);
  const removeExercise = (i: number) => { const l = [...workoutDetails]; l.splice(i, 1); setWorkoutDetails(l); };
  const updateExerciseName = (i: number, v: string) => { const l = [...workoutDetails]; l[i].name = v; setWorkoutDetails(l); };
  const getHistoryForSet = (name: string, idx: number) => { const sets = historyMap[name.trim().toLowerCase()]; return sets && sets[idx] ? { load: sets[idx].load, reps: sets[idx].reps } : null; };

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
        <button onClick={() => setViewMode('form')} className={`${styles.tab} ${viewMode === 'form' ? styles.activeTab : ''}`}><PenLine size={18} /> Registrar</button>
        <button onClick={() => setViewMode('history')} className={`${styles.tab} ${viewMode === 'history' ? styles.activeTab : ''}`}><History size={18} /> Histórico</button>
      </div>

      {viewMode === 'history' ? <DiaryHistory /> : (
        loading ? <div style={{ textAlign: 'center', padding: '4rem' }}><Loader2 className="animate-spin" size={40} /></div> : (
          
          /* GRID DE CARDS SEPARADOS */
          <form onSubmit={handleSaveDaily} className={styles.formGrid}>
            
            {/* 1. MÉTRICAS + HÁBITOS */}
            <Card id="metrics" ref={metricsRef}>
              <div className={styles.sectionTitle}><Activity size={18} /> Métricas & Hábitos</div>
              
              <HabitTracker date={selectedDate} />

              <div style={{ borderTop: '1px solid var(--border-color)', margin: '1rem 0' }}></div>

              <div className={styles.inputGroup}>
                 <Input label="Peso (kg)" type="number" step="0.05" value={weight} onChange={e => setWeight(e.target.value)} />
              </div>
              
              <QuickSelector label="Sono" icon={<Moon size={18} />} value={sleep} onChange={setSleep} options={[{ value: 'pessimo', label: 'Péssimo', color: '#ef4444' }, { value: 'ok', label: 'OK', color: '#f59e0b' }, { value: 'otimo', label: 'Ótimo', color: '#10b981' }]} />
              <QuickSelector label="Libido" icon={<Heart size={18} />} value={libido} onChange={setLibido} options={[{ value: 'pessimo', label: 'Baixa', color: '#ef4444' }, { value: 'ok', label: 'OK', color: '#f59e0b' }, { value: 'otimo', label: 'Alta', color: '#10b981' }]} />
            </Card>

            {/* 2. FINANCEIRO */}
            <Card id="financeiro" ref={financeRef}>
              <div className={styles.sectionTitle}><Wallet size={18} /> Gasto Rápido</div>
              <div className={styles.financeCard}>
                 <div className={styles.financeInputs}>
                    <div className={styles.financeRow}>
                       <input placeholder="O que comprou?" value={finDesc} onChange={e => setFinDesc(e.target.value)} className={styles.dietSelect} />
                       <input type="number" placeholder="R$" value={finAmount} onChange={e => setFinAmount(e.target.value)} className={styles.dietSelect} />
                    </div>
                    <select value={finCategory} onChange={e => setFinCategory(e.target.value)} className={styles.dietSelect}>
                        <option value="Alimentação">Alimentação</option>
                        <option value="Transporte">Transporte</option>
                        <option value="Lazer">Lazer</option>
                        <option value="Outros">Outros</option>
                    </select>
                 </div>
                 <button type="button" onClick={handleQuickFinance} disabled={savingFinance || !finDesc || !finAmount} className={styles.financeBtn}>
                    {savingFinance ? <Loader2 className="animate-spin" size={18} /> : <><CheckCircle2 size={18} /> Lançar Despesa</>}
                 </button>
              </div>
            </Card>

            {/* 3. NUTRIÇÃO */}
            <Card id="nutricao" ref={nutritionRef}>
                <div className={styles.sectionTitle}><Utensils size={18} /> Nutrição</div>
                <QuickSelector label="Dieta" icon={<Utensils size={18} />} value={dietScore} onChange={setDietScore} options={[{ value: 'off', label: 'Off', color: '#ef4444' }, { value: 'mais_50', label: '> 50%', color: '#f59e0b' }, { value: '100', label: '100%', color: '#10b981' }]} />
                {dietScore !== 'off' && dietScore !== '' && (
                    <div className={styles.dietPlanBox}>
                        <label className={styles.dietLabel}>Qual plano você seguiu?</label>
                        <select value={selectedDietId} onChange={(e) => setSelectedDietId(e.target.value)} className={styles.dietSelect}>
                            <option value="" disabled>Selecione...</option>
                            {savedDiets.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                    </div>
                )}
            </Card>

            {/* 4. TREINO */}
            <Card id="treino" ref={workoutRef}>
              <div className={styles.sectionTitle}><Dumbbell size={18} /> Treino</div>
              <QuickSelector label="Hoje" icon={<Dumbbell size={18} />} value={workoutType} onChange={(v: string) => { setWorkoutType(v); setIsWorkoutExpanded(true); }} options={[{ value: 'nao_treinei', label: 'Off', color: '#94a3b8' }, { value: 'alternativo', label: 'Outro', color: '#ec4899' }, { value: 'academia', label: 'Gym', color: '#3b82f6' }]} />

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
                      {workoutDetails.map((ex, exIndex) => (
                          <div key={ex.id} className={styles.exerciseCard}>
                            <div className={styles.exerciseHeader}>
                              <input value={ex.name} onChange={e => updateExerciseName(exIndex, e.target.value)} className={styles.exerciseNameInput} placeholder="Exercício" />
                              <button type="button" onClick={() => removeExercise(exIndex)} className={styles.deleteBtn}><Trash2 size={18} /></button>
                            </div>
                            {Array.isArray(ex.sets) && ex.sets.map((set, setIndex) => (
                                <div key={setIndex} className={styles.setRow}>
                                  {getHistoryForSet(ex.name, setIndex) && <div className={styles.historyBadge}>{getHistoryForSet(ex.name, setIndex)?.reps}x {getHistoryForSet(ex.name, setIndex)?.load}kg</div>}
                                  <div className={styles.setIndex}>{setIndex + 1}</div>
                                  <input type="number" value={set.reps} onChange={e => updateSet(exIndex, setIndex, 'reps', e.target.value)} placeholder={set.targetReps || '-'} className={styles.setInput} />
                                  <input type="number" value={set.load} onChange={e => updateSet(exIndex, setIndex, 'load', e.target.value)} placeholder={set.targetLoad || '-'} className={styles.setInput} />
                                </div>
                            ))}
                          </div>
                      ))}
                      <Button type="button" variant="secondary"  onClick={addExercise} style={{ marginTop: '1rem', width: '100%' }}><Plus size={14} /> Adicionar Exercício</Button>
                    </div>
                  )}
                </div>
              )}
            </Card>

            <div className={styles.footerActions}>
              <Button type="submit" disabled={saving} style={{ width: '100%', maxWidth: '300px' }}>
                {saving ? <Loader2 className="animate-spin" /> : <><Save size={18} /> Salvar Tudo</>}
              </Button>
            </div>
          </form>
        )
      )}
    </div>
  );
}