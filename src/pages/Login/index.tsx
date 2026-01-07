/* src/pages/Login/index.tsx */
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Flower2, Loader2 } from "lucide-react";
// Assumindo que você pode ter um arquivo CSS ou usando classes utilitárias
import styles from "./Login.module.css"; 

export function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth(); // Se estiver usando Contexto
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e?: React.FormEvent) {
    // Previne o recarregamento da página se vier do formulário
    if (e) e.preventDefault();
    
    setLoading(true);
    setError("");

    try {
      // Simulação ou chamada real do Supabase
      await signIn(email, password); 
      navigate("/dashboard");
    } catch (err) {
      setError("Falha ao entrar. Verifique seus dados.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        
        <div className={styles.header}>
          <Flower2 size={48} className={styles.logo} />
          <h1>Bem-vindo de volta</h1>
          <p>Acesse seu Life Planner</p>
        </div>

        {/* O segredo está aqui: A tag FORM */}
        <form onSubmit={handleLogin} className={styles.form}>
          
          <Input
            label="E-mail"
            type="email"
            // Atributos cruciais para o Autofill:
            name="email"
            autoComplete="email" 
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Senha"
            type="password"
            // Atributos cruciais para o Autofill:
            name="password"
            autoComplete="current-password"
            placeholder="Sua senha secreta"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <span className={styles.error}>{error}</span>}

          <Button type="submit" disabled={loading} className={styles.submitButton}>
            {loading ? <Loader2 className="animate-spin" /> : "Entrar"}
          </Button>
        </form>

        <div className={styles.footer}>
          <span>Não tem uma conta? </span>
          <Link to="/register">Crie agora</Link>
        </div>
      </div>
    </div>
  );
}