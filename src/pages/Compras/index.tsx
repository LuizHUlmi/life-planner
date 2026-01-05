import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { 
  Plus, CheckCircle2, 
  AlertCircle, Heart, Clock, DollarSign 
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

// --- FUNÇÃO AUXILIAR DE CONFIGURAÇÃO (Agora fora do componente) ---
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

// --- COMPONENTE COLUNA (Agora separado e recebendo props) ---
interface ColumnProps {
  category: CategoryType;
  items: ShoppingItem[];
  onRemove: (id: number) => void;
}

const ShoppingColumn = ({ category, items, onRemove }: ColumnProps) => {
  const config = getColumnConfig(category);
  // Filtra apenas os itens desta categoria específica
  const categoryItems = items.filter(i => i.category === category);
  const total = categoryItems.reduce((acc, i) => acc + i.price, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, minWidth: '300px' }}>
      
      {/* Cabeçalho da Coluna */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '1rem', 
        borderRadius: 'var(--radius-sm)', 
        borderTop: `4px solid ${config.color}`,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: config.color, marginBottom: '0.2rem' }}>
          {config.icon}
          <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{config.title}</h3>
        </div>
        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.8rem' }}>
          {config.desc}
        </p>
        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          R$ {total.toLocaleString('pt-BR')}
        </div>
      </div>

      {/* Lista de Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {categoryItems.map(item => (
          <Card key={item.id} style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.name}</div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <DollarSign size={12} />
                {item.price.toLocaleString('pt-BR')}
              </div>
            </div>
            <button 
              onClick={() => onRemove(item.id)}
              title="Marcar como comprado/remover"
              style={{ 
                background: 'transparent', border: 'none', cursor: 'pointer', 
                color: '#cbd5e1', transition: 'color 0.2s' 
              }}
            >
              <CheckCircle2 size={24} className="hover:text-green-500" />
            </button>
          </Card>
        ))}
        
        {categoryItems.length === 0 && (
          <div style={{ 
            border: '2px dashed var(--border-color)', 
            borderRadius: 'var(--radius-sm)', 
            padding: '1.5rem', 
            textAlign: 'center', 
            color: 'var(--text-secondary)',
            fontSize: '0.9rem'
          }}>
            Nada aqui por enquanto.
          </div>
        )}
      </div>
    </div>
  );
};

// --- PÁGINA PRINCIPAL ---
export function Compras() {
  // Estado para o formulário rápido
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<CategoryType>('needs');

  // Dados Mockados (Estado Global da Página)
  const [items, setItems] = useState<ShoppingItem[]>([
    { id: 1, name: 'Whey Protein', price: 150, category: 'needs' },
    { id: 2, name: 'Creatina', price: 80, category: 'needs' },
    { id: 3, name: 'Fone Noise Cancelling', price: 1200, category: 'wants' },
    { id: 4, name: 'Livro: Hábitos Atômicos', price: 45, category: 'standby' },
  ]);

  // Adicionar Item
  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName) return;

    const newItem: ShoppingItem = {
      id: Date.now(),
      name: newItemName,
      price: Number(newItemPrice),
      category: newItemCategory
    };

    setItems([...items, newItem]);
    setNewItemName('');
    setNewItemPrice('');
  };

  // Remover Item (Concluir compra)
  const handleRemoveItem = (id: number) => {
    setItems(items.filter(item => item.id !== id));
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
          Lista de Desejos & Compras
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Planejamento financeiro de curto prazo.
        </p>
      </header>

      {/* Input Rápido no Topo */}
      <Card style={{ marginBottom: '2rem', padding: '1.5rem' }}>
        <form onSubmit={handleAddItem} style={{ display: 'flex', gap: '1rem', alignItems: 'end', flexWrap: 'wrap' }}>
          <div style={{ flex: 2, minWidth: '200px' }}>
            <Input 
              label="O que você quer comprar?" 
              placeholder="Ex: Monitor 4K" 
              value={newItemName}
              onChange={e => setNewItemName(e.target.value)}
            />
          </div>
          <div style={{ flex: 1, minWidth: '120px' }}>
            <Input 
              label="Valor (R$)" 
              type="number" 
              placeholder="0,00" 
              value={newItemPrice}
              onChange={e => setNewItemPrice(e.target.value)}
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
          <Button type="submit" style={{ height: '42px', marginBottom: '1px' }}>
            <Plus size={18} /> Adicionar
          </Button>
        </form>
      </Card>

      {/* Grid de 3 Colunas */}
      <div style={{ display: 'flex', gap: '1.5rem', overflowX: 'auto', paddingBottom: '1rem' }}>
        {/* Agora chamamos o componente separado, passando os itens e a função de remover */}
        <ShoppingColumn category="needs" items={items} onRemove={handleRemoveItem} />
        <ShoppingColumn category="wants" items={items} onRemove={handleRemoveItem} />
        <ShoppingColumn category="standby" items={items} onRemove={handleRemoveItem} />
      </div>

    </div>
  );
}