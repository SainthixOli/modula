import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/shared/Sidebar";
import { Header } from "@/components/shared/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { createPatient, CreatePatientData } from "@/services/professional.service";

export default function NewPatientPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // 1. O "CÉREBRO" DO FORMULÁRIO: Um estado para guardar todos os dados
  const [formData, setFormData] = useState<Partial<CreatePatientData>>({
    full_name: "",
    birth_date: "",
    gender: "",
    cpf: "",
    rg: "",
    marital_status: "",
    occupation: "",
    phone: "",
    email: "",
    address: "",
    medical_history: "",
    current_medications: "",
    allergies: "",
    notes: ""
  });

  // Função para atualizar o estado quando o usuário digita nos Inputs e Textareas
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  // Função para atualizar o estado quando o usuário escolhe uma opção nos Selects
  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  // 2. A FUNÇÃO "TURBINADA" QUE REALMENTE SALVA NA API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validação simples (pode ser melhorada com Zod no futuro)
      if (!formData.full_name || !formData.birth_date || !formData.cpf || !formData.phone) {
        throw new Error("Preencha todos os campos obrigatórios (*)");
      }
      
      await createPatient(formData as CreatePatientData);
      
      toast.success("Paciente cadastrado com sucesso!");
      navigate("/professional/patients");
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Falha ao cadastrar paciente.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userType="professional" />

      <div className="flex-1 flex flex-col">
        <Header userName="Dr. Oliver" />

        <main className="flex-1 p-6 overflow-auto">
          <div className="mb-6">
            <Button variant="ghost" onClick={() => navigate("/professional/patients")} className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <h1 className="text-3xl font-bold">Novo Paciente</h1>
            <p className="text-muted-foreground">Cadastre um novo paciente</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Dados Pessoais - AGORA CONECTADOS AO ESTADO */}
              <Card className="lg:col-span-2">
                <CardHeader><CardTitle>Dados Pessoais</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Nome Completo *</Label>
                      <Input id="full_name" value={formData.full_name} onChange={handleChange} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="birth_date">Data de Nascimento *</Label>
                      <Input id="birth_date" type="date" value={formData.birth_date} onChange={handleChange} required />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gênero *</Label>
                      <Select onValueChange={(value) => handleSelectChange('gender', value)}>
                        <SelectTrigger id="gender"><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Masculino</SelectItem>
                          <SelectItem value="female">Feminino</SelectItem>
                          <SelectItem value="other">Outro</SelectItem>
                          <SelectItem value="not_informed">Não informado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cpf">CPF *</Label>
                      <Input id="cpf" placeholder="000.000.000-00" value={formData.cpf} onChange={handleChange} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rg">RG</Label>
                      <Input id="rg" value={formData.rg} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="marital_status">Estado Civil</Label>
                      <Select onValueChange={(value) => handleSelectChange('marital_status', value)}>
                        <SelectTrigger id="marital_status"><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="single">Solteiro(a)</SelectItem>
                          <SelectItem value="married">Casado(a)</SelectItem>
                          <SelectItem value="divorced">Divorciado(a)</SelectItem>
                          <SelectItem value="widowed">Viúvo(a)</SelectItem>
                          <SelectItem value="other">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="occupation">Profissão</Label>
                      <Input id="occupation" value={formData.occupation} onChange={handleChange} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Resumo</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div><p className="text-sm text-muted-foreground">Status</p><p className="font-medium">Ativo</p></div>
                  <div><p className="text-sm text-muted-foreground">Profissional Responsável</p><p className="font-medium">Dr. Oliver</p></div>
                  <div><p className="text-sm text-muted-foreground">Data de Cadastro</p><p className="font-medium">{new Date().toLocaleDateString()}</p></div>
                </CardContent>
              </Card>
              
              <Card className="lg:col-span-2">
                <CardHeader><CardTitle>Informações de Contato</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone *</Label>
                      <Input id="phone" placeholder="(00) 00000-0000" value={formData.phone} onChange={handleChange} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" value={formData.email} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Endereço Completo</Label>
                    <Textarea id="address" rows={3} value={formData.address} onChange={handleChange} />
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-3">
                <CardHeader><CardTitle>Informações Clínicas</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2"><Label htmlFor="medical_history">Histórico Médico</Label><Textarea id="medical_history" rows={3} placeholder="Doenças prévias, cirurgias, etc." value={formData.medical_history} onChange={handleChange} /></div>
                  <div className="space-y-2"><Label htmlFor="current_medications">Medicações Atuais</Label><Textarea id="current_medications" rows={2} placeholder="Medicamentos em uso contínuo" value={formData.current_medications} onChange={handleChange} /></div>
                  <div className="space-y-2"><Label htmlFor="allergies">Alergias</Label><Textarea id="allergies" rows={2} placeholder="Alergias conhecidas" value={formData.allergies} onChange={handleChange} /></div>
                  <div className="space-y-2"><Label htmlFor="notes">Observações</Label><Textarea id="notes" rows={3} placeholder="Anotações gerais sobre o paciente" value={formData.notes} onChange={handleChange} /></div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <Button type="button" variant="outline" onClick={() => navigate("/professional/patients")}>Cancelar</Button>
              <Button type="submit" disabled={isLoading}><Save className="h-4 w-4 mr-2" />{isLoading ? "Salvando..." : "Salvar Paciente"}</Button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}