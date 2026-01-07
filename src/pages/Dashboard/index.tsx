import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';

// Estilos
import styles from './Dashboard.module.css';

// Componentes
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { DashboardCalendar } from './components/DashboardCalendar';
import { HabitMatrix } from './components/HabitMatrix';

// Ícones
import { 
  Wallet, Activity, Calendar as CalendarIcon, 
  PenLine, Dumbbell, Utensils, CheckCircle2 
} from 'lucide-react';

export function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Estados
  const [netWorth, setNetWorth] = useState(0);
  const [currentWeight, setCurrentWeight] = useState<number | null>(null);
  const [dietConsistency, setDietConsistency] = useState(0);
  const [workoutCount, setWorkoutCount] = useState(0);
  const [lastWorkout, setLastWorkout] = useState<{ date: string, type: string, exercises: number } | null>(null);
  const [, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchDashboardData();
  }, [user]);

  async function fetchDashboardData() {
    try {
      setLoading(true);

      // 1. PATRIMÔNIO
      const { data: assets } = await supabase.from('assets').select('estimated_value');
      const totalWealth = assets?.reduce((acc, curr) => acc + curr.estimated_value, 0) || 0;
      setNetWorth(totalWealth);

      // 2. DADOS DO DIÁRIO (Últimos 14 dias)
      const today = new Date();
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(today.getDate() - 7);
      
      const { data: recentLogs } = await supabase
        .from('daily_logs')
        .select('*')
        .order('date', { ascending: false })
        .limit(14);

      if (recentLogs && recentLogs.length > 0) {
        // Peso (Pega o primeiro que encontrar)
        const weightLog = recentLogs.find(log => log.weight > 0);
        if (weightLog) setCurrentWeight(weightLog.weight);

        // Último Treino
        const lastTrainingLog = recentLogs.find(log => log.workout_type === 'academia' || log.workout_type === 'alternativo');
        if (lastTrainingLog) {
          const exerciseCount = Array.isArray(lastTrainingLog.workout_details) ? lastTrainingLog.workout_details.length : 0;
          setLastWorkout({
            date: lastTrainingLog.date,
            type: lastTrainingLog.workout_type,
            exercises: exerciseCount
          });
        }

        // Consistência da Semana
        const weekLogs = recentLogs.filter(log => new Date(log.date) >= sevenDaysAgo);
        const workouts = weekLogs.filter(log => ['academia', 'alternativo'].includes(log.workout_type)).length;
        setWorkoutCount(workouts);
        const dietDays = weekLogs.filter(log => ['100', 'mais_50'].includes(log.diet_score)).length;
        setDietConsistency(dietDays);
      }
    } catch (error) {
      console.error("Erro dashboard", error);
    } finally {
      setLoading(false);
    }
  }

  // Helpers
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'Usuário';

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    if (date.toISOString().split('T')[0] === today.toISOString().split('T')[0]) return 'Hoje';
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0]) return 'Ontem';
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  return (
    <div className={styles.container}>
      
      {/* HEADER */}
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <h1>{greeting}, {firstName}.</h1>
          <p>Visão geral dos seus objetivos.</p>
        </div>
        
        <Button onClick={() => navigate('/diario')} className={styles.headerButton}>
          <PenLine size={18} /> Preencher Diário
        </Button>
      </header>

      {/* --- BLOCO 1: KPIs (Cartões) --- */}
      <div className={styles.kpiGrid}>
        
        {/* KPI: Patrimônio */}
        <Card 
          className={`${styles.kpiCard} ${styles.kpiWealth}`} 
          onClick={() => navigate('/patrimonio')}
        >
          <div className={styles.kpiLabel}><Wallet size={16} /> Patrimônio</div>
          <div className={styles.kpiValue}>
            <span style={{ fontSize: '1rem', marginRight: '2px' }}>R$</span>
            {netWorth.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
          </div>
        </Card>

        {/* KPI: Peso */}
        <Card 
          className={`${styles.kpiCard} ${styles.kpiWeight}`} 
          onClick={() => navigate('/biometria')}
        >
          <div className={styles.kpiLabel}><Activity size={16} /> Peso</div>
          <div className={styles.kpiValue}>
            {currentWeight ? currentWeight : '--'} <span style={{ fontSize: '1rem' }}>kg</span>
          </div>
        </Card>

        {/* KPI: Dieta */}
        <Card 
          className={`${styles.kpiCard} ${styles.kpiDiet}`} 
          onClick={() => navigate('/nutricao')}
        >
          <div className={styles.kpiLabel}><Utensils size={16} /> Dieta (7d)</div>
          <div className={styles.kpiValueContainer}>
             <span className={styles.kpiValue}>{dietConsistency}/7</span>
             <span className={styles.kpiSubValue}>dias</span>
          </div>
        </Card>

        {/* KPI: Treino */}
        <Card 
          className={`${styles.kpiCard} ${styles.kpiWorkout}`} 
          onClick={() => navigate('/diario?view=history')}
        >
          <div className={styles.kpiLabel}><Dumbbell size={16} /> Treino (7d)</div>
          <div className={styles.kpiValueContainer}>
             <span className={styles.kpiValue}>{workoutCount}</span>
             <span className={styles.kpiSubValue}>sessões</span>
          </div>
        </Card>

      </div>

      {/* --- BLOCO 2: MATRIZ --- */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
           <h2 className={styles.sectionTitle}>
             Consistência do Mês
           </h2>
           {lastWorkout && (
              <div className={styles.lastWorkoutBadge}>
                 <CheckCircle2 size={14} /> 
                 Último treino: <b>{formatDate(lastWorkout.date)}</b>
              </div>
           )}
        </div>
        
        {/* Componente de Matriz (Certifique-se que o CSS dele também foi aplicado conforme passo anterior) */}
        <HabitMatrix />
      </section>

      {/* --- BLOCO 3: AGENDA --- */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            <CalendarIcon size={20} color="var(--primary)" />
            Agenda
          </h2>
        </div>
        
        <DashboardCalendar />
      </section>

    </div>
  );
}