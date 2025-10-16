import React, { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { resetPassword } from '@/services/auth.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import logomodula from '../components/assets/logo.png';

const CriarSenha: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Regras exibidas na checklist
  const hasUpper = useMemo(() => /[A-Z]/.test(password), [password]);
  const hasNumber = useMemo(() => /\d/.test(password), [password]);
  const minLength = useMemo(() => password.length >= 8, [password]);

  const score = (hasUpper ? 1 : 0) + (hasNumber ? 1 : 0) + (minLength ? 1 : 0);
  const strengthPercent = Math.round((score / 3) * 100);

  const strengthColor = useMemo(() => {
    if (score === 0) return 'bg-red-500';
    if (score === 1) return 'bg-rose-500';
    if (score === 2) return 'bg-amber-400';
    return 'bg-emerald-500';
  }, [score]);

  const validateLocal = () => {
    if (!minLength) {
      toast.error('A senha deve ter pelo menos 8 caracteres.');
      return false;
    }
    if (!hasUpper) {
      toast.error('A senha deve conter ao menos uma letra maiúscula.');
      return false;
    }
    if (!hasNumber) {
      toast.error('A senha deve conter ao menos um número.');
      return false;
    }
    if (password !== confirmPassword) {
      toast.error('Confirmação de senha diferente.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateLocal()) return;
    if (!token) {
      toast.error('Token de redefinição ausente. Verifique o link enviado por e-mail.');
      return;
    }

    try {
      setLoading(true);
      await resetPassword(token, password);
      toast.success('Senha redefinida com sucesso. Faça login com sua nova senha.');
      navigate('/');
    } catch (err: any) {
      console.error('Erro ao redefinir senha:', err);
      const msg = err?.response?.data?.message || 'Erro ao redefinir senha. O token pode estar expirado.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-lg bg-white shadow-lg rounded-xl p-6">
        <div className="flex items-center gap-4 mb-4">
          <img src={logomodula} alt="Módula" className="h-10" />
          <div>
            <h2 className="text-lg font-semibold">Redefinir Senha</h2>
            <p className="text-sm text-muted-foreground">Realize o procedimento de redefinição de senha para retomar acesso ao sistema.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nova senha */}
          <div>
            <Label htmlFor="password">Nova Senha *</Label>
            <div className="relative mt-1">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Insira nova senha"
                required
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Confirmar senha */}
          <div>
            <Label htmlFor="confirmPassword">Confirme Nova Senha *</Label>
            <div className="relative mt-1">
              <Input
                id="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirme nova senha"
                required
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Strength bar */}
          <div>
            <div className="w-full bg-gray-200 h-2 rounded overflow-hidden">
              <div
                className={`${strengthColor} h-2 rounded`}
                style={{ width: `${strengthPercent}%`, transition: 'width 200ms ease' }}
              />
            </div>
          </div>

          {/* Checklist */}
          <div className="pt-2">
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2 text-slate-700">
                {hasUpper ? (
                  <CheckCircle className="text-emerald-500" />
                ) : (
                  <XCircle className="text-rose-500" />
                )}
                <span>A senha deve conter ao menos uma letra maiúscula.</span>
              </li>
              <li className="flex items-center gap-2 text-slate-700">
                {hasNumber ? (
                  <CheckCircle className="text-emerald-500" />
                ) : (
                  <XCircle className="text-rose-500" />
                )}
                <span>A senha deve conter ao menos um número.</span>
              </li>
              <li className="flex items-center gap-2 text-slate-700">
                {minLength ? (
                  <CheckCircle className="text-emerald-500" />
                ) : (
                  <XCircle className="text-rose-500" />
                )}
                <span>A senha deve ter pelo menos 8 caracteres.</span>
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4">
            <Button variant="ghost" onClick={() => navigate('/')}>
              Descartar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Applying...' : 'Redefinir'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CriarSenha;
