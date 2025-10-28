import React, { useEffect, useState } from "react";
import { Sidebar } from "@/components/shared/Sidebar";
import { Header } from "@/components/shared/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from '@/components/ui/skeleton';

import { professionalService, PatientDetails, PatientFormData } from "@/services/professional.service"; 

const formFieldIds = {
  fullName: "full_name",
  birthDate: "birth_date",
  gender: "gender",
  cpf: "cpf",
  rg: "rg",
  maritalStatus: "marital_status",
  occupation: "occupation",
  phone: "phone",
  email: "email",
  address: "address",
  medicalHistory: "medical_history",
  currentMedications: "current_medications",
  allergies: "allergies",
  notes: "notes",
};


export default function EditPatientPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [patientOriginalName, setPatientOriginalName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<PatientFormData>>({
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

  useEffect(() => {
    if (!id) {
      setError("ID do paciente não fornecido.");
      setIsLoading(false);
      return;
    }

    const fetchPatientData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await professionalService.getPatientDetails(id); 
        setPatientOriginalName(data.full_name || '');

        const formattedBirthDate = data.birth_date 
          ? new Date(data.birth_date).toISOString().split('T')[0] 
          : "";

        setFormData({
          full_name: data.full_name || '',
          birth_date: formattedBirthDate,
          gender: data.gender || '',
          cpf: data.cpf || '',
          rg: data.rg || '',
          marital_status: data.marital_status || '',
          occupation: data.occupation || '',
          phone: data.phone || '',
          email: data.email || '',
          address: data.address || '', 
          medical_history: data.medical_history || '',
          current_medications: data.current_medications || '',
          allergies: data.allergies || '',
          notes: data.notes || '',
        });
      } catch (err) {
        console.error("Erro ao buscar dados do paciente:", err);
        setError("Não foi possível carregar os dados do paciente.");
        toast({ title: "Erro", description: "Não foi possível carregar dados.", variant: "destructive"});
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatientData();
  }, [id, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSelectChange = (name: keyof PatientFormData, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    if (!formData.full_name || !formData.birth_date || !formData.cpf || !formData.phone) {
       toast({ title: "Erro", description: "Preencha todos os campos obrigatórios (*)", variant: "destructive"});
       return; 
    }

    const dataToSend = { ...formData };
    Object.keys(dataToSend).forEach(key => {
        const typedKey = key as keyof Partial<PatientFormData>;
        if (dataToSend[typedKey] === undefined || dataToSend[typedKey] === null || dataToSend[typedKey] === '') {
           
        }
    });

    setIsSaving(true);

    try {
      await professionalService.updatePatient(id, dataToSend as PatientFormData); 
      toast({
        title: "Sucesso",
        description: "Dados do paciente atualizados com sucesso",
      });
      navigate(`/professional/patients/${id}`);
    } catch (err: any) {
      console.error("Erro ao atualizar paciente:", err);
      const apiErrorMessage = err.response?.data?.message || "Ocorreu um erro ao atualizar.";
        toast({
        title: "Erro ao Salvar",
        description: apiErrorMessage,
        variant: "destructive",
      });
    } finally {
        setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar userType="professional" />
        <div className="flex-1 flex flex-col">
          <Header userName="Dr. Oliver" />
          <main className="flex-1 p-6">
             <div className="max-w-4xl mx-auto">
               <Skeleton className="h-8 w-1/4 mb-4" />
               <Skeleton className="h-[700px] w-full" />
             </div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
      return (
        <div className="flex min-h-screen bg-background">
          <Sidebar userType="professional" />
          <div className="flex-1 flex flex-col">
            <Header userName="Dr. Oliver" />
            <main className="flex-1 p-6 flex items-center justify-center">
              <div className="text-center">
                  <p className="text-xl text-red-500 mb-4">{error}</p>
                  <Button onClick={() => navigate(-1)} >Voltar</Button>
              </div>
            </main>
          </div>
        </div>
      );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userType="professional" />
      <div className="flex-1 flex flex-col">
        <Header userName="Dr. Oliver" />
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-4xl mx-auto">
            <Button
              variant="ghost"
              onClick={() => navigate(`/professional/patients/${id}`)}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Editar Paciente: {patientOriginalName || ''}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Dados Pessoais</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={formFieldIds.fullName}>Nome Completo *</Label>
                        <Input id={formFieldIds.fullName} value={formData.full_name || ''} onChange={handleChange} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={formFieldIds.birthDate}>Data de Nascimento *</Label>
                        <Input id={formFieldIds.birthDate} type="date" value={formData.birth_date || ''} onChange={handleChange} required />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={formFieldIds.gender}>Gênero</Label>
                        <Select value={formData.gender || ''} onValueChange={(value) => handleSelectChange('gender', value)}>
                          <SelectTrigger id={formFieldIds.gender}><SelectValue placeholder="Selecione" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Masculino</SelectItem>
                            <SelectItem value="female">Feminino</SelectItem>
                            <SelectItem value="other">Outro</SelectItem>
                            <SelectItem value="not_informed">Não informado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={formFieldIds.cpf}>CPF *</Label>
                        <Input id={formFieldIds.cpf} placeholder="000.000.000-00" value={formData.cpf || ''} onChange={handleChange} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={formFieldIds.rg}>RG</Label>
                        <Input id={formFieldIds.rg} value={formData.rg || ''} onChange={handleChange} />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={formFieldIds.maritalStatus}>Estado Civil</Label>
                        <Select value={formData.marital_status || ''} onValueChange={(value) => handleSelectChange('marital_status', value)}>
                          <SelectTrigger id={formFieldIds.maritalStatus}><SelectValue placeholder="Selecione" /></SelectTrigger>
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
                        <Label htmlFor={formFieldIds.occupation}>Profissão</Label>
                        <Input id={formFieldIds.occupation} value={formData.occupation || ''} onChange={handleChange} />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 border-t pt-6">
                    <h3 className="text-lg font-semibold">Contato</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={formFieldIds.phone}>Telefone *</Label>
                        <Input id={formFieldIds.phone} placeholder="(00) 00000-0000" value={formData.phone || ''} onChange={handleChange} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={formFieldIds.email}>Email</Label>
                        <Input id={formFieldIds.email} type="email" value={formData.email || ''} onChange={handleChange} />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 border-t pt-6">
                    <h3 className="text-lg font-semibold">Endereço</h3>
                    <div className="space-y-2">
                      <Label htmlFor={formFieldIds.address}>Endereço Completo</Label>
                      <Textarea id={formFieldIds.address} rows={3} value={formData.address || ''} onChange={handleChange} />
                    </div>
                  </div>
                  
                  <div className="space-y-4 border-t pt-6">
                    <h3 className="text-lg font-semibold">Informações Clínicas</h3>
                    <div className="space-y-2">
                      <Label htmlFor={formFieldIds.medicalHistory}>Histórico Médico</Label>
                      <Textarea id={formFieldIds.medicalHistory} rows={3} placeholder="Doenças prévias, cirurgias, etc." value={formData.medical_history || ''} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={formFieldIds.currentMedications}>Medicações Atuais</Label>
                      <Textarea id={formFieldIds.currentMedications} rows={2} placeholder="Medicamentos em uso contínuo" value={formData.current_medications || ''} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={formFieldIds.allergies}>Alergias</Label>
                      <Textarea id={formFieldIds.allergies} rows={2} placeholder="Alergias conhecidas" value={formData.allergies || ''} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={formFieldIds.notes}>Observações</Label>
                      <Textarea id={formFieldIds.notes} rows={3} placeholder="Anotações gerais sobre o paciente" value={formData.notes || ''} onChange={handleChange} />
                    </div>
                  </div>

                  <div className="flex justify-end gap-4 mt-6">
                    <Button type="button" variant="outline" onClick={() => navigate(`/professional/patients/${id}`)}>Cancelar</Button>
                    <Button type="submit" disabled={isSaving}><Save className="h-4 w-4 mr-2" />{isSaving ? "Salvando..." : "Salvar Alterações"}</Button>
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