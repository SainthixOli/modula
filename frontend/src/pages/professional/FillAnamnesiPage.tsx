import { useState } from "react";
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
import { CalendarIcon, Save, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface AnamnesisField {
  id: string;
  label: string;
  type: "text" | "textarea" | "select" | "checkbox" | "date";
  options?: string[];
  required: boolean;
}

export default function FillAnamnesiPage() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Mock template - em produção viria da API
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

  const [formValues, setFormValues] = useState<Record<string, any>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validar campos obrigatórios
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

    // Em produção, enviaria para a API
    console.log("Anamnese salva:", formValues);
    
    toast({
      title: "Sucesso",
      description: "Anamnese salva com sucesso",
    });

    navigate(`/professional/patients/${patientId}`);
  };

  const renderField = (field: AnamnesisField) => {
    switch (field.type) {
      case "text":
        return (
          <Input
            value={formValues[field.id] || ""}
            onChange={(e) => setFormValues({ ...formValues, [field.id]: e.target.value })}
            required={field.required}
          />
        );

      case "textarea":
        return (
          <Textarea
            value={formValues[field.id] || ""}
            onChange={(e) => setFormValues({ ...formValues, [field.id]: e.target.value })}
            required={field.required}
            rows={4}
          />
        );

      case "select":
        return (
          <Select
            value={formValues[field.id] || ""}
            onValueChange={(value) => setFormValues({ ...formValues, [field.id]: value })}
            required={field.required}
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
                    <Button type="submit" className="flex-1">
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Anamnese
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate(`/professional/patients/${patientId}`)}
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
