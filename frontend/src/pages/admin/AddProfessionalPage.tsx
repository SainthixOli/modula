import { useState } from "react";
import { Sidebar } from "@/components/shared/Sidebar";
import { Header } from "@/components/shared/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { z } from "zod";
import { createProfessional } from "@/services/admin.service"; 

// O schema de validação pode ser o mesmo
const professionalSchema = z.object({
  fullName: z.string().min(2, "Nome deve ter no mínimo 2 caracteres").max(150),
  email: z.string().email("Email inválido"),
  professionalRegister: z.string().min(3, "Registro deve ter no mínimo 3 caracteres").max(20),
});

export default function AddProfessionalPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

 
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    professionalRegister: "",
    specialty: "",
    phone: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    try {

      professionalSchema.parse(formData);
      
      const apiData = {
        full_name: formData.fullName,
        email: formData.email,
        professional_register: formData.professionalRegister,
      };
      
      const response = await createProfessional(apiData);
      
      console.log("Profissional criado:", response.data);
      
      toast({
        title: "Sucesso!",
        description: "Novo profissional cadastrado com sucesso.",
      });

      navigate(`/admin/professionals`);

    } catch (error: any) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(newErrors);
      } else {
        // Captura erros da API (ex: email duplicado)
        const apiErrorMessage = error.response?.data?.message || "Ocorreu um erro ao criar o profissional.";
        toast({
          title: "Erro",
          description: apiErrorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userType="admin" />

      <div className="flex-1 flex flex-col">
        <Header userName="Admin" />

        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-4xl mx-auto">
            <Button
              variant="ghost"
              onClick={() => navigate(`/admin/professionals`)}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para a lista
            </Button>

            <Card>
              <CardHeader>
                {/* MUDANÇA: Novo título */}
                <CardTitle className="text-2xl">Adicionar Novo Profissional</CardTitle>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* O formulário é praticamente o mesmo, mas sem o campo 'status' */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Dados Profissionais</h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Nome Completo *</Label>
                        <Input
                          id="fullName"
                          value={formData.fullName}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                          className={errors.fullName ? "border-destructive" : ""}
                        />
                        {errors.fullName && (
                          <p className="text-sm text-destructive">{errors.fullName}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className={errors.email ? "border-destructive" : ""}
                        />
                        {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="professionalRegister">Registro Profissional *</Label>
                        <Input
                          id="professionalRegister"
                          value={formData.professionalRegister}
                          onChange={(e) =>
                            setFormData({ ...formData, professionalRegister: e.target.value })
                          }
                          placeholder="CRP/CRM"
                          className={errors.professionalRegister ? "border-destructive" : ""}
                        />
                        {errors.professionalRegister && (
                          <p className="text-sm text-destructive">{errors.professionalRegister}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Telefone</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="(00) 00000-0000"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="specialty">Especialidade</Label>
                        <Input
                          id="specialty"
                          value={formData.specialty}
                          onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button type="submit" className="flex-1" disabled={isSubmitting}>
                      <Save className="h-4 w-4 mr-2" />
                      {isSubmitting ? 'Salvando...' : 'Salvar Novo Profissional'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate(`/admin/professionals`)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}