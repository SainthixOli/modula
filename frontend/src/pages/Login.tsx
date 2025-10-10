import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "@/services/auth.service"; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import logomodula from '../components/assets/logo.png'; 
import mosaicologin from '../components/assets/mosaic.png'; 

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Faz o login e pega os dados do usuário
      const userData = await login(email, password);
      toast.success(`Bem-vindo(a) de volta, ${userData.full_name}!`);
      
      if (userData.user_type === 'admin') {
        navigate('admin/dashboard');
      } else if (userData.user_type === 'professional') {
        navigate('professional/dashboard');
      } else {
        console.error('Tipo de usuário desconhecido:', userData.user_type);
        navigate('/'); // Redireciona para uma página padrão
      }

    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Erro ao fazer login. Verifique suas credenciais.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img 
               src={logomodula} 
                alt="Logo MÓDULA" 
               className="w-12 h-12"
            />
            <h1 className="text-3xl font-bold text-secondary">MODULA</h1>
          </div>

          <div className="border-t border-border pt-6">
            <p className="text-sm text-muted-foreground mb-6">Faça seu login</p>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  EMAIL
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu.email@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 bg-muted/30"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  SENHA
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 bg-muted/30 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                disabled={isLoading}
              >
                {isLoading ? "Entrando..." : "Logar →"}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Entre em contato com o administrador para receber seus dados
                para login inicial
              </p>

              <button
                type="button"
                className="text-sm text-primary hover:underline block mx-auto"
              >
                Esqueceu sua senha? <span className="font-medium">Recuperar Senha</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Lado direito - Mosaico */}
      <div className="hidden lg:flex flex-1 items-center justify-center bg-background">
        <img 
          src={mosaicologin} 
          alt="Padrão decorativo lateral" 
          className="max-w-full max-h-full object-contain"
        />
      </div>
    </div>
  );
};

export default Login;