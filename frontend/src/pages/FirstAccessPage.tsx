import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { z } from "zod";
import { changeFirstPassword } from "@/services/auth.service";
import logomodula from '@/components/assets/logo.png'; 

// Schema de validação para a nova senha
const passwordSchema = z.object({
  password: z.string().min(8, "Senha deve ter no mínimo 8 caracteres")
    .regex(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]'), 
           'Senha deve conter maiúscula, minúscula, número e caractere especial'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

export default function FirstAccessPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ password: "", confirmPassword: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    try {
      passwordSchema.parse(formData);
      
      await changeFirstPassword(formData.password, formData.confirmPassword);
      
      toast.success("Senha alterada com sucesso! Você será redirecionado.");
      
      // Espera um pouco e redireciona para o dashboard correto
      // (aqui a gente ainda não sabe se é admin ou professional, então mandamos pra uma rota genérica)
      setTimeout(() => navigate('/professional/dashboard'), 2000);

    } catch (error: any) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path[0]) newErrors[err.path[0].toString()] = err.message;
        });
        setErrors(newErrors);
      } else {
        const apiErrorMessage = error.response?.data?.message || "Ocorreu um erro ao alterar a senha.";
        toast.error(apiErrorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <img src={logomodula} alt="Logo MÓDULA" className="w-12 h-12 mx-auto mb-4" />
          <CardTitle className="text-2xl">Primeiro Acesso</CardTitle>
          <CardDescription>
            Por segurança, crie uma nova senha pessoal para continuar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Nova Senha</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={errors.password ? "border-destructive" : ""}
              />
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirme a Nova Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className={errors.confirmPassword ? "border-destructive" : ""}
              />
              {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : 'Definir Nova Senha'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}