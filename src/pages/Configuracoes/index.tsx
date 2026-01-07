import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { LogOut, Github } from 'lucide-react';

export function Configuracoes() {
  const { user, signOut } = useAuth();

  // Função para formatar a data de criação da conta
  const joinDate = user?.created_at 
    ? new Date(user.created_at).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
    : '-';

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
          Configurações da Conta
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Gerencie seu perfil e sessão.
        </p>
      </header>

      <div style={{ display: 'grid', gap: '2rem' }}>
        
        {/* CARTÃO DE PERFIL */}
        <Card style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ 
              width: '80px', height: '80px', 
              backgroundColor: '#e0e7ff', color: 'var(--primary)', 
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2rem', fontWeight: 700
            }}>
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                {user?.user_metadata?.full_name || 'Usuário Life Planner'}
              </h2>
              <p style={{ color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                Membro desde {joinDate}
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gap: '1.5rem' }}>
            <Input 
              label="E-mail de Acesso" 
              value={user?.email || ''} 
              disabled 
            />
            
            <Input 
              label="ID do Usuário (Supabase)" 
              value={user?.id || ''} 
              disabled 
            />
          </div>
        </Card>

        {/* ZONA DE PERIGO / AÇÕES */}
        <Card style={{ padding: '2rem', borderLeft: '4px solid #ef4444' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem', color: '#ef4444' }}>
            Sessão
          </h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Ao sair, você precisará fazer login novamente para acessar seus dados.
          </p>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Button 
              onClick={signOut} 
              style={{ backgroundColor: '#fee2e2', color: '#ef4444', border: '1px solid #fecaca' }}
            >
              <LogOut size={18} /> Sair do Sistema
            </Button>
          </div>
        </Card>

        {/* CRÉDITOS (Opcional - mas legal para portfólio) */}
        <div style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          <p>Life Planner v1.0</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
             <Github size={14} /> Desenvolvido para uso pessoal
          </div>
        </div>

      </div>
    </div>
  );
}