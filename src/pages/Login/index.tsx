import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Loader2, LogIn } from 'lucide-react';

export function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        alert('Credenciais inválidas. Verifique e tente novamente.');
      } else {
        navigate('/dashboard');
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      alert('Ocorreu um erro inesperado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      backgroundColor: '#f8fafc' 
    }}>
      <Card style={{ width: '100%', maxWidth: '380px', padding: '2.5rem' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ 
            width: '50px', height: '50px', backgroundColor: 'var(--primary)', 
            borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1rem auto', color: 'white'
          }}>
            <LogIn size={24} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
            Bem-vindo de volta
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Acesse seu Life Planner
          </p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          
          <Input 
            type="email" 
            placeholder="E-mail" 

            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />

          <Input 
            type="password" 
            placeholder="Senha" 

            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />

          <Button type="submit" fullWidth disabled={loading} style={{ marginTop: '0.5rem' }}>
            {loading ? <Loader2 className="animate-spin" /> : 'Entrar no Sistema'}
          </Button>
          
        </form>
      </Card>
    </div>
  );
}