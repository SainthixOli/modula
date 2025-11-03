import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/shared/Sidebar";
import { Header } from "@/components/shared/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, ArrowLeft, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  professionalService,
  Anamnesis,
} from "@/services/professional.service";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Componente simples para mostrar um campo
const InfoField = ({
  label,
  value,
}: {
  label: string;
  value: string | undefined | null;
}) => {
  if (!value) return null;
  return (
    <div className="mb-4">
      <h3 className="font-semibold text-lg text-primary">{label}</h3>
      <p className="text-muted-foreground whitespace-pre-wrap">{value}</p>
    </div>
  );
};

export default function ViewAnamnesiPage() {
  // A rota para esta página deve ser:
  // .../patients/:patientId/view-anamnesis/:anamnesisId
  const { patientId, anamnesisId } = useParams<{
    patientId: string;
    anamnesisId: string;
  }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [anamnesis, setAnamnesis] = useState<Anamnesis | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Valida se temos os dois IDs
    if (!patientId || !anamnesisId) {
      toast({
        title: "Erro",
        description: "IDs do paciente ou da anamnese não encontrados.",
        variant: "destructive",
      });
      navigate("/professional/patients");
      return;
    }

    const fetchAnamnesis = async () => {
      try {
        setIsLoading(true);
        // Vamos usar a função que já temos, que busca pelo patientId
        const data = await professionalService.getAnamnesisByPatient(
          patientId
        );
        
        if (data.length > 0 && data[0].id === anamnesisId) {
          setAnamnesis(data[0]);
        } else {
          // Se o ID da URL não bater ou não achar, é um erro
          throw new Error("Anamnese não encontrada ou ID inválido");
        }
      } catch (error) {
        console.error("Erro ao buscar anamnese:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar a anamnese.",
          variant: "destructive",
        });
        navigate(`/professional/patients/${patientId}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnamnesis();
  }, [anamnesisId, patientId, navigate, toast]);

  if (isLoading || !anamnesis) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  // Mapeia os dados do JSON para um formato legível
  const data = {
    queixa: anamnesis.current_complaint?.main_complaint,
    historiaFamiliar: anamnesis.family_history?.description,
    humor: anamnesis.psychological_history?.current_mood,
    dataAvaliacao: anamnesis.identification?.assessment_date
      ? format(
          new Date(anamnesis.identification.assessment_date),
          "PPP",
          { locale: ptBR }
        )
      : null,
    histTratamentos:
      anamnesis.psychological_history?.previous_treatment_history,
    medicacoes: anamnesis.medical_history?.current_medications
      ?.map((m) => m.name)
      .join(", "),
    pensamentosSuicidas: anamnesis.psychological_history?.suicidal_thoughts,
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userType="professional" />
      <div className="flex-1 flex flex-col">
        <Header userName="Dr. Oliver" />
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-4xl mx-auto">
            <div className="mb-4 flex justify-between items-center">
              <Button
                variant="ghost"
                onClick={() =>
                  navigate(`/professional/patients/${patientId}`)
                }
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <Button onClick={() => navigate(`/professional/patients/${patientId}/anamnesi/fill`)}>
                <Edit className="h-4 w-4 mr-2" />
                Atualizar Anamnese
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">
                  Anamnese Psicológica (Visualização)
                </CardTitle>
                 <CardDescription>
                  Status: {anamnesis.status} ({anamnesis.completion_percentage}%)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <InfoField
                  label="Data da Avaliação"
                  value={data.dataAvaliacao}
                />
                <InfoField label="Queixa Principal" value={data.queixa} />
                <InfoField
                  label="História Familiar"
                  value={data.historiaFamiliar}
                />
                <InfoField label="Humor Atual" value={data.humor} />
                <InfoField
                  label="Histórico de Tratamentos Anteriores"
                  value={data.histTratamentos}
                />
                <InfoField
                  label="Medicações em Uso"
                  value={data.medicacoes}
                />
                <InfoField
                  label="Apresenta Pensamentos Suicidas"
                  value={data.pensamentosSuicidas}
                />

                {/* Campos que o seu formulário ainda não preenche (pra você ver) */}
                <h2 className="text-2xl font-semibold mt-8 mb-4 border-b pb-2">
                  Observações (Não preenchido pelo formulário)
                </h2>
                <InfoField
                  label="Observações do Profissional"
                  value={anamnesis.professional_observations}
                />
                <InfoField
                  label="Impressão Clínica"
                  value={anamnesis.clinical_impression}
                />
                <InfoField
                  label="Plano de Tratamento Inicial"
                  value={anamnesis.initial_treatment_plan}
                />
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}