import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { 
  Activity, Moon, TrendingUp,
  Dumbbell, Utensils, AlertCircle, ArrowRight,
  Droplet, Wallet, Calendar as CalendarIcon
} from 'lucide-react';

export function Dashboard() {
  // --- MOCKUP DE DADOS ---
  const todaySummary = {
    sleep: '7h 30m',
    mood: 'Produtivo',
    weight: '82.5 kg',
    water: '2.5L'
  };

  const nextWorkout = {
    name: 'Upper 1 (Foco Peitoral)',
    lastLoad: 'Supino: 72kg',
    duration: '60 min'
  };

  const dietToday = {
    type: 'HIGH CARB',
    calories: 2900,
    macros: { p: 220, c: 350, g: 65 }
  };

  const financeAlerts = 2; 
  const assetAlerts = 1;

  // --- LÓGICA DO CALENDÁRIO ---
  // Simulando dias que você preencheu o diário este mês (ex: dias 1, 2, 3, 5, 6...)
  const filledDays = [1, 2, 3, 5, 6, 7, 8, 10, 11, 12, 14, 15]; 
  const currentMonth = new Date();
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const today = currentMonth.getDate();

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* --- 1. CABEÇALHO --- */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
            Olá, Luiz 👋
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Mantenha a disciplina. Cada registro conta.
          </p>
        </div>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textAlign: 'right' }}>
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </div>
      </header>

      {/* --- 2. METRICAS RÁPIDAS --- */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <Card style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.6rem', background: '#e0e7ff', borderRadius: '50%', color: 'var(--primary)' }}>
            <Moon size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Sono Hoje</div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{todaySummary.sleep}</div>
          </div>
        </Card>

        <Card style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.6rem', background: '#dcfce7', borderRadius: '50%', color: '#166534' }}>
            <Activity size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Humor</div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{todaySummary.mood}</div>
          </div>
        </Card>

        <Card style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.6rem', background: '#fef3c7', borderRadius: '50%', color: '#d97706' }}>
            <TrendingUp size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Peso</div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{todaySummary.weight}</div>
          </div>
        </Card>

        <Card style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.6rem', background: '#e0f2fe', borderRadius: '50%', color: '#0284c7' }}>
            <Droplet size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Água</div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{todaySummary.water}</div>
          </div>
        </Card>
      </div>

      {/* --- GRID PRINCIPAL --- */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        
        {/* ESQUERDA: AÇÃO (Treino e Dieta) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <Card style={{ position: 'relative', overflow: 'hidden', borderLeft: '4px solid var(--primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: 600 }}>
                <Dumbbell size={20} />
                <span>Treino do Dia</span>
              </div>
              <Link to="/treino" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
                Ver ficha <ArrowRight size={14} />
              </Link>
            </div>
            
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              {nextWorkout.name}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
              Última carga: <strong>{nextWorkout.lastLoad}</strong>
            </p>

            <Button fullWidth>Iniciar Treino</Button>
          </Card>

          <Card style={{ position: 'relative', overflow: 'hidden', borderLeft: '4px solid #ef4444' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', fontWeight: 600 }}>
                <Utensils size={20} />
                <span>Nutrição</span>
              </div>
              <Link to="/nutricao" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
                Cardápio <ArrowRight size={14} />
              </Link>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.2rem', color: '#ef4444' }}>
                  {dietToday.type}
                </h3>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  {dietToday.calories} Kcal
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.8rem', fontSize: '0.8rem', textAlign: 'center' }}>
                <div><div style={{ fontWeight: 700 }}>{dietToday.macros.p}g</div><div style={{ color: 'var(--text-secondary)' }}>P</div></div>
                <div><div style={{ fontWeight: 700 }}>{dietToday.macros.c}g</div><div style={{ color: 'var(--text-secondary)' }}>C</div></div>
                <div><div style={{ fontWeight: 700 }}>{dietToday.macros.g}g</div><div style={{ color: 'var(--text-secondary)' }}>G</div></div>
              </div>
            </div>
          </Card>

        </div>

        {/* DIREITA: CALENDÁRIO & ALERTAS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* --- NOVO: CALENDÁRIO DE CONSISTÊNCIA --- */}
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                <CalendarIcon size={18} />
                <span>Consistência (Diário)</span>
              </div>
              <Link to="/diario" style={{ fontSize: '0.8rem', color: 'var(--primary)', textDecoration: 'none' }}>
                Preencher Hoje
              </Link>
            </div>

            {/* Grid do Calendário */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(7, 1fr)', 
              gap: '0.5rem', 
              textAlign: 'center' 
            }}>
              {/* Dias da Semana */}
              {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
                <div key={i} style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{d}</div>
              ))}

              {/* Dias do Mês */}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                const isFilled = filledDays.includes(day);
                const isToday = day === today;

                return (
                  <div 
                    key={day}
                    style={{
                      aspectRatio: '1/1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '50%',
                      fontSize: '0.8rem',
                      fontWeight: isFilled || isToday ? 600 : 400,
                      backgroundColor: isFilled ? 'var(--primary)' : isToday ? 'transparent' : '#f3f4f6',
                      color: isFilled ? 'white' : isToday ? 'var(--primary)' : '#9ca3af',
                      border: isToday ? '2px solid var(--primary)' : 'none',
                      position: 'relative',
                      cursor: 'default'
                    }}
                    title={isFilled ? 'Diário preenchido' : 'Pendente'}
                  >
                    {day}
                    {/* Pequeno check visual se preenchido, opcional, mas limpo só com cor */}
                  </div>
                );
              })}
            </div>
            
            <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-secondary)', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)' }}></div> Preenchido
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                 <div style={{ width: 8, height: 8, borderRadius: '50%', border: '2px solid var(--primary)' }}></div> Hoje
              </div>
            </div>
          </Card>

          {/* Alertas */}
          <Card>
             <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Alertas</h4>
             
             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <Link to="/compras" style={{ textDecoration: 'none' }}>
                  <div style={{ 
                    display: 'flex', alignItems: 'center', gap: '0.8rem', 
                    padding: '0.8rem', borderRadius: '8px', 
                    backgroundColor: '#fee2e2', color: '#b91c1c' 
                  }}>
                    <Wallet size={20} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Compras</div>
                      <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>{financeAlerts} itens essenciais</div>
                    </div>
                  </div>
                </Link>

                {assetAlerts > 0 && (
                  <Link to="/patrimonio" style={{ textDecoration: 'none' }}>
                    <div style={{ 
                      display: 'flex', alignItems: 'center', gap: '0.8rem', 
                      padding: '0.8rem', borderRadius: '8px', 
                      backgroundColor: '#fef3c7', color: '#b45309' 
                    }}>
                      <AlertCircle size={20} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Ativos</div>
                        <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>{assetAlerts} troca prevista</div>
                      </div>
                    </div>
                  </Link>
                )}
             </div>
          </Card>

        </div>
      </div>
    </div>
  );
}