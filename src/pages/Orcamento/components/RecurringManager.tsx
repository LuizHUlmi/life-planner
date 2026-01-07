import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Plus, Trash2, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

interface RecurringExpense {
  id: number;
  description: string;
  amount: number;
  category: string;
  day_of_month: number;
  last_generated: string | null;
}

export function RecurringManager({ onTransactionAdded }: { onTransactionAdded: () => void }) {
  const { user } = useAuth();
  const [items, setItems] = useState<RecurringExpense[]>([]);
  const [] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Form
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [day, setDay] = useState('');
  const [cat, setCat] = useState('Moradia');

  useEffect(() => {
    if (user) fetchRecurring();
  }, [user]);

  async function fetchRecurring() {
    const { data } = await supabase
      .from('recurring_expenses')
      .select('*')
      .eq('active', true)
      .order('day_of_month', { ascending: true });
    setItems(data || []);
  }

  // --- 1. ADICIONAR NOVA RECORRÊNCIA ---
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc || !amount || !day || !user) return;

    try {
      const { error } = await supabase.from('recurring_expenses').insert([{
        user_id: user.id,
        description: desc,
        amount: Number(amount),
        category: cat,
        day_of_month: Number(day)
      }]);

      if (error) throw error;
      
      setDesc(''); setAmount(''); setDay('');
      fetchRecurring();
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar recorrente.');
    }
  };

  // --- 2. DELETAR (DESATIVAR) ---
  const handleDelete = async (id: number) => {
    if(!confirm("Remover esta despesa recorrente?")) return;
    await supabase.from('recurring_expenses').update({ active: false }).eq('id', id);
    fetchRecurring();
  };

  // --- 3. O "PULO DO GATO": PROCESSAR O MÊS ATUAL ---
  const handleProcessMonth = async () => {
    if (!user || items.length === 0) return;
    setProcessing(true);

    try {
      const today = new Date();
      const currentMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`; // "2023-10"
      
      let count = 0;

      for (const item of items) {
        // Verifica se já foi gerado neste mês (comparando YYYY-MM do last_generated)
        const lastGen = item.last_generated ? item.last_generated.substring(0, 7) : ''; // "2023-09"
        
        if (lastGen !== currentMonthStr) {
          // Precisa gerar!
          // 1. Cria a transação real
          const { error: txError } = await supabase.from('transactions').insert([{
            user_id: user.id,
            description: item.description,
            amount: -Math.abs(item.amount), // Garante que é negativo (despesa)
            type: 'expense',
            category: item.category,
            date: `${currentMonthStr}-${String(item.day_of_month).padStart(2, '0')}` // Data correta do vencimento
          }]);

          if (txError) throw txError;

          // 2. Atualiza a flag na recorrente
          await supabase.from('recurring_expenses')
            .update({ last_generated: `${currentMonthStr}-${String(item.day_of_month).padStart(2, '0')}` })
            .eq('id', item.id);
          
          count++;
        }
      }

      if (count > 0) {
        alert(`${count} despesas foram lançadas no extrato deste mês!`);
        onTransactionAdded(); // Atualiza a lista principal
        fetchRecurring();     // Atualiza a lista local
      } else {
        alert('Tudo em dia! Nenhuma despesa pendente para este mês.');
      }

    } catch (error) {
      alert('Erro ao processar recorrentes.');
      console.error(error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Card style={{ marginBottom: '2rem', border: '1px solid #c7d2fe', backgroundColor: '#eef2ff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#3730a3', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <RefreshCw size={20} /> Despesas Fixas & Assinaturas
        </h3>
        <Button 
          onClick={handleProcessMonth} 
          disabled={processing}
          style={{ backgroundColor: '#4f46e5', color: 'white' }}
        >
          {processing ? 'Verificando...' : 'Verificar/Lançar Mês Atual'}
        </Button>
      </div>

      {/* LISTA DE RECORRENTES */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        {items.map(item => {
          const isPaidThisMonth = item.last_generated && new Date(item.last_generated).getMonth() === new Date().getMonth();
          
          return (
            <div key={item.id} style={{ 
              backgroundColor: 'white', padding: '0.8rem', borderRadius: '8px', 
              border: '1px solid #e0e7ff', display: 'flex', alignItems: 'center', gap: '1rem',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontWeight: 600, color: '#1e1b4b' }}>{item.description}</span>
                <span style={{ fontSize: '0.75rem', color: '#6366f1' }}>Dia {item.day_of_month} • R$ {item.amount}</span>
              </div>
              
              <div title={isPaidThisMonth ? "Já lançado este mês" : "Pendente este mês"}>
                {isPaidThisMonth ? <CheckCircle2 size={18} color="#10b981" /> : <AlertCircle size={18} color="#f59e0b" />}
              </div>

              <button onClick={() => handleDelete(item.id)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#cbd5e1' }}>
                <Trash2 size={14} />
              </button>
            </div>
          );
        })}
        {items.length === 0 && <span style={{ fontSize: '0.9rem', color: '#6b7280', fontStyle: 'italic' }}>Nenhuma conta fixa cadastrada.</span>}
      </div>

      {/* FORMULÁRIO RÁPIDO */}
      <form onSubmit={handleAdd} style={{ display: 'flex', gap: '0.5rem', alignItems: 'end', borderTop: '1px solid #e0e7ff', paddingTop: '1rem' }}>
        <div style={{ flex: 2 }}>
          <Input placeholder="Nome (Ex: Aluguel)" value={desc} onChange={e => setDesc(e.target.value)} />
        </div>
        <div style={{ width: '100px' }}>
          <Input type="number" placeholder="R$" value={amount} onChange={e => setAmount(e.target.value)} />
        </div>
        <div style={{ width: '80px' }}>
          <Input type="number" placeholder="Dia" min={1} max={31} value={day} onChange={e => setDay(e.target.value)} />
        </div>
        <div style={{ width: '140px' }}>
           <Select 
             value={cat} onChange={e => setCat(e.target.value)}
             options={[
               { value: 'Moradia', label: 'Moradia' },
               { value: 'Alimentação', label: 'Alimentação' },
               { value: 'Transporte', label: 'Transporte' },
               { value: 'Lazer', label: 'Lazer' },
               { value: 'Saúde', label: 'Saúde' },
               { value: 'Serviços', label: 'Serviços' },
             ]}
           />
        </div>
        <Button type="submit"  style={{ height: '42px', marginBottom: '1px' }}>
          <Plus size={18} />
        </Button>
      </form>
    </Card>
  );
}