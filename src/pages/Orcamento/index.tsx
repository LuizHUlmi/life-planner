import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { 
  Plus, Wallet, ArrowUpCircle, ArrowDownCircle, 
  PieChart, Trash2, Lock, Unlock, 
  ChevronLeft, ChevronRight, Calendar, Loader2, Repeat, CheckCircle2, AlertCircle
} from 'lucide-react';

// --- TIPOS ---
type TransactionType = 'income' | 'expense';
type CostType = 'fixed' | 'variable';

interface Transaction {
  id: number;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  cost_type: CostType;
  installments_current?: number;
  installments_total?: number;
  date: string;
}

export function Orcamento() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // --- NAVEGAÇÃO DE DATA ---
  const [currentDate, setCurrentDate] = useState(new Date());

  // --- DADOS DO BANCO ---
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [expectedExpenses, setExpectedExpenses] = useState<string[]>([]); // Nomes das contas fixas do mês passado

  // --- FORMULÁRIO ---
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Moradia');
  const [type, setType] = useState<TransactionType>('expense');
  const [costType, setCostType] = useState<CostType>('variable');
  
  // Parcelamento & Recorrência
  const [isInstallment, setIsInstallment] = useState(false);
  const [installmentsTotal, setInstallmentsTotal] = useState('');
  const [installmentCurrent, setInstallmentCurrent] = useState('1');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringMonths, setRecurringMonths] = useState('12');

  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);

  // --- 1. BUSCAR DADOS ---
  useEffect(() => {
    fetchTransactions();
    fetchExpectedExpenses(); // Busca o que é esperado base no mês passado
  }, [currentDate]);

  async function fetchTransactions() {
    if (!user) return;
    try {
      setLoading(true);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const firstDay = new Date(year, month, 1).toISOString();
      const lastDay = new Date(year, month + 1, 0).toISOString();

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .gte('date', firstDay)
        .lte('date', lastDay)
        .order('date', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Erro ao buscar finanças:', error);
    } finally {
      setLoading(false);
    }
  }

  // --- NOVA LÓGICA: BUSCAR CONTAS FIXAS DO MÊS PASSADO ---
  async function fetchExpectedExpenses() {
    if (!user) return;
    try {
      // Calcula data do mês anterior
      const prevDate = new Date(currentDate);
      prevDate.setMonth(prevDate.getMonth() - 1);
      
      const year = prevDate.getFullYear();
      const month = prevDate.getMonth();
      const firstDay = new Date(year, month, 1).toISOString();
      const lastDay = new Date(year, month + 1, 0).toISOString();

      // Busca despesas fixas do mês passado
      const { data } = await supabase
        .from('transactions')
        .select('description')
        .eq('type', 'expense')
        .eq('cost_type', 'fixed') // Só o que foi marcado como Fixo
        .gte('date', firstDay)
        .lte('date', lastDay);

      if (data) {
        // Remove duplicatas e salva apenas os nomes
        const uniqueNames = Array.from(new Set(data.map(t => t.description)));
        setExpectedExpenses(uniqueNames);
      }
    } catch (error) {
      console.error(error);
    }
  }

  // --- 2. CÁLCULOS ---
  const income = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const expense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const balance = income - expense;

  const fixedExpenses = transactions.filter(t => t.type === 'expense' && t.cost_type === 'fixed').reduce((acc, t) => acc + t.amount, 0);
  const variableExpenses = transactions.filter(t => t.type === 'expense' && t.cost_type === 'variable').reduce((acc, t) => acc + t.amount, 0);
  
  const fixedPercent = expense > 0 ? (fixedExpenses / expense) * 100 : 0;
  const variablePercent = expense > 0 ? (variableExpenses / expense) * 100 : 0;

  const expensesByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);
  
  const sortedCategories = Object.entries(expensesByCategory).sort(([, a], [, b]) => b - a);

  // --- HELPER: Preencher form ao clicar na pendência ---
  const handleUseReminder = (name: string) => {
    setDesc(name);
    setAmount(''); // Valor vazio para forçar o usuário a ver a conta atual
    setType('expense');
    setCostType('fixed');
    setIsRecurring(false);
    setIsInstallment(false);
    // Rola a página para o topo (opcional)
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- 3. AÇÕES (SALVAR) ---
  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc || !amount || !user) return;

    try {
      setSaving(true);
      const baseTransaction = {
        user_id: user.id, description: desc, amount: Number(amount), type, category,
        cost_type: type === 'income' ? 'fixed' : costType,
        installments_current: isInstallment && type === 'expense' ? Number(installmentCurrent) : null,
        installments_total: isInstallment && type === 'expense' ? Number(installmentsTotal) : null,
      };

      const transactionsToInsert = [];

      if (isRecurring && type === 'expense') {
        const loops = Number(recurringMonths) || 12;
        for (let i = 0; i < loops; i++) {
            const dateObj = new Date(transactionDate);
            dateObj.setMonth(dateObj.getMonth() + i);
            transactionsToInsert.push({ ...baseTransaction, date: dateObj.toISOString().split('T')[0] });
        }
      } else {
        transactionsToInsert.push({ ...baseTransaction, date: transactionDate });
      }

      const { error } = await supabase.from('transactions').insert(transactionsToInsert);
      if (error) throw error;

      if (isRecurring) alert(`${recurringMonths} lançamentos criados!`);

      const tDate = new Date(transactionDate);
      if (tDate.getMonth() === currentDate.getMonth() && tDate.getFullYear() === currentDate.getFullYear()) {
        fetchTransactions();
      }
      
      setDesc(''); setAmount(''); setIsInstallment(false); setIsRecurring(false);
    } catch (error) { alert('Erro ao salvar'); console.error(error); } finally { setSaving(false); }
  };

  const handleRemove = async (id: number) => {
    if (!confirm('Excluir?')) return;
    await supabase.from('transactions').delete().eq('id', id);
    setTransactions(transactions.filter(t => t.id !== id));
  };

  // Navegação
  const handlePrevMonth = () => { const d = new Date(currentDate); d.setMonth(d.getMonth() - 1); setCurrentDate(d); };
  const handleNextMonth = () => { const d = new Date(currentDate); d.setMonth(d.getMonth() + 1); setCurrentDate(d); };
  const formatMonthYear = (date: Date) => date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '2rem' }}>
        <div><h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>Central Financeira</h1></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--bg-card)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
          <button onClick={handlePrevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><ChevronLeft size={20} /></button>
          <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', textTransform: 'capitalize', minWidth: '140px', textAlign: 'center' }}>{formatMonthYear(currentDate)}</span>
          <button onClick={handleNextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><ChevronRight size={20} /></button>
        </div>
      </header>

      {/* KPI CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <Card style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.8rem', backgroundColor: '#dcfce7', borderRadius: '50%', color: '#166534' }}><ArrowUpCircle size={28} /></div>
          <div><div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Receitas</div><div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#166534' }}>R$ {income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div></div>
        </Card>
        <Card style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.8rem', backgroundColor: '#fee2e2', borderRadius: '50%', color: '#b91c1c' }}><ArrowDownCircle size={28} /></div>
          <div><div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Despesas</div><div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#b91c1c' }}>R$ {expense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div></div>
        </Card>
        <Card style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid var(--border-color)' }}>
          <div style={{ padding: '0.8rem', backgroundColor: '#e0e7ff', borderRadius: '50%', color: 'var(--primary)' }}><Wallet size={28} /></div>
          <div><div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Saldo Líquido</div><div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: balance >= 0 ? 'var(--text-primary)' : '#b91c1c' }}>R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div></div>
        </Card>
      </div>

      {/* RAIO-X */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        <Card style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><PieChart size={18} /> Raio-X das Despesas</h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ea580c' }}><Lock size={14} /> Fixos: <strong>{Math.round(fixedPercent)}%</strong></span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#0ea5e9' }}><Unlock size={14} /> Variáveis: <strong>{Math.round(variablePercent)}%</strong></span>
          </div>
          <div style={{ width: '100%', height: '12px', backgroundColor: '#f1f5f9', borderRadius: '6px', overflow: 'hidden', display: 'flex' }}>
            <div style={{ width: `${fixedPercent}%`, backgroundColor: '#ea580c', height: '100%', transition: 'width 0.5s' }} />
            <div style={{ width: `${variablePercent}%`, backgroundColor: '#0ea5e9', height: '100%', transition: 'width 0.5s' }} />
          </div>
        </Card>
        <Card style={{ backgroundColor: '#f8fafc', border: '1px dashed var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <div style={{ textAlign: 'center' }}>
             <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Maior categoria</div>
             <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{sortedCategories.length > 0 ? sortedCategories[0][0] : '-'}</div>
             <div style={{ fontSize: '0.85rem', color: '#ef4444', marginTop: '0.2rem' }}>{sortedCategories.length > 0 ? `R$ ${sortedCategories[0][1].toLocaleString('pt-BR')}` : ''}</div>
          </div>
        </Card>
      </div>

      {/* FORMULÁRIO */}
      <Card style={{ marginBottom: '2rem', padding: '1.5rem', borderLeft: '4px solid var(--primary)' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} /> Adicionar Lançamento
        </h3>
        <form onSubmit={handleAddTransaction}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <Input label="Descrição" placeholder="Ex: Mercado" value={desc} onChange={e => setDesc(e.target.value)} />
            <Input label="Valor (R$)" type="number" placeholder="0,00" value={amount} onChange={e => setAmount(e.target.value)} />
            <Input label="Data" type="date" value={transactionDate} onChange={e => setTransactionDate(e.target.value)} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <Select label="Fluxo" value={type} onChange={e => setType(e.target.value as TransactionType)} options={[{ value: 'expense', label: 'Saída (-)' }, { value: 'income', label: 'Entrada (+)' }]} />
            <Select label="Categoria" value={category} onChange={e => setCategory(e.target.value)} options={[
                { value: 'Moradia', label: '🏠 Moradia' }, { value: 'Alimentação', label: '🍔 Alimentação' }, { value: 'Transporte', label: '🚗 Transporte' }, { value: 'Lazer', label: '🎉 Lazer' }, { value: 'Saúde', label: '💊 Saúde' }, { value: 'Eletrônicos', label: '📱 Eletrônicos' }, { value: 'Salário', label: '💰 Salário' }, { value: 'Investimento', label: 'Investimento' }, { value: 'Outros', label: '📦 Outros' }
            ]} />
            
            {type === 'expense' && (
               <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>Classificação</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Button type="button" variant={costType === 'fixed' ? 'primary' : 'secondary'} onClick={() => setCostType('fixed')} style={{ flex: 1, fontSize: '0.85rem' }}><Lock size={14} /> Fixo</Button>
                    <Button type="button" variant={costType === 'variable' ? 'primary' : 'secondary'} onClick={() => setCostType('variable')} style={{ flex: 1, fontSize: '0.85rem' }}><Unlock size={14} /> Variável</Button>
                  </div>
               </div>
             )}
          </div>

          {type === 'expense' && (
             <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'var(--bg-page)', borderRadius: '8px' }}>
                <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <input type="checkbox" id="installments" checked={isInstallment} onChange={e => { setIsInstallment(e.target.checked); if(e.target.checked) setIsRecurring(false); }} style={{ cursor: 'pointer', width: '16px', height: '16px' }} />
                        <label htmlFor="installments" style={{ cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500 }}>É compra parcelada?</label>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <input type="checkbox" id="recurring" checked={isRecurring} onChange={e => { setIsRecurring(e.target.checked); if(e.target.checked) setIsInstallment(false); }} style={{ cursor: 'pointer', width: '16px', height: '16px' }} />
                        <label htmlFor="recurring" style={{ cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500, color: '#4f46e5' }}>É assinatura/recorrente?</label>
                    </div>
                </div>
                {isInstallment && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem', animation: 'fadeIn 0.3s' }}>
                    <Input label="Parcela Atual" type="number" value={installmentCurrent} onChange={e => setInstallmentCurrent(e.target.value)} />
                    <Input label="Total de Parcelas" type="number" value={installmentsTotal} onChange={e => setInstallmentsTotal(e.target.value)} />
                  </div>
                )}
                {isRecurring && (
                  <div style={{ marginTop: '0.5rem', animation: 'fadeIn 0.3s', backgroundColor: '#eef2ff', padding:'0.8rem', borderRadius:'6px' }}>
                    <div style={{ fontSize: '0.85rem', color: '#3730a3', marginBottom: '0.5rem' }}>
                       <Repeat size={14} style={{ display: 'inline', marginRight: '4px' }} /> Isso criará lançamentos futuros automaticamente.
                    </div>
                    <Input label="Repetir por quantos meses?" type="number" value={recurringMonths} onChange={e => setRecurringMonths(e.target.value)} placeholder="Ex: 12" />
                  </div>
                )}
             </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="submit" disabled={saving} style={{ paddingLeft: '2rem', paddingRight: '2rem' }}>{saving ? <Loader2 className="animate-spin" /> : 'Confirmar Lançamento'}</Button>
          </div>
        </form>
      </Card>

      {/* --- MONITORAMENTO DE CONTAS FIXAS (NOVO) --- */}
      {expectedExpenses.length > 0 && (
         <Card style={{ marginBottom: '2rem', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
               <Lock size={16} color="#64748b" />
               <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>Monitoramento de Contas Fixas</h3>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
              {expectedExpenses.map(expName => {
                // Verifica se já existe uma transação com esse nome (case insensitive) neste mês
                const isPaid = transactions.some(t => t.description.toLowerCase().trim() === expName.toLowerCase().trim());
                
                return (
                  <button
                    key={expName}
                    disabled={isPaid}
                    onClick={() => handleUseReminder(expName)}
                    style={{
                      border: 'none', cursor: isPaid ? 'default' : 'pointer',
                      display: 'flex', alignItems: 'center', gap: '6px',
                      padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600,
                      backgroundColor: isPaid ? '#dcfce7' : '#fff7ed',
                      color: isPaid ? '#166534' : '#c2410c',
                      transition: 'all 0.2s',
                      opacity: isPaid ? 0.7 : 1
                    }}
                  >
                    {isPaid ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                    {expName}
                  </button>
                );
              })}
            </div>
         </Card>
      )}

      {/* EXTRATO */}
      <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
            <Calendar size={20} color="var(--text-secondary)" />
            <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Extrato de {formatMonthYear(currentDate)}</h3>
          </div>
          {loading ? (
             <div style={{ textAlign: 'center', padding: '2rem' }}><Loader2 className="animate-spin" size={32} color="var(--primary)" /></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {transactions.length === 0 ? (
                 <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Nenhum lançamento neste mês.</div>
              ) : (
                transactions.map(t => (
                  <div key={t.id} style={{ 
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', borderRadius: '8px',
                    backgroundColor: 'var(--bg-page)',
                    borderLeft: t.type === 'income' ? '4px solid #166534' : t.cost_type === 'fixed' ? '4px solid #ea580c' : '4px solid #0ea5e9'
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t.description}</span>
                        {t.installments_total && (
                           <span style={{ fontSize: '0.7rem', backgroundColor: '#e0e7ff', color: 'var(--primary)', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>{t.installments_current}/{t.installments_total}</span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.5rem' }}>
                        <span>{new Date(t.date).toLocaleDateString('pt-BR')}</span><span>•</span><span>{t.category}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '1rem', color: t.type === 'income' ? '#166534' : '#b91c1c' }}>
                        {t.type === 'income' ? '+ ' : '- '}
                        R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                      <button onClick={() => handleRemove(t.id)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#cbd5e1' }}>
                        <Trash2 size={18} className="hover:text-red-500" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
      </Card>
    </div>
  );
}