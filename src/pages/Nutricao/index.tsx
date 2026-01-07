import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { 
  Plus, Utensils, Trash2, Save, Flame, X, FileText, History, Calendar, CheckCircle2, AlertCircle, Ban, ChevronDown, ChevronUp
} from 'lucide-react';

// --- TIPOS ---
interface Food {
  id: string; name: string; amount: string; kcal: number; protein: number; carbs: number; fat: number;
}
interface Meal {
  id: string; name: string; time: string; foods: Food[];
}
interface DietPlan {
  id: number; name: string; goal: string; is_active: boolean; meals: Meal[];
}
interface DietLog {
  id: number; date: string; diet_score: string; diet_plan_id: number | null; diet_plans?: DietPlan;
}

// Tipo para o Agrupamento Semanal
interface WeeklyGroup {
  weekStart: string; // Data da segunda-feira
  weekEnd: string;   // Data do domingo
  totalKcal: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  logs: DietLog[];
  isExpanded: boolean;
}

export function Nutricao() {
  const { user } = useAuth();
  const [, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'plans' | 'history'>('plans');

  // --- ESTADOS: PLANOS ---
  const [mode, setMode] = useState<'list' | 'edit'>('list');
  const [plans, setPlans] = useState<DietPlan[]>([]);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [formName, setFormName] = useState('');
  const [formGoal, setFormGoal] = useState('');
  const [formMeals, setFormMeals] = useState<Meal[]>([]);

  // --- ESTADOS: HISTÓRICO SEMANAL ---
  const [weeklyHistory, setWeeklyHistory] = useState<WeeklyGroup[]>([]);

  // 1. CARREGAR DADOS
  useEffect(() => {
    if (user) {
      if (activeTab === 'plans') fetchPlans();
      if (activeTab === 'history') fetchHistory();
    }
  }, [user, activeTab]);

  async function fetchPlans() {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('diet_plans').select('*').order('is_active', { ascending: false }).order('created_at', { ascending: false });
      if (error) throw error;
      setPlans(data || []);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  }

  async function fetchHistory() {
    try {
      setLoading(true);
      // Busca logs dos últimos 90 dias (aprox 3 meses)
      const { data, error } = await supabase
        .from('daily_logs')
        .select(`id, date, diet_score, diet_plan_id, diet_plans ( id, name, meals )`)
        .not('diet_score', 'is', null)
        .neq('diet_score', '')
        .order('date', { ascending: false })
        .limit(90);

      if (error) throw error;
      
      // PROCESSAR AGRUPAMENTO SEMANAL
      processWeeklyData(data || []);

    } catch (error) { console.error(error); } finally { setLoading(false); }
  }

  // --- LÓGICA DE AGRUPAMENTO POR SEMANA ---
  const processWeeklyData = (logs: any[]) => {
    const groups: Record<string, WeeklyGroup> = {};

    logs.forEach(log => {
      // Descobrir a segunda-feira da semana desta data
      const date = new Date(log.date);
      const day = date.getDay(); 
      const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Ajuste para segunda-feira ser o inicio
      const monday = new Date(date.setDate(diff));
      const mondayStr = monday.toISOString().split('T')[0];

      // Inicializa o grupo se não existir
      if (!groups[mondayStr]) {
        const sunday = new Date(monday);
        sunday.setDate(sunday.getDate() + 6);
        
        groups[mondayStr] = {
          weekStart: mondayStr,
          weekEnd: sunday.toISOString().split('T')[0],
          totalKcal: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0,
          logs: [],
          isExpanded: false // Começa fechado (ou true se quiser aberto)
        };
      }

      // Adiciona o log ao grupo
      groups[mondayStr].logs.push(log);

      // Soma os macros se houver plano vinculado
      if (log.diet_plans) {
        const totals = calculateTotals(log.diet_plans.meals);
        groups[mondayStr].totalKcal += totals.kcal;
        groups[mondayStr].totalProtein += totals.p;
        groups[mondayStr].totalCarbs += totals.c;
        groups[mondayStr].totalFat += totals.f;
      }
    });

    // Converte objeto para array e ordena (mais recente primeiro)
    const sortedGroups = Object.values(groups).sort((a, b) => new Date(b.weekStart).getTime() - new Date(a.weekStart).getTime());
    
    // Expandir a primeira semana por padrão
    if (sortedGroups.length > 0) sortedGroups[0].isExpanded = true;

    setWeeklyHistory(sortedGroups);
  };

  const toggleWeek = (weekStart: string) => {
    setWeeklyHistory(prev => prev.map(w => w.weekStart === weekStart ? { ...w, isExpanded: !w.isExpanded } : w));
  };

  // Helper de Macros
  const calculateTotals = (meals: Meal[]) => {
    let totals = { kcal: 0, p: 0, c: 0, f: 0 };
    if (!meals) return totals;
    meals.forEach(m => {
      m.foods?.forEach(f => {
        totals.kcal += f.kcal || 0; totals.p += f.protein || 0; totals.c += f.carbs || 0; totals.f += f.fat || 0;
      });
    });
    return totals;
  };

  // --- CRUD PLANOS ---
  const handleNewPlan = () => { setCurrentId(null); setFormName(''); setFormGoal(''); setFormMeals([]); setMode('edit'); };
  const handleEditPlan = (plan: DietPlan) => { setCurrentId(plan.id); setFormName(plan.name); setFormGoal(plan.goal || ''); setFormMeals(plan.meals || []); setMode('edit'); };
  const addMeal = () => { setFormMeals([...formMeals, { id: crypto.randomUUID(), name: '', time: '', foods: [] }]); };
  const removeMeal = (index: number) => { const newMeals = [...formMeals]; newMeals.splice(index, 1); setFormMeals(newMeals); };
  const updateMeal = (index: number, field: keyof Meal, value: string) => { const newMeals = [...formMeals]; (newMeals[index] as any)[field] = value; setFormMeals(newMeals); };
  const addFood = (mealIndex: number) => { const newMeals = [...formMeals]; newMeals[mealIndex].foods.push({ id: crypto.randomUUID(), name: '', amount: '', kcal: 0, protein: 0, carbs: 0, fat: 0 }); setFormMeals(newMeals); };
  const removeFood = (mealIndex: number, foodIndex: number) => { const newMeals = [...formMeals]; newMeals[mealIndex].foods.splice(foodIndex, 1); setFormMeals(newMeals); };
  const updateFood = (mealIndex: number, foodIndex: number, field: keyof Food, value: string) => { const newMeals = [...formMeals]; const val = field === 'name' || field === 'amount' ? value : Number(value); (newMeals[mealIndex].foods[foodIndex] as any)[field] = val; setFormMeals(newMeals); };
  
  const handleSave = async (e: React.FormEvent) => { e.preventDefault(); if (!formName || !user) return; try { const payload = { user_id: user.id, name: formName, goal: formGoal, meals: formMeals }; if (currentId) await supabase.from('diet_plans').update(payload).eq('id', currentId); else await supabase.from('diet_plans').insert([{ ...payload, is_active: plans.length === 0 }]); await fetchPlans(); setMode('list'); } catch (error) { console.error(error); } };
  const handleActivate = async (id: number) => { try { await supabase.from('diet_plans').update({ is_active: false }).eq('user_id', user!.id); await supabase.from('diet_plans').update({ is_active: true }).eq('id', id); fetchPlans(); } catch (error) { console.error(error); } };
  const handleDelete = async (id: number, e: React.MouseEvent) => { e.stopPropagation(); if (!confirm('Excluir este plano?')) return; await supabase.from('diet_plans').delete().eq('id', id); setPlans(plans.filter(p => p.id !== id)); };

  const getScoreBadge = (score: string) => {
    if (score === '100') return <span style={{display:'flex', alignItems:'center', gap:'4px', color:'#166534', backgroundColor:'#dcfce7', padding:'4px 8px', borderRadius:'12px', fontSize:'0.75rem', fontWeight:700}}><CheckCircle2 size={14}/> 100%</span>;
    if (score === 'mais_50') return <span style={{display:'flex', alignItems:'center', gap:'4px', color:'#b45309', backgroundColor:'#fef3c7', padding:'4px 8px', borderRadius:'12px', fontSize:'0.75rem', fontWeight:700}}><AlertCircle size={14}/> {'>'} 50%</span>;
    return <span style={{display:'flex', alignItems:'center', gap:'4px', color:'#991b1b', backgroundColor:'#fee2e2', padding:'4px 8px', borderRadius:'12px', fontSize:'0.75rem', fontWeight:700}}><Ban size={14}/> Off</span>;
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div><h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>Gestão Nutricional</h1><p style={{ color: 'var(--text-secondary)' }}>Planeje dietas e acompanhe a execução.</p></div>
          {activeTab === 'plans' && mode === 'list' && <Button onClick={handleNewPlan}><Plus size={18} /> Novo Plano</Button>}
        </div>
        <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)' }}>
          <button onClick={() => setActiveTab('plans')} style={activeTab === 'plans' ? activeTabStyle : tabStyle}><FileText size={18} /> Meus Planos</button>
          <button onClick={() => setActiveTab('history')} style={activeTab === 'history' ? activeTabStyle : tabStyle}><History size={18} /> Histórico Semanal</button>
        </div>
      </header>

      {/* --- ABA 1: PLANOS (CÓDIGO ORIGINAL MANTIDO) --- */}
      {activeTab === 'plans' && (
        <>
          {mode === 'list' && (
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {plans.length === 0 ? <div style={{ textAlign: 'center', padding: '3rem', border: '2px dashed var(--border-color)', borderRadius: '12px', color: 'var(--text-secondary)' }}>Você ainda não tem um plano alimentar.</div> : plans.map(plan => {
                  const totals = calculateTotals(plan.meals);
                  return (
                    <Card key={plan.id} onClick={() => handleEditPlan(plan)} style={{ cursor: 'pointer', border: plan.is_active ? '2px solid var(--primary)' : '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ padding: '0.8rem', backgroundColor: plan.is_active ? '#e0e7ff' : '#f1f5f9', borderRadius: '50%', color: plan.is_active ? 'var(--primary)' : 'var(--text-secondary)' }}><Utensils size={24} /></div>
                          <div><h3 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>{plan.name} {plan.is_active && <span style={{ fontSize: '0.7rem', backgroundColor: 'var(--primary)', color: 'white', padding: '2px 8px', borderRadius: '12px' }}>ATIVO</span>}</h3><p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{plan.goal}</p></div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>{!plan.is_active && <Button variant="secondary" onClick={(e) => { e.stopPropagation(); handleActivate(plan.id); }}>Ativar</Button>}<button onClick={(e) => handleDelete(plan.id, e)} style={{ border: 'none', background: 'transparent', padding: '0.5rem', cursor: 'pointer', color: '#cbd5e1' }}><Trash2 size={18} /></button></div>
                      </div>
                      <div style={{ display: 'flex', gap: '1rem', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', flexWrap: 'wrap' }}>
                         <div style={{ flex: 1, minWidth: '80px' }}><span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Kcal</span><div style={{ fontWeight: 700, color: 'var(--text-primary)' }}><Flame size={12} fill="orange" /> {Math.round(totals.kcal)}</div></div>
                         <div style={{ flex: 1, minWidth: '80px' }}><span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Prot</span><div style={{ fontWeight: 700, color: '#166534' }}>{Math.round(totals.p)}g</div></div>
                         <div style={{ flex: 1, minWidth: '80px' }}><span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Carb</span><div style={{ fontWeight: 700, color: '#0284c7' }}>{Math.round(totals.c)}g</div></div>
                         <div style={{ flex: 1, minWidth: '80px' }}><span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Gord</span><div style={{ fontWeight: 700, color: '#d97706' }}>{Math.round(totals.f)}g</div></div>
                      </div>
                    </Card>
                  );
                })}
            </div>
          )}
          {mode === 'edit' && (
            <form onSubmit={handleSave}><Card><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}><h3 style={{ fontSize: '1.4rem', fontWeight: 600 }}>{currentId ? 'Editar Plano' : 'Novo Plano'}</h3><Button type="button" variant="secondary" onClick={() => setMode('list')}>Cancelar</Button></div><div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '2rem' }}><Input label="Nome da Dieta" placeholder="Ex: Bulking Limpo" value={formName} onChange={e => setFormName(e.target.value)} required /><Input label="Objetivo" placeholder="Ex: Ganhar peso" value={formGoal} onChange={e => setFormGoal(e.target.value)} /></div><div style={{ marginBottom: '1.5rem' }}><h4 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem' }}>Refeições</h4>{formMeals.map((meal, mIndex) => (<div key={meal.id} style={{ marginBottom: '2rem', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.5rem' }}><div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'end' }}><div style={{ flex: 2 }}><Input placeholder="Nome (Ex: Café da Manhã)" value={meal.name} onChange={e => updateMeal(mIndex, 'name', e.target.value)} /></div><div style={{ flex: 1 }}><Input type="time" value={meal.time} onChange={e => updateMeal(mIndex, 'time', e.target.value)} /></div><Button type="button" variant="secondary" onClick={() => removeMeal(mIndex)} style={{ color: '#ef4444' }}><Trash2 size={18} /></Button></div><div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px' }}><div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr 1fr 1fr auto', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}><div>Alimento</div><div>Qtd</div><div>Kcal</div><div>Prot</div><div>Carb</div><div>Gord</div><div></div></div>{meal.foods.map((food, fIndex) => (<div key={food.id} style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr 1fr 1fr auto', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}><Input placeholder="Ovo" value={food.name} onChange={e => updateFood(mIndex, fIndex, 'name', e.target.value)} /><Input placeholder="1 un" value={food.amount} onChange={e => updateFood(mIndex, fIndex, 'amount', e.target.value)} /><Input type="number" value={food.kcal} onChange={e => updateFood(mIndex, fIndex, 'kcal', e.target.value)} /><Input type="number" value={food.protein} onChange={e => updateFood(mIndex, fIndex, 'protein', e.target.value)} /><Input type="number" value={food.carbs} onChange={e => updateFood(mIndex, fIndex, 'carbs', e.target.value)} /><Input type="number" value={food.fat} onChange={e => updateFood(mIndex, fIndex, 'fat', e.target.value)} /><button type="button" onClick={() => removeFood(mIndex, fIndex)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#ef4444' }}><X size={16} /></button></div>))}<Button type="button" variant="secondary"  onClick={() => addFood(mIndex)} style={{ marginTop: '0.5rem' }}><Plus size={14} /> Add Alimento</Button></div></div>))}<Button type="button" variant="secondary" onClick={addMeal} fullWidth style={{ borderStyle: 'dashed' }}><Plus size={18} /> Adicionar Nova Refeição</Button></div><div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}><Button type="submit"><Save size={18} /> Salvar Plano</Button></div></Card></form>
          )}
        </>
      )}

      {/* --- ABA 2: HISTÓRICO SEMANAL (NOVO) --- */}
      {activeTab === 'history' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {weeklyHistory.length === 0 ? (
             <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Nenhum registro encontrado. Comece a preencher seu Diário!</div>
          ) : (
            weeklyHistory.map((week, idx) => (
              <Card key={idx} style={{ padding: '0', overflow: 'hidden' }}>
                {/* CABEÇALHO DA SEMANA (RESUMO) */}
                <div 
                  onClick={() => toggleWeek(week.weekStart)}
                  style={{ 
                    padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                    cursor: 'pointer', backgroundColor: week.isExpanded ? '#f8fafc' : 'white',
                    transition: 'background 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Calendar size={18} color="var(--primary)" />
                      {new Date(week.weekStart).toLocaleDateString('pt-BR', {day:'2-digit', month:'2-digit'})} a {new Date(week.weekEnd).toLocaleDateString('pt-BR', {day:'2-digit', month:'2-digit'})}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {week.logs.length} dias registrados
                    </div>
                  </div>

                  {/* Resumo de Calorias da Semana */}
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total da Semana</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                       <Flame size={16} fill="currentColor" /> {Math.round(week.totalKcal).toLocaleString()} kcal
                    </div>
                  </div>

                  <div>{week.isExpanded ? <ChevronUp size={20} color="#94a3b8" /> : <ChevronDown size={20} color="#94a3b8" />}</div>
                </div>

                {/* LISTA DETALHADA DOS DIAS DA SEMANA */}
                {week.isExpanded && (
                  <div style={{ padding: '0 1.5rem 1.5rem 1.5rem', backgroundColor: '#f8fafc', borderTop: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'grid', gap: '0.8rem', marginTop: '1rem' }}>
                      {week.logs.map(log => {
                        const plan = log.diet_plans;
                        const totals = plan ? calculateTotals(plan.meals) : null;
                        
                        return (
                          <div key={log.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'white', padding: '0.8rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            {/* Data e Badge */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ fontWeight: 600, color: 'var(--text-primary)', minWidth: '100px' }}>
                                   {new Date(log.date).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' })}
                                </div>
                                {getScoreBadge(log.diet_score)}
                            </div>

                            {/* Detalhes do Dia */}
                            {plan && totals ? (
                               <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.85rem' }}>
                                  <span style={{ fontWeight: 600, color: '#1e293b' }}>{plan.name}</span>
                                  <span style={{ color: '#64748b' }}>|</span>
                                  <span style={{ color: '#15803d', fontWeight: 600 }}>{Math.round(totals.kcal)} kcal</span>
                               </div>
                            ) : (
                               <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic' }}>Off / Sem plano</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}

const activeTabStyle = { display: 'flex', alignItems: 'center', gap: '8px', padding: '0.8rem 1rem', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, color: 'var(--primary)', borderBottom: '2px solid var(--primary)' };
const tabStyle = { display: 'flex', alignItems: 'center', gap: '8px', padding: '0.8rem 1rem', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 400, color: 'var(--text-secondary)', borderBottom: '2px solid transparent' };