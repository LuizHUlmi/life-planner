import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

// Estilos
import styles from './Biometria.module.css';

// Gráficos
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// UI
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Plus, Trash2, Calendar, TrendingUp, Loader2 } from 'lucide-react';

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
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<Measurement[]>([]);

  // Estados do Form
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  
  // Superiores
  const [shoulders, setShoulders] = useState('');
  const [chest, setChest] = useState('');
  const [leftArm, setLeftArm] = useState('');
  const [rightArm, setRightArm] = useState('');
  
  // Centrais
  const [waist, setWaist] = useState('');
  const [abdomen, setAbdomen] = useState('');
  const [hips, setHips] = useState('');
  
  // Inferiores
  const [leftThigh, setLeftThigh] = useState('');
  const [rightThigh, setRightThigh] = useState('');
  const [calves, setCalves] = useState('');

  // 1. CARREGAR DADOS
  useEffect(() => {
    if (user) {
      fetchMeasurements();
      fetchTodayWeightFromDiary();
    }
  }, [user]);

  async function fetchMeasurements() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('body_measurements')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchTodayWeightFromDiary() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data } = await supabase
        .from('daily_logs')
        .select('weight')
        .eq('date', today)
        .maybeSingle();
      
      if (data && data.weight) {
        setWeight(String(data.weight));
      }
    } catch (error) {
      console.error(error);
    }
  }

  // 2. SALVAR MEDIDAS
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const payload = {
        user_id: user.id,
        date,
        weight: Number(weight) || null,
        body_fat: Number(bodyFat) || null,
        shoulders: Number(shoulders) || null,
        chest: Number(chest) || null,
        left_arm: Number(leftArm) || null,
        right_arm: Number(rightArm) || null,
        waist: Number(waist) || null,
        abdomen: Number(abdomen) || null,
        hips: Number(hips) || null,
        left_thigh: Number(leftThigh) || null,
        right_thigh: Number(rightThigh) || null,
        calves: Number(calves) || null,
      };

      const { data, error } = await supabase
        .from('body_measurements')
        .insert([payload])
        .select()
        .single();

      if (error) throw error;

      // Sincroniza o PESO no Diário
      if (payload.weight) {
        await supabase.from('daily_logs').upsert({
          user_id: user.id,
          date: date,
          weight: payload.weight
        }, { onConflict: 'user_id, date' });
      }
      
      if (data) {
        setHistory([...history, data].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
      }
      
      alert('Medidas salvas com sucesso!');
      
    } catch (error) {
      alert('Erro ao salvar.');
      console.error(error);
    }
  };

  const handleDelete = async (id: number) => {
    if(!confirm('Apagar registro?')) return;
    await supabase.from('body_measurements').delete().eq('id', id);
    setHistory(history.filter(h => h.id !== id));
  };

  // Prepara dados para o gráfico
  const chartData = history.map(h => ({
    ...h,
    displayDate: new Date(h.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  }));

  const reversedHistory = [...history].reverse();

  return (
    <div className={styles.container}>
      
      <header className={styles.header}>
        <h1 className={styles.title}>Biometria & Medidas</h1>
        <p className={styles.subtitle}>Acompanhe a evolução do seu físico.</p>
      </header>

      {/* --- 1. GRÁFICO --- */}
      {history.length > 1 && (
        <Card className={styles.card}>
          <h3 className={styles.cardTitle}>
            <TrendingUp size={20} color="var(--primary)" /> Evolução: Peso vs Cintura
          </h3>
          <div className={styles.chartContainer}>
            <ResponsiveContainer>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="displayDate" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis yAxisId="left" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} domain={['dataMin - 2', 'dataMax + 2']} />
                <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="weight" name="Peso (kg)" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line yAxisId="right" type="monotone" dataKey="waist" name="Cintura (cm)" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* --- 2. FORMULÁRIO --- */}
      <Card className={styles.card}>
        <form onSubmit={handleSave}>
          <div className={styles.formHeader}>
            <h3 className={styles.cardTitle} style={{ marginBottom: 0 }}>
              <Plus size={18} /> Novo Registro
            </h3>
            <div className={styles.dateWrapper}>
                <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
          </div>

          {/* Grid Principal */}
          <div className={styles.mainStatsGrid}>
              <Input label="Peso (kg)" type="number" step="0.05" value={weight} onChange={e => setWeight(e.target.value)} placeholder="Sinc. Diário" />
              <Input label="% Gordura" type="number" step="0.1" value={bodyFat} onChange={e => setBodyFat(e.target.value)} />
          </div>

          {/* Superiores */}
          <h4 className={styles.sectionTitle}>Superiores</h4>
          <div className={styles.measurementsGrid}>
            <Input label="Ombros" placeholder="cm" value={shoulders} onChange={e => setShoulders(e.target.value)} />
            <Input label="Peitoral" placeholder="cm" value={chest} onChange={e => setChest(e.target.value)} />
            <Input label="Braço Esq." placeholder="cm" value={leftArm} onChange={e => setLeftArm(e.target.value)} />
            <Input label="Braço Dir." placeholder="cm" value={rightArm} onChange={e => setRightArm(e.target.value)} />
          </div>

          {/* Tronco */}
          <h4 className={styles.sectionTitle}>Tronco</h4>
          <div className={styles.measurementsGrid}>
            <Input label="Cintura" placeholder="cm" value={waist} onChange={e => setWaist(e.target.value)} />
            <Input label="Abdômen" placeholder="cm" value={abdomen} onChange={e => setAbdomen(e.target.value)} />
            <Input label="Quadril" placeholder="cm" value={hips} onChange={e => setHips(e.target.value)} />
          </div>

          {/* Inferiores */}
          <h4 className={styles.sectionTitle}>Inferiores</h4>
          <div className={`${styles.measurementsGrid} ${styles.lastGrid}`}>
            <Input label="Coxa Esq." placeholder="cm" value={leftThigh} onChange={e => setLeftThigh(e.target.value)} />
            <Input label="Coxa Dir." placeholder="cm" value={rightThigh} onChange={e => setRightThigh(e.target.value)} />
            <Input label="Panturrilha" placeholder="cm" value={calves} onChange={e => setCalves(e.target.value)} />
          </div>

          <Button type="submit" fullWidth>Salvar Medidas</Button>
        </form>
      </Card>

      {/* --- 3. HISTÓRICO --- */}
      <h3 className={styles.historyTitle}>Histórico Completo</h3>
      
      <Card className={styles.tableCard}>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Data</th>
                <th>Peso</th>
                <th>BF %</th>
                <th>Ombro</th>
                <th>Peito</th>
                <th>Braço (E/D)</th>
                <th>Cintura</th>
                <th>Abdômen</th>
                <th>Quadril</th>
                <th>Coxa (E/D)</th>
                <th>Pantur.</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={12} style={{ textAlign: 'center', padding: '2rem' }}><Loader2 className="animate-spin" style={{ margin: '0 auto' }} /></td></tr>
              ) : reversedHistory.length === 0 ? (
                <tr><td colSpan={12} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Nenhum registro encontrado.</td></tr>
              ) : (
                reversedHistory.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className={styles.dateCell}>
                        <Calendar size={14} color="var(--primary)" />
                        {new Date(item.date).toLocaleDateString('pt-BR')}
                      </div>
                    </td>
                    <td>{item.weight ? <b className={styles.highlight}>{item.weight} kg</b> : '-'}</td>
                    <td>{item.body_fat ? `${item.body_fat}%` : '-'}</td>
                    <td>{item.shoulders || '-'}</td>
                    <td>{item.chest || '-'}</td>
                    <td>
                      {item.left_arm || '-'} <span className={styles.separator}>/</span> {item.right_arm || '-'}
                    </td>
                    <td className={styles.alert}>{item.waist || '-'}</td>
                    <td>{item.abdomen || '-'}</td>
                    <td>{item.hips || '-'}</td>
                    <td>
                      {item.left_thigh || '-'} <span className={styles.separator}>/</span> {item.right_thigh || '-'}
                    </td>
                    <td>{item.calves || '-'}</td>
                    <td>
                      <button onClick={() => handleDelete(item.id)} className={styles.deleteBtn}>
                        <Trash2 size={16} />
                      </button>
                    </td>
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