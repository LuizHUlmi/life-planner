import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

// Estilos
import styles from './Biometria.module.css';

// Gráficos
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// UI
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Plus, Trash2, Calendar, TrendingUp } from 'lucide-react';

interface Measurement {
  id: number;
  date: string;
  weight: number;
  body_fat: number;
  shoulders: number;
  chest: number;
  left_arm: number;
  right_arm: number;
  waist: number;
  abdomen: number;
  hips: number;
  left_thigh: number;
  right_thigh: number;
  calves: number;
}

export function Biometria() {
  const { user } = useAuth();
  const [history, setHistory] = useState<Measurement[]>([]);

  // Estados do Form
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  
  // Medidas
  const [shoulders, setShoulders] = useState('');
  const [chest, setChest] = useState('');
  const [leftArm, setLeftArm] = useState('');
  const [rightArm, setRightArm] = useState('');
  const [waist, setWaist] = useState('');
  const [abdomen, setAbdomen] = useState('');
  const [hips, setHips] = useState('');
  const [leftThigh, setLeftThigh] = useState('');
  const [rightThigh, setRightThigh] = useState('');
  const [calves, setCalves] = useState('');

  useEffect(() => {
    if (user) {
      fetchMeasurements();
      fetchTodayWeightFromDiary();
    }
  }, [user]);

  async function fetchMeasurements() {
    const { data } = await supabase.from('body_measurements').select('*').order('date', { ascending: true });
    setHistory(data || []);
  }

  async function fetchTodayWeightFromDiary() {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase.from('daily_logs').select('weight').eq('date', today).maybeSingle();
    if (data && data.weight) setWeight(String(data.weight));
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const payload = {
        user_id: user.id, date,
        weight: Number(weight) || null, body_fat: Number(bodyFat) || null,
        shoulders: Number(shoulders) || null, chest: Number(chest) || null,
        left_arm: Number(leftArm) || null, right_arm: Number(rightArm) || null,
        waist: Number(waist) || null, abdomen: Number(abdomen) || null, hips: Number(hips) || null,
        left_thigh: Number(leftThigh) || null, right_thigh: Number(rightThigh) || null, calves: Number(calves) || null,
      };

      const { data, error } = await supabase.from('body_measurements').insert([payload]).select().single();
      if (error) throw error;

      if (payload.weight) {
        await supabase.from('daily_logs').upsert({ user_id: user.id, date, weight: payload.weight }, { onConflict: 'user_id, date' });
      }
      
      if (data) setHistory([...history, data].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
      alert('Medidas salvas!');
    } catch (error) { alert('Erro ao salvar.'); }
  };

  const handleDelete = async (id: number) => {
    if(!confirm('Apagar registro?')) return;
    await supabase.from('body_measurements').delete().eq('id', id);
    setHistory(history.filter(h => h.id !== id));
  };

  const chartData = history.map(h => ({
    ...h,
    displayDate: new Date(h.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  }));

  const reversedHistory = [...history].reverse();

  return (
    <div className={styles.container}>
      
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Biometria</h1>
          <p className={styles.subtitle}>Evolução física</p>
        </div>
      </header>

      {/* --- GRÁFICO --- */}
      {history.length > 1 && (
        <Card className={styles.card}>
          <h3 className={styles.cardTitle}><TrendingUp size={18} color="var(--primary)" /> Evolução: Peso vs Cintura</h3>
          <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="displayDate" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis yAxisId="left" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} domain={['dataMin - 2', 'dataMax + 2']} width={30} />
                <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} width={30} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                <Line yAxisId="left" type="monotone" dataKey="weight" stroke="var(--primary)" strokeWidth={2} dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="waist" stroke="#ef4444" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* --- FORMULÁRIO --- */}
      <Card className={styles.card}>
        <form onSubmit={handleSave}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}><Plus size={18} /> Novo Registro</h3>
            <div className={styles.dateInputWrapper}>
                <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
          </div>

          <div className={styles.rowGrid}>
              <Input label="Peso (kg)" type="number" step="0.05" value={weight} onChange={e => setWeight(e.target.value)} placeholder="0.00" />
              <Input label="% Gordura" type="number" step="0.1" value={bodyFat} onChange={e => setBodyFat(e.target.value)} placeholder="0%" />
          </div>

          <div className={styles.sectionTitle}>Medidas (cm)</div>
          
          <div className={styles.measurementsGrid}>
            <Input label="Ombros" value={shoulders} onChange={e => setShoulders(e.target.value)} />
            <Input label="Peitoral" value={chest} onChange={e => setChest(e.target.value)} />
            <Input label="Braço E." value={leftArm} onChange={e => setLeftArm(e.target.value)} />
            <Input label="Braço D." value={rightArm} onChange={e => setRightArm(e.target.value)} />
            
            <Input label="Cintura" value={waist} onChange={e => setWaist(e.target.value)} />
            <Input label="Abdômen" value={abdomen} onChange={e => setAbdomen(e.target.value)} />
            <Input label="Quadril" value={hips} onChange={e => setHips(e.target.value)} />
            
            <Input label="Coxa E." value={leftThigh} onChange={e => setLeftThigh(e.target.value)} />
            <Input label="Coxa D." value={rightThigh} onChange={e => setRightThigh(e.target.value)} />
            <Input label="Panturr." value={calves} onChange={e => setCalves(e.target.value)} />
          </div>

          <Button type="submit" fullWidth>Salvar Dados</Button>
        </form>
      </Card>

      {/* --- HISTÓRICO --- */}
      <h3 className={styles.historySectionTitle}>Histórico</h3>
      
      {/* MODO DESKTOP: TABELA */}
      <div className={`${styles.desktopOnly} ${styles.tableContainer}`}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Data</th><th>Peso</th><th>BF%</th><th>Cintura</th><th>Abdômen</th><th>Braço</th><th>Coxa</th><th></th>
            </tr>
          </thead>
          <tbody>
            {reversedHistory.map((item) => (
              <tr key={item.id}>
                <td>{new Date(item.date).toLocaleDateString('pt-BR')}</td>
                <td>{item.weight || '-'} kg</td>
                <td>{item.body_fat || '-'} %</td>
                <td>{item.waist || '-'}</td>
                <td>{item.abdomen || '-'}</td>
                <td>{item.right_arm || '-'}</td>
                <td>{item.right_thigh || '-'}</td>
                <td style={{ textAlign: 'right' }}>
                  <button onClick={() => handleDelete(item.id)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#cbd5e1' }}><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODO MOBILE: CARDS (Igual App) */}
      <div className={styles.mobileOnly}>
        {reversedHistory.map((item) => (
          <div key={item.id} className={styles.historyCard}>
            <div className={styles.historyCardHeader}>
              <div className={styles.historyDate}>
                <Calendar size={14} color="var(--primary)" />
                {new Date(item.date).toLocaleDateString('pt-BR')}
              </div>
              {item.weight && <div className={styles.historyMainStat}>{item.weight} kg</div>}
              <button onClick={() => handleDelete(item.id)} className={styles.deleteBtnAbs}><Trash2 size={16} /></button>
            </div>
            
            <div className={styles.historyGrid}>
              {item.body_fat && <div className={styles.statItem}><span className={styles.statLabel}>Gordura</span><span className={styles.statValue}>{item.body_fat}%</span></div>}
              {item.waist && <div className={styles.statItem}><span className={styles.statLabel}>Cintura</span><span className={styles.statValue}>{item.waist} cm</span></div>}
              {item.abdomen && <div className={styles.statItem}><span className={styles.statLabel}>Abdômen</span><span className={styles.statValue}>{item.abdomen} cm</span></div>}
              {item.right_arm && <div className={styles.statItem}><span className={styles.statLabel}>Braço</span><span className={styles.statValue}>{item.right_arm} cm</span></div>}
              {item.right_thigh && <div className={styles.statItem}><span className={styles.statLabel}>Coxa</span><span className={styles.statValue}>{item.right_thigh} cm</span></div>}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}