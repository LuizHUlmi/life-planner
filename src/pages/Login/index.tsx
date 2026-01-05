import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export function Login() {
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div style={{ maxWidth: '400px', margin: '4rem auto', padding: '0 1rem' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>Acesse o Life Planner</h1>
      
      <form onSubmit={handleLogin}>
        <Input label="E-mail" type="email" placeholder="seu@email.com" required />
        <Input label="Senha" type="password" placeholder="******" required />
        
        <Button type="submit" fullWidth isLoading={loading} style={{ marginTop: '1rem' }}>
          Entrar
        </Button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '1rem', color: '#666' }}>
        Não tem conta? <Link to="/register" style={{ color: '#2563eb' }}>Crie agora</Link>
      </p>
    </div>
  );
}