import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { 
  Plus, CheckCircle2, Circle, Trash2, 
  ListTodo, Calendar, Flag
} from 'lucide-react';

// Tipos
type PriorityType = 'alta' | 'media' | 'baixa';
type CategoryType = 'trabalho' | 'pessoal' | 'estudos' | 'metas';

interface Task {
  id: number;
  title: string;
  category: CategoryType;
  priority: PriorityType;
  completed: boolean;
  createdAt: string;
}

export function Tarefas() {
  // Estado do Formulário
  const [taskTitle, setTaskTitle] = useState('');
  const [taskCategory, setTaskCategory] = useState<CategoryType>('trabalho');
  const [taskPriority, setTaskPriority] = useState<PriorityType>('media');

  // Filtro de Visualização
  const [filter, setFilter] = useState<'all' | 'pending' | 'done'>('pending');

  // Dados Mockados
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, title: 'Revisar planilha de gastos', category: 'pessoal', priority: 'alta', completed: false, createdAt: '2023-10-20' },
    { id: 2, title: 'Finalizar apresentação do projeto', category: 'trabalho', priority: 'alta', completed: false, createdAt: '2023-10-21' },
    { id: 3, title: 'Comprar presente de aniversário', category: 'pessoal', priority: 'baixa', completed: true, createdAt: '2023-10-18' },
    { id: 4, title: 'Ler 20 páginas do livro', category: 'estudos', priority: 'media', completed: false, createdAt: '2023-10-22' },
  ]);

  // Adicionar Tarefa
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    const newTask: Task = {
      id: Date.now(),
      title: taskTitle,
      category: taskCategory,
      priority: taskPriority,
      completed: false,
      createdAt: new Date().toLocaleDateString('pt-BR')
    };

    setTasks([newTask, ...tasks]);
    setTaskTitle('');
  };

  // Alternar Status (Concluir/Reabrir)
  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  // Deletar
  const deleteTask = (id: number) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  // Lógica de Cores e Labels
  const getPriorityColor = (p: PriorityType) => {
    switch(p) {
      case 'alta': return '#ef4444'; // Vermelho
      case 'media': return '#f59e0b'; // Amarelo
      case 'baixa': return '#10b981'; // Verde
    }
  };

  const getCategoryLabel = (c: CategoryType) => {
    return c.charAt(0).toUpperCase() + c.slice(1);
  };

  // Filtragem
  const filteredTasks = tasks.filter(t => {
    if (filter === 'pending') return !t.completed;
    if (filter === 'done') return t.completed;
    return true;
  });

  // Estatísticas
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

      {/* --- ESTATÍSTICAS RÁPIDAS --- */}
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

      {/* --- NOVA TAREFA --- */}
      <Card style={{ marginBottom: '2rem', padding: '1.5rem' }}>
        <form onSubmit={handleAddTask} style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
          
          {/* Mobile: Em telas pequenas, o grid deve quebrar. Adicionei lógica CSS inline simples */}
          <div style={{ gridColumn: 'span 1' }}>
            <Input 
              label="Nova Tarefa" 
              placeholder="O que precisa ser feito?" 
              value={taskTitle}
              onChange={e => setTaskTitle(e.target.value)}
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

          <Button type="submit" style={{ height: '42px', marginBottom: '1px' }}>
            <Plus size={18} /> <span className="hidden-mobile">Adicionar</span>
          </Button>

        </form>
      </Card>

      {/* --- FILTROS --- */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        <button 
          onClick={() => setFilter('pending')}
          style={{ 
            background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', 
            fontWeight: filter === 'pending' ? 700 : 500,
            color: filter === 'pending' ? 'var(--primary)' : 'var(--text-secondary)',
            borderBottom: filter === 'pending' ? '2px solid var(--primary)' : '2px solid transparent'
          }}
        >
          A Fazer
        </button>
        <button 
          onClick={() => setFilter('done')}
          style={{ 
            background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', 
            fontWeight: filter === 'done' ? 700 : 500,
            color: filter === 'done' ? '#10b981' : 'var(--text-secondary)',
            borderBottom: filter === 'done' ? '2px solid #10b981' : '2px solid transparent'
          }}
        >
          Concluídas
        </button>
        <button 
          onClick={() => setFilter('all')}
          style={{ 
            background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', 
            fontWeight: filter === 'all' ? 700 : 500,
            color: filter === 'all' ? 'var(--text-primary)' : 'var(--text-secondary)',
            borderBottom: filter === 'all' ? '2px solid var(--text-primary)' : '2px solid transparent'
          }}
        >
          Todas
        </button>
      </div>

      {/* --- LISTA --- */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredTasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)', border: '2px dashed var(--border-color)', borderRadius: '12px' }}>
            {filter === 'pending' ? 'Tudo limpo! Nenhuma tarefa pendente.' : 'Nenhuma tarefa encontrada.'}
          </div>
        ) : (
          filteredTasks.map(task => (
            <Card key={task.id} style={{ 
              padding: '1rem 1.5rem', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              opacity: task.completed ? 0.6 : 1,
              transition: 'all 0.2s',
              borderLeft: `4px solid ${getPriorityColor(task.priority)}`
            }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                {/* Checkbox Button */}
                <button 
                  onClick={() => toggleTask(task.id)}
                  style={{ 
                    background: 'none', border: 'none', cursor: 'pointer', 
                    color: task.completed ? '#10b981' : 'var(--text-secondary)',
                    display: 'flex', alignItems: 'center'
                  }}
                >
                  {task.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                </button>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ 
                    fontSize: '1.05rem', 
                    fontWeight: 500, 
                    color: 'var(--text-primary)',
                    textDecoration: task.completed ? 'line-through' : 'none'
                  }}>
                    {task.title}
                  </span>
                  
                  <div style={{ display: 'flex', gap: '0.8rem', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={12} /> {task.createdAt}
                    </span>
                    <span style={{ 
                      backgroundColor: 'var(--bg-page)', 
                      padding: '1px 6px', 
                      borderRadius: '4px',
                      textTransform: 'uppercase',
                      fontSize: '0.7rem',
                      fontWeight: 700
                    }}>
                      {getCategoryLabel(task.category)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Ações / Badges */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {/* Badge de Prioridade (Visível Desktop) */}
                <div style={{ 
                  display: 'flex', alignItems: 'center', gap: '4px', 
                  fontSize: '0.8rem', fontWeight: 600, 
                  color: getPriorityColor(task.priority),
                  border: `1px solid ${getPriorityColor(task.priority)}`,
                  padding: '2px 8px', borderRadius: '12px'
                }}>
                  <Flag size={12} />
                  {task.priority.toUpperCase()}
                </div>

                <button 
                  onClick={() => deleteTask(task.id)}
                  style={{ 
                    background: 'none', border: 'none', cursor: 'pointer', 
                    color: '#ef4444', padding: '0.5rem', opacity: 0.6
                  }}
                  className="hover:opacity-100"
                >
                  <Trash2 size={18} />
                </button>
              </div>

            </Card>
          ))
        )}
      </div>

    </div>
  );
}