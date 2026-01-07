import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

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

  // Busca histórico de biometria
  async function fetchMeasurements() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('body_measurements')
        .select('*')
        .order('date', { ascending: true }); // Crescente para o gráfico

      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  // Busca peso do Diário (daily_logs) para preencher automaticamente se já existir
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

  // 2. SALVAR MEDIDAS (E SINCRONIZAR COM DIÁRIO)
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

      // A. Salva na tabela de Biometria
      const { data, error } = await supabase
        .from('body_measurements')
        .insert([payload])
        .select()
        .single();

      if (error) throw error;

      // B. Sincroniza o PESO na tabela de Diário (daily_logs)
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
      
      alert('Medidas salvas e peso sincronizado com o Diário!');
      
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

  // Dados formatados para o gráfico
  const chartData = history.map(h => ({
    ...h,
    displayDate: new Date(h.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  }));

  // Inverte histórico para a tabela (mais recente primeiro)
  const reversedHistory = [...history].reverse();

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
          Biometria & Medidas
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Acompanhe a evolução do seu físico.
        </p>
      </header>

      {/* --- 1. GRÁFICO DE EVOLUÇÃO --- */}
      {history.length > 1 && (
        <Card style={{ marginBottom: '2rem', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={20} color="var(--primary)" /> Evolução: Peso vs Cintura
          </h3>
          <div style={{ width: '100%', height: 300 }}>
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

      {/* --- 2. FORMULÁRIO DE NOVA MEDIDA --- */}
      <Card style={{ marginBottom: '2rem' }}>
        <form onSubmit={handleSave}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={18} /> Novo Registro
            </h3>
            <div style={{ width: '160px' }}>
                <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
          </div>

          {/* Grid Peso e Gordura */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
              <Input label="Peso (kg)" type="number" step="0.05" value={weight} onChange={e => setWeight(e.target.value)}  placeholder="Sincronizado c/ Diário" />
              <Input label="% Gordura (BF)" type="number" step="0.1" value={bodyFat} onChange={e => setBodyFat(e.target.value)}  />
          </div>

          {/* Medidas Superiores */}
          <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '1rem', textTransform: 'uppercase' }}>Superiores</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <Input label="Ombros" placeholder="cm" value={shoulders} onChange={e => setShoulders(e.target.value)} />
            <Input label="Peitoral" placeholder="cm" value={chest} onChange={e => setChest(e.target.value)} />
            <Input label="Braço Esq." placeholder="cm" value={leftArm} onChange={e => setLeftArm(e.target.value)} />
            <Input label="Braço Dir." placeholder="cm" value={rightArm} onChange={e => setRightArm(e.target.value)} />
          </div>

          {/* Medidas Centrais */}
          <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '1rem', textTransform: 'uppercase' }}>Tronco</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <Input label="Cintura (Umbigo)" placeholder="cm" value={waist} onChange={e => setWaist(e.target.value)} />
            <Input label="Abdômen" placeholder="cm" value={abdomen} onChange={e => setAbdomen(e.target.value)} />
            <Input label="Quadril" placeholder="cm" value={hips} onChange={e => setHips(e.target.value)} />
          </div>

          {/* Medidas Inferiores */}
          <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '1rem', textTransform: 'uppercase' }}>Inferiores</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <Input label="Coxa Esq." placeholder="cm" value={leftThigh} onChange={e => setLeftThigh(e.target.value)} />
            <Input label="Coxa Dir." placeholder="cm" value={rightThigh} onChange={e => setRightThigh(e.target.value)} />
            <Input label="Panturrilha" placeholder="cm" value={calves} onChange={e => setCalves(e.target.value)} />
          </div>

          <Button type="submit" fullWidth>
            Salvar Medidas
          </Button>
        </form>
      </Card>

      {/* --- 3. HISTÓRICO EM TABELA COMPLETA --- */}
      <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)' }}>
        Histórico Completo
      </h3>
      
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1200px' }}>
            <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border-color)' }}>
              <tr>
                <th style={thStyle}>Data</th>
                <th style={thStyle}>Peso</th>
                <th style={thStyle}>BF %</th>
                <th style={thStyle}>Ombro</th>
                <th style={thStyle}>Peito</th>
                <th style={thStyle}>Braço (E/D)</th>
                <th style={thStyle}>Cintura</th>
                <th style={thStyle}>Abdômen</th>
                <th style={thStyle}>Quadril</th>
                <th style={thStyle}>Coxa (E/D)</th>
                <th style={thStyle}>Pantur.</th>
                <th style={thStyle}></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={12} style={{ padding: '2rem', textAlign: 'center' }}><Loader2 className="animate-spin" style={{ margin: '0 auto' }} /></td></tr>
              ) : reversedHistory.length === 0 ? (
                <tr><td colSpan={12} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Nenhum registro.</td></tr>
              ) : (
                reversedHistory.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                        <Calendar size={14} color="var(--primary)" />
                        {new Date(item.date).toLocaleDateString('pt-BR')}
                      </div>
                    </td>
                    <td style={tdStyle}>{item.weight ? <b>{item.weight} kg</b> : '-'}</td>
                    <td style={tdStyle}>{item.body_fat ? `${item.body_fat}%` : '-'}</td>
                    <td style={tdStyle}>{item.shoulders || '-'}</td>
                    <td style={tdStyle}>{item.chest || '-'}</td>
                    <td style={tdStyle}>
                      {item.left_arm || '-'} <span style={{color:'#94a3b8'}}>/</span> {item.right_arm || '-'}
                    </td>
                    <td style={{ ...tdStyle, color: '#ef4444', fontWeight: 600 }}>{item.waist || '-'}</td>
                    <td style={tdStyle}>{item.abdomen || '-'}</td>
                    <td style={tdStyle}>{item.hips || '-'}</td>
                    <td style={tdStyle}>
                      {item.left_thigh || '-'} <span style={{color:'#94a3b8'}}>/</span> {item.right_thigh || '-'}
                    </td>
                    <td style={tdStyle}>{item.calves || '-'}</td>
                    <td style={tdStyle}>
                      <button onClick={() => handleDelete(item.id)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#cbd5e1' }}>
                        <Trash2 size={16} className="hover:text-red-500" />
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

// Estilos da Tabela
const thStyle: React.CSSProperties = { padding: '1rem 0.8rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', whiteSpace: 'nowrap' };
const tdStyle: React.CSSProperties = { padding: '1rem 0.8rem', fontSize: '0.85rem', color: 'var(--text-primary)', whiteSpace: 'nowrap' };