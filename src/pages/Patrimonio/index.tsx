import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { 
  Plus, Landmark, Car, Laptop, Home, 
  Trash2, TrendingUp, Calendar
} from 'lucide-react';

interface Asset {
  id: number;
  name: string;
  estimated_value: number;
  category: string;
  purchase_date: string;
  notes?: string;
}

export function Patrimonio() {
  const { user } = useAuth();
  const [, setLoading] = useState(false);
  
  // Estado do Form
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [category, setCategory] = useState('Eletrônicos');
  const [date, setDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lista
  const [assets, setAssets] = useState<Asset[]>([]);

  // 1. CARREGAR ATIVOS
  useEffect(() => {
    fetchAssets();
  }, [user]);

  async function fetchAssets() {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .order('estimated_value', { ascending: false }); // Do mais caro para o mais barato

      if (error) throw error;
      setAssets(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  // 2. ADICIONAR ATIVO
  const handleAddAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !value || !user) return;

    try {
      setIsSubmitting(true);
      const newAsset = {
        user_id: user.id,
        name,
        estimated_value: Number(value),
        category,
        purchase_date: date || null
      };

      const { data, error } = await supabase
        .from('assets')
        .insert([newAsset])
        .select()
        .single();

      if (error) throw error;

      if (data) setAssets([data, ...assets]);
      
      // Limpa Form
      setName('');
      setValue('');
      setDate('');
    } catch (error) {
      alert('Erro ao adicionar bem.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. REMOVER
  const handleRemove = async (id: number) => {
    if (!confirm('Tem certeza? Isso removerá o bem do seu patrimônio.')) return;
    try {
      const { error } = await supabase.from('assets').delete().eq('id', id);
      if (error) throw error;
      setAssets(assets.filter(a => a.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  // Cálculos
  const totalWealth = assets.reduce((acc, curr) => acc + curr.estimated_value, 0);

  // Helper de Ícone
  const getIcon = (cat: string) => {
    switch(cat) {
      case 'Veículos': return <Car size={20} />;
      case 'Imóveis': return <Home size={20} />;
      case 'Investimentos': return <TrendingUp size={20} />;
      default: return <Laptop size={20} />;
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
          Meus Ativos
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Gestão de patrimônio e bens materiais.
        </p>
      </header>

      {/* KPI TOTAL */}
      <Card style={{ marginBottom: '2rem', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', backgroundColor: '#0f172a', color: 'white' }}>
        <div style={{ padding: '1rem', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}>
          <Landmark size={32} color="#fbbf24" />
        </div>
        <div>
          <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>Patrimônio Estimado</div>
          <div style={{ fontSize: '2.2rem', fontWeight: 'bold', color: '#fbbf24' }}>
            R$ {totalWealth.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </Card>

      {/* FORMULÁRIO */}
      <Card style={{ marginBottom: '2rem', padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>Adicionar Novo Bem</h3>
        <form onSubmit={handleAddAsset} style={{ display: 'grid', gap: '1rem' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
            <Input 
              label="Nome do Bem" 
              placeholder="Ex: Notebook Dell" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              disabled={isSubmitting}
            />
            <Input 
              label="Valor Estimado (R$)" 
              type="number" 
              placeholder="0,00" 
              value={value} 
              onChange={e => setValue(e.target.value)} 
              disabled={isSubmitting}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
             <Select 
                label="Categoria"
                value={category}
                onChange={e => setCategory(e.target.value)}
                options={[
                  { value: 'Eletrônicos', label: 'Eletrônicos / Setup' },
                  { value: 'Veículos', label: 'Veículos' },
                  { value: 'Imóveis', label: 'Imóveis' },
                  { value: 'Investimentos', label: 'Investimentos' },
                  { value: 'Outros', label: 'Outros' },
                ]}
              />
              <Input 
                label="Data Aquisição (Opcional)" 
                type="date" 
                value={date} 
                onChange={e => setDate(e.target.value)} 
              />
              <Button type="submit" style={{ height: '42px', marginBottom: '1px' }} disabled={isSubmitting}>
                <Plus size={18} /> Adicionar
              </Button>
          </div>
        </form>
      </Card>

      {/* LISTA */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {assets.length === 0 ? (
           <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
             Nenhum bem cadastrado.
           </div>
        ) : (
          assets.map(asset => (
            <Card key={asset.id} style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ 
                  padding: '0.8rem', 
                  backgroundColor: 'var(--bg-page)', 
                  borderRadius: '12px', 
                  color: 'var(--text-secondary)' 
                }}>
                  {getIcon(asset.category)}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                    {asset.name}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.8rem', marginTop: '0.2rem' }}>
                    <span style={{ backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: '4px' }}>
                      {asset.category}
                    </span>
                    {asset.purchase_date && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                         <Calendar size={12} /> {new Date(asset.purchase_date).toLocaleDateString('pt-BR')}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Valor Atual</div>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--primary)' }}>
                    R$ {asset.estimated_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <button 
                  onClick={() => handleRemove(asset.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#cbd5e1', padding: '0.5rem' }}
                  title="Remover Bem"
                >
                  <Trash2 size={20} className="hover:text-red-500" />
                </button>
              </div>

            </Card>
          ))
        )}
      </div>

    </div>
  );
}