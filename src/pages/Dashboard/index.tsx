import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';

// Componentes Visuais
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

import { DashboardCalendar } from './components/DashboardCalendar'; // Calendário de Eventos

// Ícones
import { 
  Wallet, Activity, Calendar as CalendarIcon, 
  PenLine, Dumbbell, Utensils, CheckCircle2 
} from 'lucide-react';
import { HabitMatrix } from './components/HabitMatrix';

export function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Estados dos KPIs
  const [netWorth, setNetWorth] = useState(0);
  const [currentWeight, setCurrentWeight] = useState<number | null>(null);
  
  // Estados de Performance Semanal
  const [dietConsistency, setDietConsistency] = useState(0); // Dias no foco na ultima semana
  const [workoutCount, setWorkoutCount] = useState(0); // Treinos na ultima semana
  
  // Estado do Último Treino
  const [lastWorkout, setLastWorkout] = useState<{ date: string, type: string, exercises: number } | null>(null);

  const [, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchDashboardData();
  }, [user]);

  async function fetchDashboardData() {
    try {
      setLoading(true);

      // 1. PATRIMÔNIO (Soma dos Ativos)
      const { data: assets } = await supabase.from('assets').select('estimated_value');
      const totalWealth = assets?.reduce((acc, curr) => acc + curr.estimated_value, 0) || 0;
      setNetWorth(totalWealth);

      // 2. DADOS DO DIÁRIO (Últimos 7 dias para consistência + Último Peso)
      const today = new Date();
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(today.getDate() - 7);
      
      const { data: recentLogs } = await supabase
        .from('daily_logs')
        .select('*')
        .order('date', { ascending: false }) // Mais recente primeiro
        .limit(14); // Pega um pouco mais para garantir achar peso

      if (recentLogs && recentLogs.length > 0) {
        // A. Peso Mais Recente
        const weightLog = recentLogs.find(log => log.weight > 0);
        if (weightLog) setCurrentWeight(weightLog.weight);

        // B. Último Treino Realizado
        const lastTrainingLog = recentLogs.find(log => log.workout_type === 'academia' || log.workout_type === 'alternativo');
        if (lastTrainingLog) {
          const exerciseCount = Array.isArray(lastTrainingLog.workout_details) ? lastTrainingLog.workout_details.length : 0;
          setLastWorkout({
            date: lastTrainingLog.date,
            type: lastTrainingLog.workout_type,
            exercises: exerciseCount
          });
        }

        // C. Consistência da Última Semana (Filtrar logs dos ultimos 7 dias)
        const weekLogs = recentLogs.filter(log => new Date(log.date) >= sevenDaysAgo);
        
        // Contar Treinos
        const workouts = weekLogs.filter(log => ['academia', 'alternativo'].includes(log.workout_type)).length;
        setWorkoutCount(workouts);

        // Contar Dieta (100% ou >50%)
        const dietDays = weekLogs.filter(log => ['100', 'mais_50'].includes(log.diet_score)).length;
        setDietConsistency(dietDays);
      }

    } catch (error) {
      console.error("Erro ao carregar dashboard", error);
    } finally {
      setLoading(false);
    }
  }

  // Helpers de Texto
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'Usuário';

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    // Ajuste simples para verificar se é hoje/ontem (ignorando timezones para simplificar visualização)
    if (date.toISOString().split('T')[0] === today.toISOString().split('T')[0]) return 'Hoje';
    
    // Ontem
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0]) return 'Ontem';

    return date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' });
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* HEADER */}
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
            {greeting}, {firstName}.
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Resumo da sua performance recente.
          </p>
        </div>
        
        <Button onClick={() => navigate('/diario')}>
          <PenLine size={18} /> Preencher Diário
        </Button>
      </header>

      {/* --- BLOCO 1: KPIs --- */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        
        {/* KPI: Patrimônio */}
        <Card style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', borderLeft: '4px solid #f59e0b', cursor: 'pointer' }} onClick={() => navigate('/patrimonio')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600 }}>
            <Wallet size={18} /> Patrimônio Líquido
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            R$ {netWorth.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </Card>

        {/* KPI: Peso */}
        <Card style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', borderLeft: '4px solid #3b82f6', cursor: 'pointer' }} onClick={() => navigate('/biometria')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600 }}>
            <Activity size={18} /> Peso Atual
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {currentWeight ? `${currentWeight} kg` : '-- kg'}
          </div>
        </Card>

        {/* KPI: Consistência Dieta (Semana) */}
        <Card style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', borderLeft: '4px solid #10b981', cursor: 'pointer' }} onClick={() => navigate('/nutricao')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600 }}>
            <Utensils size={18} /> Dieta (7 dias)
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
             <span style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>{dietConsistency}/7</span>
             <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>dias no foco</span>
          </div>
        </Card>

        {/* KPI: Consistência Treino (Semana) */}
        <Card style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', borderLeft: '4px solid #8b5cf6', cursor: 'pointer' }} onClick={() => navigate('/diario?view=history')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600 }}>
            <Dumbbell size={18} /> Treino (7 dias)
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
             <span style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>{workoutCount}</span>
             <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>sessões realizadas</span>
          </div>
        </Card>

      </div>

      {/* --- BLOCO 2: MATRIZ DE HÁBITOS E MÉTRICAS --- */}
      <section style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
           <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)' }}>
             Consistência do Mês
           </h2>
           {lastWorkout && (
              <div style={{ 
                marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px', 
                fontSize: '0.8rem', backgroundColor: '#f0f9ff', padding: '6px 12px', borderRadius: '20px', color: '#0369a1', border: '1px solid #bae6fd' 
              }}>
                 <CheckCircle2 size={14} /> 
                 Último treino: <b>{formatDate(lastWorkout.date)}</b> ({lastWorkout.type})
              </div>
           )}
        </div>
        
        {/* Componente Atualizado com Bolinhas Coloridas e Checks */}
        <HabitMatrix />
      </section>

      {/* --- BLOCO 3: AGENDA --- */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem' }}>
          <CalendarIcon size={20} color="var(--primary)" />
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Agenda & Eventos
          </h2>
        </div>
        
        <DashboardCalendar />
      </section>

    </div>
  );
}