import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { 
  Plus, Pill, Zap, Leaf, Archive, Minus, Trash2, AlertTriangle 
} from 'lucide-react';

interface Pharmac {
  id: number;
  name: string;
  dosage: string;
  category: string;
  frequency: string;
  stock: number;
  is_active: boolean;
}

export function Farmacos() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // Lista
  const [items, setItems] = useState<Pharmac[]>([]);
  
  // Form
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [category, setCategory] = useState('suplemento');
  const [frequency, setFrequency] = useState('');
  const [stock, setStock] = useState('30');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. CARREGAR DADOS
  useEffect(() => {
    fetchItems();
  }, [user]);

  async function fetchItems() {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pharmacs')
        .select('*')
        .order('is_active', { ascending: false }) // Ativos primeiro
        .order('stock', { ascending: true });     // Stock baixo primeiro

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  // 2. ADICIONAR NOVO
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !user) return;

    try {
      setIsSubmitting(true);
      const payload = {
        user_id: user.id,
        name,
        dosage,
        category,
        frequency,
        stock: Number(stock),
        is_active: true
      };

      const { data, error } = await supabase.from('pharmacs').insert([payload]).select().single();
      if (error) throw error;

      if (data) setItems([data, ...items]);
      
      // Limpar campos
      setName('');
      setDosage('');
      setFrequency('');
      setStock('30');
    } catch (error) {
      alert('Erro ao adicionar.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. AÇÕES RÁPIDAS (STOCK E ESTADO)
  const updateStock = async (id: number, currentStock: number, delta: number) => {
    const newStock = Math.max(0, currentStock + delta);
    
    // Atualização Otimista (Visual)
    setItems(items.map(i => i.id === id ? { ...i, stock: newStock } : i));

    // Atualização no Banco
    await supabase.from('pharmacs').update({ stock: newStock }).eq('id', id);
  };

  const toggleActive = async (id: number, currentStatus: boolean) => {
    setItems(items.map(i => i.id === id ? { ...i, is_active: !currentStatus } : i));
    await supabase.from('pharmacs').update({ is_active: !currentStatus }).eq('id', id);
  };

  const remove = async (id: number) => {
    if (!confirm('Remover permanentemente?')) return;
    setItems(items.filter(i => i.id !== id));
    await supabase.from('pharmacs').delete().eq('id', id);
  };

  // Helper de ícone
  const getIcon = (cat: string) => {
    switch (cat) {
      case 'medicamento': return <Pill size={20} />;
      case 'fitoterapico': return <Leaf size={20} />;
      default: return <Zap size={20} />;
    }
  };

  const activeItems = items.filter(i => i.is_active);
  const inactiveItems = items.filter(i => !i.is_active);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
          Protocolo & Suplementação
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Controlo de doses e stock.
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', alignItems: 'start' }}>
        
        {/* --- FORMULÁRIO (ESQUERDA) --- */}
        <div style={{ position: 'sticky', top: '20px' }}>
          <Card>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>Novo Item</h3>
            <form onSubmit={handleAdd} style={{ display: 'grid', gap: '1rem' }}>
              <Input label="Nome" placeholder="Ex: Creatina" value={name} onChange={e => setName(e.target.value)} disabled={isSubmitting} />
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <Input label="Dose" placeholder="5g" value={dosage} onChange={e => setDosage(e.target.value)} disabled={isSubmitting} />
                <Input type="number" label="Stock (Qtd)" value={stock} onChange={e => setStock(e.target.value)} disabled={isSubmitting} />
              </div>

              <Input label="Frequência / Horário" placeholder="Ex: Pós-treino" value={frequency} onChange={e => setFrequency(e.target.value)} disabled={isSubmitting} />
              
              <Select 
                label="Categoria"
                value={category}
                onChange={e => setCategory(e.target.value)}
                options={[
                  { value: 'suplemento', label: 'Suplemento' },
                  { value: 'medicamento', label: 'Medicamento' },
                  { value: 'fitoterapico', label: 'Fitoterápico' },
                ]}
              />

              <Button type="submit" fullWidth disabled={isSubmitting}>
                <Plus size={18} /> Adicionar
              </Button>
            </form>
          </Card>
        </div>

        {/* --- LISTA (DIREITA) --- */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* ATIVOS */}
          <section>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Zap size={16} /> Em Uso
            </h3>
            
            <div style={{ display: 'grid', gap: '1rem' }}>
              {activeItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', border: '2px dashed var(--border-color)', borderRadius: '12px', color: 'var(--text-secondary)' }}>
                  Nenhum protocolo ativo.
                </div>
              ) : (
                activeItems.map(item => (
                  <Card key={item.id} style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: item.stock < 7 ? '4px solid #f59e0b' : '4px solid #10b981' }}>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ padding: '0.8rem', backgroundColor: 'var(--bg-page)', borderRadius: '12px', color: 'var(--text-primary)' }}>
                        {getIcon(item.category)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '1.05rem', color: 'var(--text-primary)' }}>{item.name}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                          {item.dosage} • {item.frequency}
                        </div>
                        {item.stock < 7 && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#f59e0b', marginTop: '0.4rem', fontWeight: 600 }}>
                            <AlertTriangle size={12} /> Stock Baixo
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'end', gap: '0.5rem' }}>
                      {/* Controlos de Stock */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#f8fafc', padding: '4px', borderRadius: '8px' }}>
                        <button onClick={() => updateStock(item.id, item.stock, -1)} style={{ width: '24px', height: '24px', border: 'none', background: 'white', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                          <Minus size={14} />
                        </button>
                        <span style={{ fontSize: '0.9rem', fontWeight: 600, minWidth: '24px', textAlign: 'center' }}>{item.stock}</span>
                        <button onClick={() => updateStock(item.id, item.stock, 1)} style={{ width: '24px', height: '24px', border: 'none', background: 'white', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                          <Plus size={14} />
                        </button>
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => toggleActive(item.id, item.is_active)} style={{ fontSize: '0.75rem', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-secondary)', textDecoration: 'underline' }}>
                          Arquivar
                        </button>
                      </div>
                    </div>

                  </Card>
                ))
              )}
            </div>
          </section>

          {/* INATIVOS / HISTÓRICO */}
          {inactiveItems.length > 0 && (
            <section>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Archive size={16} /> Histórico
              </h3>
              <div style={{ display: 'grid', gap: '0.8rem', opacity: 0.7 }}>
                {inactiveItems.map(item => (
                  <Card key={item.id} style={{ padding: '0.8rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f9fafb' }}>
                    <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                       <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{item.name}</div>
                       <span style={{ fontSize: '0.8rem', padding: '2px 6px', backgroundColor: '#e2e8f0', borderRadius: '4px', color: '#64748b' }}>{item.category}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <button onClick={() => toggleActive(item.id, item.is_active)} style={{ fontSize: '0.8rem', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--primary)', fontWeight: 600 }}>
                        Reativar
                      </button>
                      <button onClick={() => remove(item.id)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#cbd5e1' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}

        </div>
      </div>
    </div>
  );
}