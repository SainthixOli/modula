import { useState, useEffect } from "react";
import { Sidebar } from "@/components/shared/Sidebar";
import { Header } from "@/components/shared/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useParams, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Save, ArrowLeft, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

import {
  professionalService,
  Anamnesis,
  CreateAnamnesisPayload
} from "@/services/professional.service";

interface AnamnesisField {
  id: string;
  label: string;
  type: "text" | "textarea" | "select" | "checkbox" | "date";
  options?: string[];
  required: boolean;
}

const template = {
  id: "1",
  name: "Anamnese Psicológica",
  fields: [
    { id: "f1", label: "Queixa principal", type: "textarea" as const, required: true },
    { id: "f2", label: "História familiar", type: "textarea" as const, required: true },
    { id: "f3", label: "Humor atual", type: "select" as const, options: ["Estável", "Ansioso", "Deprimido", "Eufórico"], required: true },
    { id: "f4", label: "Data da avaliação", type: "date" as const, required: true },
    { id: "f5", label: "Histórico de tratamentos anteriores", type: "textarea" as const, required: false },
    { id: "f6", label: "Medicações em uso", type: "text" as const, required: false },
    { id: "f7", label: "Apresenta pensamentos suicidas", type: "checkbox" as const, required: false },
  ],
};

// Converte os dados da API (nested) para o seu formValues (flat)
const mapApiToForm = (anamnesis: Anamnesis): Record<string, any> => {
  return {
    f1: anamnesis.current_complaint?.main_complaint || "",
    f2: anamnesis.family_history?.description || "",
    f3: anamnesis.psychological_history?.current_mood || "",
    f4: anamnesis.identification?.assessment_date
      ? new Date(anamnesis.identification.assessment_date)
      : undefined,
    f5: anamnesis.psychological_history?.previous_treatment_history || "",
    f6: anamnesis.medical_history?.current_medications?.map(med => med.name).join(', ') || "",
    f7: anamnesis.psychological_history?.suicidal_thoughts === 'Sim',
  };
};

const mapFormToApi = (formValues: Record<string, any>): Omit<CreateAnamnesisPayload, 'patientId'> => {
  return {
    current_complaint: { 
      main_complaint: formValues.f1 || "",
      onset: { 
        when: "Não informado pelo formulário", 
        trigger: "Não informado pelo formulário" 
      },
      duration: "Não informado"
    },
    family_history: { 
      description: formValues.f2 || "",
      relevant_conditions: [] // Adicionado
    },
    psychological_history: {
      current_mood: formValues.f3 || "",
      previous_treatment_history: formValues.f5 || "",
      suicidal_thoughts: formValues.f7 ? 'Sim' : 'Não',
    },
    identification: { 
      assessment_date: formValues.f4 
    },
    medical_history: { 
      current_medications: formValues.f6 
        ? formValues.f6.split(',')
            .map((s: string) => s.trim())
            .filter((s: string) => s.length > 0)
            .map((medName: string) => ({ name: medName, dose: "Não informada" })) 
        : [] 
    },
  };
};

export default function FillAnamnesiPage() {
  const { patientId } = useParams<{ patientId: string }>(); // Garante que patientId é string
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formValues, setFormValues] = useState<Record<string, any>>({});

  const [anamnesisId, setAnamnesisId] = useState<string | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!patientId) {
      toast({
        title: "Erro",
        description: "ID do paciente não encontrado.",
        variant: "destructive",
      });
      navigate("/professional/patients");
      return;
    }

    const loadAnamnesis = async () => {
      try {
        setIsLoadingData(true);
        const existingAnamneses = await professionalService.getAnamnesisByPatient(patientId);

        console.log('DADOS RECEBIDOS PELO getAnamnesisByPatient:', existingAnamneses);

        if (existingAnamneses.length > 0) {
          const anamnesis = existingAnamneses[0];

          console.log('ANAMNESE ENCONTRADA. ID:', anamnesis.id);

          setAnamnesisId(anamnesis.id);
          setFormValues(mapApiToForm(anamnesis));
          toast({
            title: "Anamnese carregada",
            description: "Os dados existentes do paciente foram preenchidos.",
          });
        } else {
          console.log('NENHUMA ANAMNESE ENCONTRADA. ID ficará nulo.');

          setAnamnesisId(null);
          toast({
            title: "Nova Anamnese",
            description: "Preencha os campos para criar o registro.",
          });
        }
      } catch (error) {
        console.error("Erro ao buscar anamnese:", error);
        toast({
          title: "Erro ao carregar",
          description: "Não foi possível buscar os dados da anamnese. Tente novamente.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingData(false);
      }
    };

    loadAnamnesis();
  }, [patientId, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId) return; 

    const missingFields = template.fields
      .filter((field) => field.required && !formValues[field.id])
      .map((field) => field.label);

    if (missingFields.length > 0) {
      toast({
        title: "Erro",
        description: `Preencha os campos obrigatórios: ${missingFields.join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const payload = mapFormToApi(formValues);

    try {
      let currentAnamnesisId = anamnesisId; 

      if (!currentAnamnesisId) {
        toast({ title: "Sincronizando...", description: "Obtendo ID da anamnese..." });
        
        const existingAnamneses = await professionalService.getAnamnesisByPatient(patientId); 
        
        if (existingAnamneses.length > 0) {
          currentAnamnesisId = existingAnamneses[0].id;
          setAnamnesisId(currentAnamnesisId); 
        } else {
          throw new Error("Falha crítica ao obter o ID da anamnese.");
        }
      }
      
      toast({ title: "Salvando...", description: "Atualizando seção 1/5 (Identificação)..." });
      await professionalService.updateAnamnesisSection(currentAnamnesisId, 'identification', payload.identification || {});
      
      toast({ title: "Salvando...", description: "Atualizando seção 2/5 (Queixa Principal)..." });
      await professionalService.updateAnamnesisSection(currentAnamnesisId, 'current_complaint', payload.current_complaint || {});
      
      toast({ title: "Salvando...", description: "Atualizando seção 3/5 (Hist. Familiar)..." });
      await professionalService.updateAnamnesisSection(currentAnamnesisId, 'family_history', payload.family_history || {});
      
      toast({ title: "Salvando...", description: "Atualizando seção 4/5 (Hist. Psicológico)..." });
      await professionalService.updateAnamnesisSection(currentAnamnesisId, 'psychological_history', payload.psychological_history || {});
      
      toast({ title: "Salvando...", description: "Atualizando seção 5/5 (Hist. Médico)..." });
      await professionalService.updateAnamnesisSection(currentAnamnesisId, 'medical_history', payload.medical_history || {});
      
      toast({
        title: "Sucesso",
        description: "Anamnese atualizada com sucesso",
      });
      
      navigate(`/professional/patients/${patientId}`);

    } catch (error: any) {
      console.error("Erro ao salvar anamnese:", error);
      const errorMsg = error.response?.data?.message || "Não foi possível salvar os dados. Tente novamente.";
      toast({
        title: "Erro ao salvar",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  const renderField = (field: AnamnesisField) => {
    switch (field.type) {
      case "text":
        return (
          <Input
            value={formValues[field.id] || ""}
            onChange={(e) => setFormValues({ ...formValues, [field.id]: e.target.value })}
            required={field.required}
            disabled={isSubmitting} 
          />
        );

      case "textarea":
        return (
          <Textarea
            value={formValues[field.id] || ""}
            onChange={(e) => setFormValues({ ...formValues, [field.id]: e.target.value })}
            required={field.required}
            rows={4}
            disabled={isSubmitting}
          />
        );

      case "select":
        return (
          <Select
            value={formValues[field.id] || ""}
            onValueChange={(value) => setFormValues({ ...formValues, [field.id]: value })}
            required={field.required}
            disabled={isSubmitting} 
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma opção" />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "checkbox":
        return (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={field.id}
              checked={formValues[field.id] || false}
              onChange={(e) => setFormValues({ ...formValues, [field.id]: e.target.checked })}
              className="rounded"
              disabled={isSubmitting} 
            />
            <Label htmlFor={field.id}>Sim</Label>
          </div>
        );

      case "date":
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formValues[field.id] && "text-muted-foreground"
                )}
                disabled={isSubmitting} 
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formValues[field.id] ? (
                  format(formValues[field.id], "PPP", { locale: ptBR })
                ) : (
                  <span>Selecione a data</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={formValues[field.id]}
                onSelect={(date) => setFormValues({ ...formValues, [field.id]: date })}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userType="professional" />

      <div className="flex-1 flex flex-col">
        <Header userName="Dr. Oliver" />

        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-4xl mx-auto">
            <Button
              variant="ghost"
              onClick={() => navigate(`/professional/patients/${patientId}`)}
              className="mb-4"
              disabled={isSubmitting}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">{template.name}</CardTitle>
                <p className="text-muted-foreground">
                  Preencha os campos abaixo para registrar a anamnese do paciente
                </p>
              </CardHeader>

              <CardContent>
                {isLoadingData ? (
                  <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="ml-2">Carregando dados da anamnese...</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {template.fields.map((field) => (
                      <div key={field.id} className="space-y-2">
                        <Label htmlFor={field.id}>
                          {field.label}
                          {field.required && <span className="text-destructive ml-1">*</span>}
                        </Label>
                        {renderField(field)}
                      </div>
                    ))}

                    <div className="flex gap-2 pt-4">
                      <Button
                        type="submit"
                        className="flex-1"
                        disabled={isSubmitting || isLoadingData}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Salvando...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Salvar Anamnese
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate(`/professional/patients/${patientId}`)}
                        disabled={isSubmitting}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}