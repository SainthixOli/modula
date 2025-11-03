import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/shared/Sidebar";
import { Header } from "@/components/shared/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Edit, Calendar, FileText, Activity, Phone, Mail, MapPin, User, Loader2, Eye } from "lucide-react";
import { getPatientDetails, PatientDetails, professionalService, Anamnesis } from "@/services/professional.service";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner'; 
import { useToast } from "@/hooks/use-toast";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose, 
} from "@/components/ui/dialog"; //
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"; //
import { Label } from "@/components/ui/label"; //


/**
 * Componente para mostrar o "card" de status da Anamnese.
 * Ele decide qual botão mostrar (Preencher, Visualizar, Atualizar).
 */
const AnamnesisCard = ({ patientId }: { patientId: string }) => {
  const navigate = useNavigate();
  const [anamnesis, setAnamnesis] = useState<Anamnesis | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnamnesisStatus = async () => {
      try {
        setIsLoading(true);
        // O backend retorna o objeto dentro de 'data.anamnesis'
        const existing = await professionalService.getAnamnesisByPatient(
          patientId
        );

        if (existing.length > 0) {
          setAnamnesis(existing[0]);
        }
      } catch (error) {
        console.error("Erro ao buscar status da anamnese:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnamnesisStatus();
  }, [patientId]);

  const handleNavigate = (path: "fill-anamnesis" | "view-anamnesis") => {
    if (anamnesis) {
      navigate(
        `/professional/patients/${patientId}/${path}/${anamnesis.id}`
      );
    } else {
      // Fallback caso o ID não tenha carregado (não deve acontecer)
      // Se não houver anamnese, a rota de 'fill' vai criar uma
      navigate(`/professional/patients/${patientId}/fill-anamnesis`);
    }
  };

  if (isLoading) {
    return (
      <CardContent className="flex items-center justify-center p-6">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2">Verificando anamnese...</span>
      </CardContent>
    );
  }

  // Se a anamnese não é 'draft' OU se ela já tem progresso
  if (
    anamnesis &&
    (anamnesis.status !== "draft" || anamnesis.completion_percentage > 0)
  ) {
    return (
      <CardContent>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-green-600">
              Anamnese preenchida ({anamnesis.completion_percentage}%)
            </p>
            <p className="text-sm text-muted-foreground">
              Você pode visualizar os dados ou continuar a edição.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleNavigate("view-anamnesis")}
            >
              <Eye className="h-4 w-4 mr-2" />
              Visualizar
            </Button>
            <Button onClick={() => navigate(`/professional/patients/${patientId}/anamnesi/fill`)}>
              <Edit className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </div>
      </CardContent>
    );
  }

  // Se for 'draft' E 0% (ou seja, vazia)
  return (
    <CardContent>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-destructive">
            Anamnese não preenchida
          </p>
          <p className="text-sm text-muted-foreground">
            O registro do paciente está incompleto.
          </p>
        </div>
        <Button onClick={() => navigate(`/professional/patients/${patientId}/anamnesi/fill`)}>
          <FileText className="h-4 w-4 mr-2" />
          Preencher Anamnese
        </Button>
      </div>
    </CardContent>
  );
};

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>(); 
  const navigate = useNavigate();
  const { toast } = useToast(); 

  const [patient, setPatient] = useState<PatientDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<'active' | 'inactive'>('active');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const handleStatusChange = async () => {
    if (!id || !patient) return;

    setIsUpdatingStatus(true);
    try {
      const updatedPatient = await professionalService.updatePatientStatus(
        id,
        newStatus
      );
      setPatient(updatedPatient);
      toast({
         title: "Sucesso!", 
         description: "Status do paciente atualizado com sucesso!"
      });
      setIsStatusDialogOpen(false);
    } catch (err: any) {
      console.error("Erro ao atualizar status do paciente:", err);
      const apiErrorMessage =
        err.response?.data?.message || "Ocorreu um erro ao atualizar.";
      toast({
        title: "Falha ao atualizar status",
        description: apiErrorMessage,
        variant: "destructive"
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  useEffect(() => {
    if (!id) {
      setError("ID do paciente não fornecido.");
      setIsLoading(false);
      return;
    }

    const loadPatient = async () => {
      try {
        // Chamar a função pelo 'professionalService'
        const data = await professionalService.getPatientDetails(id); 
        setPatient(data);
      } catch (err) {
        setError("Não foi possível carregar os dados do paciente.");
      } finally {
        setIsLoading(false);
      }
    };
    loadPatient();
  }, [id]);

  const medicalHistory = [
    {
      date: "21/06/2025",
      type: "Consulta",
      doctor: "Dr. Oliver",
      notes: "Acompanhamento de rotina",
    },
  ];

  const handleScheduleClick = () => {
    if (!patient) return;
    navigate(`/professional/calendar?patientId=${patient.id}`);
  };

  if (isLoading || !patient) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar userType="professional" />
        <div className="flex-1 flex flex-col">
          <Header userName="Dr. Oliver" />
          <main className="flex-1 p-6 flex items-center justify-center">
             {isLoading ? (
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
             ) : (
                <p>{error || 'Paciente não encontrado.'}</p>
             )}
          </main>
        </div>
      </div>
    );
  }

  const formatAddress = (address: any) => {
    if (!address || Object.keys(address).length === 0) return "Não informado";
    if (typeof address === "string") return address;
    if (typeof address === "object") {
      return `${address.street || ""}, ${address.number || ""} - ${
        address.city || ""
      }`
        .replace(/, $/, "")
        .replace(/^- /, "");
    }
    return "Endereço inválido";
  };

  const getInitials = (name: string) =>
    name
      ? name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
      : "";

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userType="professional" />
      <div className="flex-1 flex flex-col">
        <Header userName="Dr. Oliver" />
        <main className="flex-1 p-6 overflow-auto">
          {/* Seu Header da página (mantido) */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate("/professional/patients")}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-2xl">
                    {getInitials(patient.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-3xl font-bold">{patient.full_name}</h1>
                  <p className="text-muted-foreground">
                    {patient.gender} • {patient.age} anos • CPF:{" "}
                    {patient.cpf || "N/A"}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <Badge
                      variant={
                        patient.status === "active" ? "default" : "secondary"
                      }
                    >
                      {patient.status === "active" ? "Ativo" : "Inativo"}
                    </Badge>
                    <Badge variant="outline">
                      {patient.sessions?.length || 0} sessões
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleScheduleClick}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Agendar
                </Button>
                <Button
                  onClick={() =>
                    navigate(`/professional/patients/${patient.id}/edit`)
                  }
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>

                <Dialog
                  open={isStatusDialogOpen}
                  onOpenChange={setIsStatusDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      onClick={() =>
                        setNewStatus(
                          patient?.status === "active" ? "inactive" : "active"
                        )
                      }
                    >
                      <Activity className="h-4 w-4 mr-2" />
                      Alterar Status
                    </Button>
                  </DialogTrigger>

                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Alterar Status do Paciente</DialogTitle>
                      <DialogDescription>
                        Selecione o novo status para{" "}
                        <strong>{patient?.full_name}</strong>. O status atual é{" "}
                        <strong>
                          {patient?.status === "active" ? "Ativo" : "Inativo"}
                        </strong>
                        .
                      </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                      <RadioGroup
                        value={newStatus}
                        onValueChange={(value: "active" | "inactive") =>
                          setNewStatus(value)
                        }
                        className="space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="active" id="status-active" />
                          <Label htmlFor="status-active">Ativo</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value="inactive"
                            id="status-inactive"
                          />
                          <Label htmlFor="status-inactive">Inativo</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <DialogFooter>
                      <DialogClose asChild>
                        <Button type="button" variant="outline">
                          Cancelar
                        </Button>
                      </DialogClose>
                      <Button
                        type="button"
                        onClick={handleStatusChange}
                        disabled={
                          isUpdatingStatus || newStatus === patient?.status
                        }
                      >
                        {isUpdatingStatus ? "Salvando..." : "Salvar Alteração"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                {/* ================================================================ */}
              </div>
            </div>
          </div>
          <Tabs defaultValue="info" className="w-full">
            <TabsList>
              <TabsTrigger value="info">Informações</TabsTrigger>
              <TabsTrigger value="history">Histórico</TabsTrigger>
              <TabsTrigger value="anamnesis">Anamnese</TabsTrigger>
              <TabsTrigger value="sessions">Sessões</TabsTrigger>
            </TabsList>
            
            <TabsContent value="info" className="space-y-6 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Informações de Contato</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Telefone</p>
                        <p className="font-medium">{patient.phone || "N/A"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{patient.email || "N/A"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Endereço</p>
                        <p className="font-medium">
                          {formatAddress(patient.address)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Informações Pessoais</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Estado Civil
                        </p>
                        <p className="font-medium">
                          {patient.marital_status || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Profissão
                        </p>
                        <p className="font-medium">
                          {patient.occupation || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Primeira Consulta
                        </p>
                        <p className="font-medium">
                          {patient.first_appointment
                            ? format(
                                new Date(patient.first_appointment),
                                "dd/MM/yyyy",
                                { locale: ptBR }
                              )
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Última Consulta
                        </p>
                        <p className="font-medium">
                          {patient.last_appointment
                            ? format(
                                new Date(patient.last_appointment),
                                "dd/MM/yyyy",
                                { locale: ptBR }
                              )
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>Histórico de Atendimentos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {medicalHistory.map((record, index) => (
                      <div
                        key={index}
                        className="flex gap-4 p-4 border rounded-lg"
                      >
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <FileText className="h-6 w-6 text-primary" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold">{record.type}</h4>
                            <span className="text-sm text-muted-foreground">
                              {record.date}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">
                            Profissional: {record.doctor}
                          </p>
                          <p className="text-sm">{record.notes}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="anamnesis">
              <Card>
                <CardHeader>
                  <CardTitle>Anamnese</CardTitle>
                </CardHeader>
                {id && <AnamnesisCard patientId={id} />}
              </Card>
            </TabsContent>

            <TabsContent value="sessions">
              <Card>
                <CardHeader>
                  <CardTitle>Sessões e Consultas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Activity
                      className="h-12 w-12 mx-auto text-muted-foreground mb-4"
                    />
                    <h3 className="text-lg font-semibold mb-2">
                      Lista de sessões
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Total de {patient.sessions?.length || 0} sessões
                      registradas
                    </p>
                    <Button onClick={handleScheduleClick}>
                      <Calendar className="h-4 w-4 mr-2" />
                      Nova Sessão
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}