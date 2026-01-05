import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Save, UserCog } from 'lucide-react';

export function Configuracoes() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
          Ajustes & Perfil
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Gerencie seus dados pessoais e preferências do sistema.
        </p>
      </header>

      <form onSubmit={(e) => e.preventDefault()}>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
            <UserCog color="var(--primary)" size={24} />
            <h3 style={{ fontSize: '1.1rem', margin: 0, fontWeight: 600, color: 'var(--text-primary)' }}>
              Dados Pessoais
            </h3>
          </div>

          <div style={{ display: 'grid', gap: '1.5rem' }}>
            
            {/* Nome Completo */}
            <Input 
              label="Nome Completo" 
              placeholder="Digite seu nome" 
              defaultValue="Luiz Silva" // Valor de exemplo
            />

            {/* Data de Nascimento */}
            <div style={{ maxWidth: '300px' }}>
              <Input 
                label="Data de Nascimento" 
                type="date"
                defaultValue="1995-05-20" // Valor de exemplo
              />
            </div>

            {/* Futuramente podemos adicionar aqui: Foto de Perfil, Tema (Claro/Escuro), etc */}
          
          </div>

          {/* Botão Salvar */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
            <Button type="submit" variant="primary" style={{ paddingLeft: '2rem', paddingRight: '2rem' }}>
              <Save size={18} />
              Salvar Alterações
            </Button>
          </div>

        </Card>
      </form>
    </div>
  );
}