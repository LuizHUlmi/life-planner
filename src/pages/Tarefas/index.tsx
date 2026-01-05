import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase'; // Importa a conexão
import { useAuth } from '../../contexts/AuthContext'; // Pega o usuário logado
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { 
  Plus, CheckCircle2, Circle, Trash2, 
  ListTodo, Calendar, Loader2, Flag
} from 'lucide-react';

// Tipos iguais ao do Banco
type PriorityType = 'alta' | 'media' | 'baixa';
type CategoryType = 'trabalho' | 'pessoal' | 'estudos' | 'metas';

interface Task {
  id: number;
  title: string;
  category: CategoryType;
  priority: PriorityType;
  completed: boolean;
  created_at: string; // Supabase retorna created_at, não createdAt
}

export function Tarefas() {
  const { user } = useAuth(); // Pega dados do usuário logado
  const [loading, setLoading] = useState(true);
  
  // Estado do Formulário
  const [taskTitle, setTaskTitle] = useState('');
  const [taskCategory, setTaskCategory] = useState<CategoryType>('trabalho');
  const [taskPriority, setTaskPriority] = useState<PriorityType>('media');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtro
  const [filter, setFilter] = useState<'all' | 'pending' | 'done'>('pending');

  // Dados Reais
  const [tasks, setTasks] = useState<Task[]>([]);

  // --- 1. CARREGAR TAREFAS DO BANCO (READ) ---
  useEffect(() => {
    fetchTasks();
  }, []);

  async function fetchTasks() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false }); // Mais recentes primeiro

      if (error) throw error;
      if (data) setTasks(data);
    } catch (error) {
      console.error('Erro ao buscar tarefas:', error);
    } finally {
      setLoading(false);
    }
  }

  // --- 2. CRIAR TAREFA (CREATE) ---
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || !user) return;

    try {
      setIsSubmitting(true);
      
      const newTask = {
        user_id: user.id, // Vincula ao seu usuário
        title: taskTitle,
        category: taskCategory,
        priority: taskPriority,
        completed: false
      };

      const { data, error } = await supabase
        .from('tasks')
        .insert([newTask])
        .select()
        .single();

      if (error) throw error;

      // Atualiza a lista localmente
      if (data) setTasks([data, ...tasks]);
      setTaskTitle('');
    } catch (error) {
      alert('Erro ao criar tarefa');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- 3. ATUALIZAR STATUS (UPDATE) ---
  const toggleTask = async (id: number, currentStatus: boolean) => {
    try {
      // Atualização Otimista (Muda na tela antes de confirmar no banco p/ ser rápido)
      setTasks(tasks.map(t => t.id === id ? { ...t, completed: !currentStatus } : t));

      const { error } = await supabase
        .from('tasks')
        .update({ completed: !currentStatus })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      fetchTasks(); // Reverte se der erro
    }
  };

  // --- 4. DELETAR (DELETE) ---
  const deleteTask = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta tarefa?')) return;

    try {
      setTasks(tasks.filter(t => t.id !== id)); // Remove da tela

      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao deletar:', error);
      fetchTasks();
    }
  };

  // Lógica Visual (Cores e Filtros) - Igual ao anterior
  const getPriorityColor = (p: PriorityType) => {
    switch(p) {
      case 'alta': return '#ef4444';
      case 'media': return '#f59e0b';
      case 'baixa': return '#10b981';
      default: return '#94a3b8';
    }
  };

  const filteredTasks = tasks.filter(t => {
    if (filter === 'pending') return !t.completed;
    if (filter === 'done') return t.completed;
    return true;
  });

  const totalPending = tasks.filter(t => !t.completed).length;
  const totalDone = tasks.filter(t => t.completed).length;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
          Minhas Tarefas
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Organize suas prioridades e execute.
        </p>
      </header>

      {/* Estatísticas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <Card style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid var(--primary)' }}>
          <div style={{ padding: '0.8rem', backgroundColor: '#e0e7ff', borderRadius: '50%', color: 'var(--primary)' }}>
            <ListTodo size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Pendentes</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{totalPending}</div>
          </div>
        </Card>

        <Card style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid #10b981' }}>
          <div style={{ padding: '0.8rem', backgroundColor: '#dcfce7', borderRadius: '50%', color: '#166534' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Concluídas</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{totalDone}</div>
          </div>
        </Card>
      </div>

      {/* Formulário */}
      <Card style={{ marginBottom: '2rem', padding: '1.5rem' }}>
        <form onSubmit={handleAddTask} style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
          <div style={{ gridColumn: 'span 1' }}>
            <Input 
              label="Nova Tarefa" 
              placeholder="O que precisa ser feito?" 
              value={taskTitle}
              onChange={e => setTaskTitle(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <Select 
            label="Categoria"
            value={taskCategory}
            onChange={e => setTaskCategory(e.target.value as CategoryType)}
            options={[
              { value: 'trabalho', label: 'Trabalho' },
              { value: 'pessoal', label: 'Pessoal' },
              { value: 'estudos', label: 'Estudos' },
              { value: 'metas', label: 'Metas' },
            ]}
          />

          <Select 
            label="Prioridade"
            value={taskPriority}
            onChange={e => setTaskPriority(e.target.value as PriorityType)}
            options={[
              { value: 'alta', label: 'Alta' },
              { value: 'media', label: 'Média' },
              { value: 'baixa', label: 'Baixa' },
            ]}
          />

          <Button type="submit" style={{ height: '42px', marginBottom: '1px' }} disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <><Plus size={18} /> <span>Adicionar</span></>}
          </Button>
        </form>
      </Card>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        {['pending', 'done', 'all'].map((f) => (
          <button 
            key={f}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onClick={() => setFilter(f as any)}
            style={{ 
              background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', 
              fontWeight: filter === f ? 700 : 500,
              color: filter === f ? 'var(--primary)' : 'var(--text-secondary)',
              borderBottom: filter === f ? '2px solid var(--primary)' : '2px solid transparent',
              textTransform: 'capitalize'
            }}
          >
            {f === 'pending' ? 'A Fazer' : f === 'done' ? 'Concluídas' : 'Todas'}
          </button>
        ))}
      </div>

      {/* Lista */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}><Loader2 className="animate-spin" size={32} color="var(--primary)" /></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredTasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)', border: '2px dashed var(--border-color)', borderRadius: '12px' }}>
              Nenhuma tarefa encontrada.
            </div>
          ) : (
            filteredTasks.map(task => (
              <Card key={task.id} style={{ 
                padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                opacity: task.completed ? 0.6 : 1, transition: 'all 0.2s',
                borderLeft: `4px solid ${getPriorityColor(task.priority)}`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                  <button 
                    onClick={() => toggleTask(task.id, task.completed)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: task.completed ? '#10b981' : 'var(--text-secondary)', display: 'flex' }}
                  >
                    {task.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                  </button>

                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '1.05rem', fontWeight: 500, color: 'var(--text-primary)', textDecoration: task.completed ? 'line-through' : 'none' }}>
                      {task.title}
                    </span>
                    <div style={{ display: 'flex', gap: '0.8rem', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={12} /> {new Date(task.created_at).toLocaleDateString('pt-BR')}
                      </span>
                      <span style={{ backgroundColor: 'var(--bg-page)', padding: '1px 6px', borderRadius: '4px', textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: 700 }}>
                        {task.category}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 600, color: getPriorityColor(task.priority), border: `1px solid ${getPriorityColor(task.priority)}`, padding: '2px 8px', borderRadius: '12px' }}>
                      <Flag size={12} /> {task.priority.toUpperCase()}
                   </div>
                   <button onClick={() => deleteTask(task.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '0.5rem', opacity: 0.6 }} className="hover:opacity-100">
                      <Trash2 size={18} />
                   </button>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}