import { Link } from 'react-router-dom';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export function Register() {
  return (
    <div style={{ maxWidth: '400px', margin: '4rem auto', padding: '0 1rem' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>Crie sua conta</h1>
      
      <form>
        <Input label="Nome Completo" placeholder="Seu nome" required />
        <Input label="E-mail" type="email" placeholder="seu@email.com" required />
        <Input label="Senha" type="password" placeholder="******" required />
        <Input label="Confirmar Senha" type="password" placeholder="******" required />
        
        <Button type="submit" fullWidth style={{ marginTop: '1rem' }}>
          Cadastrar
        </Button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '1rem', color: '#666' }}>
        Já tem conta? <Link to="/" style={{ color: '#2563eb' }}>Fazer Login</Link>
      </p>
    </div>
  );
}