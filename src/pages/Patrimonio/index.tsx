import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';

import { 
  Plus, DollarSign, Laptop, Shirt, Armchair, Car, 
  Tag, AlertTriangle, CheckCircle2 
} from 'lucide-react';

// Tipos de dados
type NicheType = 'eletronicos' | 'vestuario' | 'casa' | 'veiculos';

interface Asset {
  id: number;
  name: string;
  niche: NicheType;
  tags: string[];         // Ex: ['Apple', 'Trabalho']
  purchaseDate: string;
  price: number;
  lifespanYears: number;
}

// Configuração dos Nichos (Ícones e Cores)
const NICHES = {
  eletronicos: { label: 'Eletrônicos', icon: <Laptop size={20} />, color: '#6366f1' }, // Indigo
  vestuario:   { label: 'Vestuário',   icon: <Shirt size={20} />,  color: '#ec4899' }, // Pink
  casa:        { label: 'Casa & Office', icon: <Armchair size={20} />, color: '#10b981' }, // Emerald
  veiculos:    { label: 'Veículos',    icon: <Car size={20} />,    color: '#f59e0b' }, // Amber
};

export function Patrimonio() {
  const [activeNiche, setActiveNiche] = useState<NicheType>('eletronicos');
  const [activeTag, setActiveTag] = useState<string>('Todos');
  const [showForm, setShowForm] = useState(false);

  // --- DADOS MOCKADOS (Exemplos) ---
  const [assets] = useState<Asset[]>([
    // Eletrônicos
    { id: 1, name: 'MacBook Pro M3', niche: 'eletronicos', tags: ['Computadores', 'Apple', 'Trabalho'], purchaseDate: '2024-01-10', price: 14000, lifespanYears: 4 },
    { id: 2, name: 'iPhone 14', niche: 'eletronicos', tags: ['Celulares', 'Apple'], purchaseDate: '2023-05-01', price: 5000, lifespanYears: 2 },
    { id: 3, name: 'Sony A7 III', niche: 'eletronicos', tags: ['Fotografia', 'Sony'], purchaseDate: '2022-08-15', price: 11000, lifespanYears: 5 },
    
    // Vestuário
    { id: 4, name: 'Nike Air Jordan', niche: 'vestuario', tags: ['Tênis', 'Coleção'], purchaseDate: '2023-11-20', price: 1200, lifespanYears: 2 },
    { id: 5, name: 'Relógio Garmin', niche: 'vestuario', tags: ['Relógios', 'Esporte'], purchaseDate: '2023-01-10', price: 2500, lifespanYears: 3 },
    { id: 6, name: 'Jaqueta Couro', niche: 'vestuario', tags: ['Roupas', 'Inverno'], purchaseDate: '2021-06-01', price: 800, lifespanYears: 10 },

    // Casa
    { id: 7, name: 'Cadeira Herman Miller', niche: 'casa', tags: ['Escritório', 'Móveis'], purchaseDate: '2022-02-01', price: 8500, lifespanYears: 12 },
  ]);

  // --- LÓGICA DE FILTRO ---
  // 1. Filtra pelo Nicho Ativo
  const nicheAssets = assets.filter(asset => asset.niche === activeNiche);
  
  // 2. Extrai todas as Tags disponíveis neste Nicho (para criar os botões de filtro)
  const availableTags = ['Todos', ...Array.from(new Set(nicheAssets.flatMap(a => a.tags)))];

  // 3. Filtra pela Tag Ativa
  const filteredAssets = activeTag === 'Todos' 
    ? nicheAssets 
    : nicheAssets.filter(asset => asset.tags.includes(activeTag));

  // 4. Calcula totais
  const totalValue = filteredAssets.reduce((acc, item) => acc + item.price, 0);

  // Função auxiliar de Barra de Vida
  const calculateLife = (date: string, years: number) => {
    const start = new Date(date).getTime();
    const end = new Date(date);
    end.setFullYear(end.getFullYear() + years);
    const now = new Date().getTime();
    
    const total = end.getTime() - start;
    const elapsed = now - start;
    let pct = (elapsed / total) * 100;
    if (pct > 100) pct = 100;
    
    return { 
      pct, 
      label: pct >= 100 ? 'Troca necessária' : `${Math.round(pct)}% utilizado`,
      color: pct > 90 ? '#ef4444' : pct > 50 ? '#f59e0b' : '#10b981' // Red, Amber, Green
    };
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* HEADER */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
            Meus Ativos
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Gerencie o ciclo de vida e valor dos seus bens.
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus size={18} /> Novo Item
        </Button>
      </header>

      {/* --- FORMULÁRIO (Simplificado visualmente) --- */}
      {showForm && (
        <Card style={{ marginBottom: '2rem', border: '1px dashed var(--primary)' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>Cadastrar no Nicho: {NICHES[activeNiche].label}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <Input label="Nome do Item" />
            <Input label="Tags (separar por vírgula)" placeholder="Ex: Apple, Trabalho" />
            <Input label="Valor (R$)" type="number" />
            <Input label="Data Compra" type="date" />
            <Input label="Anos de Vida Útil" type="number" />
          </div>
          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button>Salvar</Button>
          </div>
        </Card>
      )}

      {/* --- NAVEGAÇÃO DE NICHOS (ABAS SUPERIORES) --- */}
      <div style={{ 
        display: 'flex', 
        gap: '0.5rem', 
        borderBottom: '1px solid var(--border-color)', 
        paddingBottom: '1rem', 
        marginBottom: '1.5rem',
        overflowX: 'auto'
      }}>
        {(Object.keys(NICHES) as NicheType[]).map((key) => (
          <button
            key={key}
            onClick={() => { setActiveNiche(key); setActiveTag('Todos'); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.75rem 1.25rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeNiche === key ? 'var(--primary-light)' : 'transparent',
              color: activeNiche === key ? 'var(--primary)' : 'var(--text-secondary)',
              fontWeight: activeNiche === key ? 600 : 500,
              transition: 'all 0.2s'
            }}
          >
            {NICHES[key].icon}
            {NICHES[key].label}
          </button>
        ))}
      </div>

      {/* --- DASHBOARD DO NICHO ATUAL --- */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Card de Valor Total */}
        <Card style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.8rem', backgroundColor: '#ecfdf5', borderRadius: '50%', color: '#059669' }}>
            <DollarSign size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Valor em {NICHES[activeNiche].label}
            </span>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
              R$ {totalValue.toLocaleString('pt-BR')}
            </div>
          </div>
        </Card>

        {/* Card de Contagem */}
        <Card style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.8rem', backgroundColor: '#f1f5f9', borderRadius: '50%', color: 'var(--text-primary)' }}>
            <Tag size={24} />
          </div>
          <div>
             <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Itens Listados
            </span>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
              {filteredAssets.length}
            </div>
          </div>
        </Card>
      </div>

      {/* --- FILTROS DE TAGS (PÍLULAS) --- */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2rem' }}>
        {availableTags.map(tag => (
          <button
            key={tag}
            onClick={() => setActiveTag(tag)}
            style={{
              padding: '0.4rem 1rem',
              borderRadius: '20px',
              border: activeTag === tag ? `1px solid ${NICHES[activeNiche].color}` : '1px solid var(--border-color)',
              backgroundColor: activeTag === tag ? NICHES[activeNiche].color : 'white',
              color: activeTag === tag ? 'white' : 'var(--text-secondary)',
              fontSize: '0.85rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* --- GRID DE ATIVOS --- */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {filteredAssets.map(asset => {
          const life = calculateLife(asset.purchaseDate, asset.lifespanYears);
          
          return (
            <Card key={asset.id} style={{ position: 'relative', overflow: 'hidden', borderLeft: `4px solid ${NICHES[asset.niche].color}` }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                    {asset.name}
                  </h3>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    Adquirido em {new Date(asset.purchaseDate).getFullYear()}
                  </div>
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  R$ {asset.price.toLocaleString('pt-BR')}
                </div>
              </div>

              {/* Tags do Item */}
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                {asset.tags.map(t => (
                  <span key={t} style={{ fontSize: '0.7rem', backgroundColor: 'var(--bg-page)', padding: '2px 8px', borderRadius: '4px', color: 'var(--text-secondary)' }}>
                    #{t}
                  </span>
                ))}
              </div>

              {/* Barra de Vida */}
              <div style={{ marginTop: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.3rem', color: life.color }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {life.pct >= 100 ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />}
                    {life.label}
                  </span>
                  <span>{asset.lifespanYears} anos total</span>
                </div>
                
                <div style={{ width: '100%', height: '6px', backgroundColor: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${life.pct}%`, height: '100%', backgroundColor: life.color, borderRadius: '3px' }} />
                </div>
              </div>

            </Card>
          )
        })}

        {filteredAssets.length === 0 && (
          <div style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)', border: '2px dashed var(--border-color)', borderRadius: '12px' }}>
            Nenhum item encontrado com a tag <strong>"{activeTag}"</strong> em {NICHES[activeNiche].label}.
          </div>
        )}
      </div>

    </div>
  );
}