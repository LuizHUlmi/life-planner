import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { 
  Plus, Wallet, ArrowUpCircle, ArrowDownCircle, 
  PieChart, Trash2, Lock, Unlock, 
  ChevronLeft, ChevronRight, Calendar
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
  costType: CostType;
  installments?: { current: number; total: number };
  date: string; // Formato YYYY-MM-DD
}

export function Orcamento() {
  // --- ESTADO DE NAVEGAÇÃO DE DATA ---
  // Começa no dia atual, mas usaremos apenas Mês e Ano para filtrar
  const [currentDate, setCurrentDate] = useState(new Date());

  // --- ESTADOS DO FORMULÁRIO ---
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Alimentação');
  const [type, setType] = useState<TransactionType>('expense');
  const [costType, setCostType] = useState<CostType>('variable');
  
  // Controle de Parcelamento
  const [isInstallment, setIsInstallment] = useState(false);
  const [installmentsTotal, setInstallmentsTotal] = useState('');
  const [installmentCurrent, setInstallmentCurrent] = useState('1');
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]); // Data do lançamento

  // --- DADOS MOCKADOS (Espalhados por meses para teste) ---
  const [transactions, setTransactions] = useState<Transaction[]>([
    // OUTUBRO (Mês atual no exemplo)
    { id: 1, description: 'Salário Mensal', amount: 8500, type: 'income', category: 'Salário', costType: 'fixed', date: '2023-10-05' },
    { id: 2, description: 'Aluguel', amount: 2200, type: 'expense', category: 'Moradia', costType: 'fixed', date: '2023-10-10' },
    { id: 3, description: 'iPhone 15 (3/12)', amount: 450, type: 'expense', category: 'Eletrônicos', costType: 'fixed', installments: { current: 3, total: 12 }, date: '2023-10-12' },
    
    // NOVEMBRO (Futuro)
    { id: 4, description: 'Salário Mensal', amount: 8500, type: 'income', category: 'Salário', costType: 'fixed', date: '2023-11-05' },
    { id: 5, description: 'Aluguel', amount: 2200, type: 'expense', category: 'Moradia', costType: 'fixed', date: '2023-11-10' },
    { id: 6, description: 'iPhone 15 (4/12)', amount: 450, type: 'expense', category: 'Eletrônicos', costType: 'fixed', installments: { current: 4, total: 12 }, date: '2023-11-12' },
    { id: 7, description: 'Viagem Feriado', amount: 1500, type: 'expense', category: 'Lazer', costType: 'variable', date: '2023-11-15' },

    // SETEMBRO (Passado)
    { id: 8, description: 'Manutenção Carro', amount: 800, type: 'expense', category: 'Transporte', costType: 'variable', date: '2023-09-20' },
  ]);

  // --- FUNÇÕES DE NAVEGAÇÃO ---
  const handlePrevMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  // --- FILTRAGEM (O CORAÇÃO DO SISTEMA) ---
  // Filtramos tudo o que acontece na tela baseando-se no mês selecionado
  const filteredTransactions = transactions.filter(t => {
    const tDate = new Date(t.date + 'T12:00:00'); // Hack de fuso horário simples
    return tDate.getMonth() === currentDate.getMonth() && 
           tDate.getFullYear() === currentDate.getFullYear();
  });

  // --- CÁLCULOS (Usam apenas os filtrados) ---
  const income = filteredTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const expense = filteredTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const balance = income - expense;

  const fixedExpenses = filteredTransactions.filter(t => t.type === 'expense' && t.costType === 'fixed').reduce((acc, t) => acc + t.amount, 0);
  const variableExpenses = filteredTransactions.filter(t => t.type === 'expense' && t.costType === 'variable').reduce((acc, t) => acc + t.amount, 0);
  
  const fixedPercent = expense > 0 ? (fixedExpenses / expense) * 100 : 0;
  const variablePercent = expense > 0 ? (variableExpenses / expense) * 100 : 0;

  // Agrupamento por Categoria
  const expensesByCategory = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);
  
  const sortedCategories = Object.entries(expensesByCategory).sort(([, a], [, b]) => b - a);

  // --- AÇÕES ---
  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc || !amount) return;

    const newTrans: Transaction = {
      id: Date.now(),
      description: desc,
      amount: Number(amount),
      type,
      category,
      costType: type === 'income' ? 'fixed' : costType,
      installments: isInstallment && type === 'expense' ? { 
        current: Number(installmentCurrent), 
        total: Number(installmentsTotal) 
      } : undefined,
      date: transactionDate // Usa a data escolhida no input
    };

    setTransactions([newTrans, ...transactions]);
    
    // Reset Form
    setDesc('');
    setAmount('');
    setIsInstallment(false);
  };

  const handleRemove = (id: number) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
            Central Financeira
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Planejamento e controle de fluxo de caixa.
          </p>
        </div>

        {/* --- NAVEGADOR DE MESES --- */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--bg-card)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <button 
            onClick={handlePrevMonth} 
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}
            title="Mês Anterior"
          >
            <ChevronLeft size={20} />
          </button>
          
          <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', textTransform: 'capitalize', minWidth: '140px', textAlign: 'center' }}>
            {formatMonthYear(currentDate)}
          </span>
          
          <button 
            onClick={handleNextMonth} 
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}
            title="Próximo Mês"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </header>

      {/* --- 1. KPI CARDS (RESUMO DO MÊS SELECIONADO) --- */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <Card style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.8rem', backgroundColor: '#dcfce7', borderRadius: '50%', color: '#166534' }}>
            <ArrowUpCircle size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Receitas</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#166534' }}>
              R$ {income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </Card>

        <Card style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.8rem', backgroundColor: '#fee2e2', borderRadius: '50%', color: '#b91c1c' }}>
            <ArrowDownCircle size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Despesas</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#b91c1c' }}>
              R$ {expense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </Card>

        <Card style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid var(--border-color)' }}>
          <div style={{ padding: '0.8rem', backgroundColor: '#e0e7ff', borderRadius: '50%', color: 'var(--primary)' }}>
            <Wallet size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Saldo Líquido</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: balance >= 0 ? 'var(--text-primary)' : '#b91c1c' }}>
              R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </Card>
      </div>

      {/* --- 2. ANÁLISE DE COMPROMETIMENTO --- */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        <Card style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
             <PieChart size={18} /> Raio-X das Despesas ({formatMonthYear(currentDate)})
          </h3>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ea580c' }}>
              <Lock size={14} /> Fixos: <strong>{Math.round(fixedPercent)}%</strong>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#0ea5e9' }}>
              <Unlock size={14} /> Variáveis: <strong>{Math.round(variablePercent)}%</strong>
            </span>
          </div>
          
          <div style={{ width: '100%', height: '12px', backgroundColor: '#f1f5f9', borderRadius: '6px', overflow: 'hidden', display: 'flex' }}>
            <div style={{ width: `${fixedPercent}%`, backgroundColor: '#ea580c', height: '100%', transition: 'all 0.5s' }} />
            <div style={{ width: `${variablePercent}%`, backgroundColor: '#0ea5e9', height: '100%', transition: 'all 0.5s' }} />
          </div>
        </Card>

        <Card style={{ backgroundColor: '#f8fafc', border: '1px dashed var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <div style={{ textAlign: 'center' }}>
             <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Maior categoria</div>
             <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
               {sortedCategories.length > 0 ? sortedCategories[0][0] : '-'}
             </div>
             <div style={{ fontSize: '0.85rem', color: '#ef4444', marginTop: '0.2rem' }}>
                {sortedCategories.length > 0 ? `R$ ${sortedCategories[0][1].toLocaleString()}` : ''}
             </div>
          </div>
        </Card>
      </div>

      {/* --- 3. FORMULÁRIO DE LANÇAMENTO --- */}
      <Card style={{ marginBottom: '2rem', padding: '1.5rem', borderLeft: '4px solid var(--primary)' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} /> Adicionar Lançamento
        </h3>
        
        <form onSubmit={handleAddTransaction}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <Input 
              label="Descrição" 
              placeholder="Ex: Compra no Shopping" 
              value={desc} 
              onChange={e => setDesc(e.target.value)}
            />
            <Input 
              label="Valor (R$)" 
              type="number" 
              placeholder="0,00" 
              value={amount}
              onChange={e => setAmount(e.target.value)}
            />
            <Input 
              label="Data" 
              type="date" 
              value={transactionDate}
              onChange={e => setTransactionDate(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <Select 
              label="Fluxo"
              value={type}
              onChange={e => setType(e.target.value as TransactionType)}
              options={[
                { value: 'expense', label: 'Saída (-)' },
                { value: 'income', label: 'Entrada (+)' },
              ]}
            />
            <Select 
              label="Categoria"
              value={category}
              onChange={e => setCategory(e.target.value)}
              options={[
                { value: 'Moradia', label: '🏠 Moradia' },
                { value: 'Alimentação', label: '🍔 Alimentação' },
                { value: 'Transporte', label: '🚗 Transporte' },
                { value: 'Lazer', label: '🎉 Lazer' },
                { value: 'Saúde', label: '💊 Saúde' },
                { value: 'Eletrônicos', label: '📱 Eletrônicos' },
                { value: 'Salário', label: '💰 Salário' },
                { value: 'Investimento', label: 'Investimento' },
                { value: 'Outros', label: '📦 Outros' },
              ]}
            />
             {type === 'expense' && (
               <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>Classificação</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Button type="button" variant={costType === 'fixed' ? 'primary' : 'secondary'} onClick={() => setCostType('fixed')} style={{ flex: 1, fontSize: '0.85rem' }}>
                      <Lock size={14} /> Fixo
                    </Button>
                    <Button type="button" variant={costType === 'variable' ? 'primary' : 'secondary'} onClick={() => setCostType('variable')} style={{ flex: 1, fontSize: '0.85rem' }}>
                      <Unlock size={14} /> Variável
                    </Button>
                  </div>
               </div>
             )}
          </div>

          {type === 'expense' && (
             <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'var(--bg-page)', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <input type="checkbox" id="installments" checked={isInstallment} onChange={e => setIsInstallment(e.target.checked)} style={{ cursor: 'pointer', width: '16px', height: '16px' }} />
                  <label htmlFor="installments" style={{ cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500 }}>É parcelado?</label>
                </div>
                {isInstallment && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
                    <Input label="Parcela Atual" type="number" value={installmentCurrent} onChange={e => setInstallmentCurrent(e.target.value)} />
                    <Input label="Total de Parcelas" type="number" value={installmentsTotal} onChange={e => setInstallmentsTotal(e.target.value)} />
                  </div>
                )}
             </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="submit" style={{ paddingLeft: '2rem', paddingRight: '2rem' }}>Confirmar Lançamento</Button>
          </div>
        </form>
      </Card>

      {/* --- 4. EXTRATO (FILTRADO POR DATA) --- */}
      <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
            <Calendar size={20} color="var(--text-secondary)" />
            <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Extrato de {formatMonthYear(currentDate)}</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {filteredTransactions.length === 0 ? (
               <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Nenhum lançamento neste mês.</div>
            ) : (
              filteredTransactions.map(t => (
                <div key={t.id} style={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                  padding: '1rem', borderRadius: '8px',
                  backgroundColor: 'var(--bg-page)',
                  borderLeft: t.type === 'income' ? '4px solid #166534' : t.costType === 'fixed' ? '4px solid #ea580c' : '4px solid #0ea5e9'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t.description}</span>
                      {t.installments && (
                         <span style={{ fontSize: '0.7rem', backgroundColor: '#e0e7ff', color: 'var(--primary)', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                            {t.installments.current}/{t.installments.total}
                         </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.5rem' }}>
                      <span>{new Date(t.date).toLocaleDateString('pt-BR')}</span>
                      <span>•</span>
                      <span>{t.category}</span>
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
      </Card>
    </div>
  );
}