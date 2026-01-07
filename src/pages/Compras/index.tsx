import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { 
  Plus, AlertCircle, Heart, Clock, DollarSign, Trash2, ExternalLink
} from 'lucide-react';

// --- TIPOS ---
type CategoryType = 'needs' | 'wants' | 'standby';

interface ShoppingItem {
  id: number;
  name: string;
  price: number;
  category: CategoryType;
  link?: string;
}

// --- CONFIGURAÇÃO VISUAL DAS COLUNAS ---
const getColumnConfig = (cat: CategoryType) => {
  switch (cat) {
    case 'needs': return { 
      title: 'Essenciais (Preciso)', 
      icon: <AlertCircle size={20} />, 
      color: '#ef4444', 
      desc: 'Prioridade alta. Afeta rotina/trabalho.' 
    };
    case 'wants': return { 
      title: 'Desejos (Quero)', 
      icon: <Heart size={20} />, 
      color: '#8b5cf6', 
      desc: 'Melhora qualidade de vida/Lazer.' 
    };
    case 'standby': return { 
      title: 'Em Espera (Talvez)', 
      icon: <Clock size={20} />, 
      color: '#64748b', 
      desc: 'Ideias ou "regra dos 30 dias".' 
    };
  }
};

// --- COMPONENTE DE COLUNA (Para organizar o código) ---
const ShoppingColumn = ({ category, items, onRemove }: { category: CategoryType, items: ShoppingItem[], onRemove: (id: number) => void }) => {
  const config = getColumnConfig(category);
  const categoryItems = items.filter(i => i.category === category);
  const total = categoryItems.reduce((acc, i) => acc + i.price, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, minWidth: '300px' }}>
      {/* Cabeçalho */}
      <div style={{ 
        backgroundColor: 'white', padding: '1rem', borderRadius: 'var(--radius-sm)', 
        borderTop: `4px solid ${config.color}`, boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: config.color, marginBottom: '0.2rem' }}>
          {config.icon}
          <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{config.title}</h3>
        </div>
        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.8rem' }}>{config.desc}</p>
        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </div>
      </div>

      {/* Lista */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {categoryItems.map(item => (
          <Card key={item.id} style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {item.name}
                {item.link && (
                  <a href={item.link} target="_blank" rel="noreferrer" title="Ver Link" style={{ color: 'var(--primary)', display: 'flex' }}>
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <DollarSign size={12} />
                {item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <button 
              onClick={() => onRemove(item.id)}
              title="Remover / Já comprei"
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#cbd5e1', transition: 'color 0.2s' }}
            >
              <Trash2 size={20} className="hover:text-red-500" />
            </button>
          </Card>
        ))}
        {categoryItems.length === 0 && (
          <div style={{ border: '2px dashed var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '1.5rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Vazio.
          </div>
        )}
      </div>
    </div>
  );
};

// --- PÁGINA PRINCIPAL ---
export function Compras() {
  const { user } = useAuth();
  
  // Estados do Form
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemLink, setNewItemLink] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<CategoryType>('needs');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estado dos Dados
  const [items, setItems] = useState<ShoppingItem[]>([]);

  // 1. CARREGAR ITENS
  useEffect(() => {
    fetchItems();
  }, [user]);

  async function fetchItems() {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('shopping_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error(error);
    }
  }

  // 2. ADICIONAR ITEM
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName || !user) return;

    try {
      setIsSubmitting(true);
      const newItem = {
        user_id: user.id,
        name: newItemName,
        price: Number(newItemPrice),
        category: newItemCategory,
        link: newItemLink
      };

      const { data, error } = await supabase
        .from('shopping_items')
        .insert([newItem])
        .select()
        .single();

      if (error) throw error;
      
      if (data) setItems([data, ...items]);
      
      // Limpa Form
      setNewItemName('');
      setNewItemPrice('');
      setNewItemLink('');
    } catch (error) {
      alert('Erro ao adicionar item.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. REMOVER ITEM
  const handleRemoveItem = async (id: number) => {
    if (!confirm('Deseja remover este item da lista?')) return;
    try {
      const { error } = await supabase.from('shopping_items').delete().eq('id', id);
      if (error) throw error;
      setItems(items.filter(item => item.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
          Lista de Desejos & Compras
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Planeje antes de gastar.
        </p>
      </header>

      {/* Input Rápido */}
      <Card style={{ marginBottom: '2rem', padding: '1.5rem' }}>
        <form onSubmit={handleAddItem} style={{ display: 'flex', gap: '1rem', alignItems: 'end', flexWrap: 'wrap' }}>
          <div style={{ flex: 2, minWidth: '200px' }}>
            <Input 
              label="O que você quer comprar?" 
              placeholder="Ex: Monitor 4K" 
              value={newItemName}
              onChange={e => setNewItemName(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <div style={{ flex: 1, minWidth: '120px' }}>
            <Input 
              label="Valor (R$)" 
              type="number" 
              placeholder="0,00" 
              value={newItemPrice}
              onChange={e => setNewItemPrice(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <div style={{ flex: 1, minWidth: '150px' }}>
             <Input 
              label="Link (Opcional)" 
              placeholder="https://..." 
              value={newItemLink}
              onChange={e => setNewItemLink(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <div style={{ flex: 1, minWidth: '150px' }}>
            <Select 
              label="Prioridade"
              value={newItemCategory}
              onChange={e => setNewItemCategory(e.target.value as CategoryType)}
              options={[
                { value: 'needs', label: 'Preciso (Essencial)' },
                { value: 'wants', label: 'Desejo (Luxo)' },
                { value: 'standby', label: 'Em Espera (Talvez)' },
              ]}
            />
          </div>
          <Button type="submit" style={{ height: '42px', marginBottom: '1px' }} disabled={isSubmitting}>
            <Plus size={18} /> Adicionar
          </Button>
        </form>
      </Card>

      {/* Grid de Colunas */}
      <div style={{ display: 'flex', gap: '1.5rem', overflowX: 'auto', paddingBottom: '1rem' }}>
        <ShoppingColumn category="needs" items={items} onRemove={handleRemoveItem} />
        <ShoppingColumn category="wants" items={items} onRemove={handleRemoveItem} />
        <ShoppingColumn category="standby" items={items} onRemove={handleRemoveItem} />
      </div>

    </div>
  );
}