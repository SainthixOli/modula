import { useParams, useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/shared/Sidebar";
import { Header } from "@/components/shared/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Edit, 
  Calendar, 
  FileText, 
  Activity,
  Phone,
  Mail,
  MapPin,
  User
} from "lucide-react";

export default function PatientDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock data - substituir por chamada à API
  const patient = {
    id,
    name: "Denzel White",
    age: 28,
    gender: "Masculino",
    cpf: "123.456.789-00",
    phone: "(11) 98765-4321",
    email: "denzel.white@email.com",
    address: "Rua Example, 123 - São Paulo, SP",
    maritalStatus: "Solteiro",
    occupation: "Engenheiro de Software",
    status: "active",
    firstAppointment: "15/01/2024",
    lastAppointment: "21/06/2025",
    totalSessions: 24,
  };

  const medicalHistory = [
    { date: "21/06/2025", type: "Consulta", doctor: "Dr. Everly", notes: "Febre alta e tosse" },
    { date: "14/06/2025", type: "Consulta", doctor: "Dr. Oliver", notes: "Acompanhamento de rotina" },
    { date: "07/06/2025", type: "Anamnese", doctor: "Dr. Oliver", notes: "Anamnese completa" },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userType="professional" />

      <div className="flex-1 flex flex-col">
        <Header userName="Dr. Oliver" />

        <main className="flex-1 p-6 overflow-auto">
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
                    DW
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-3xl font-bold">{patient.name}</h1>
                  <p className="text-muted-foreground">
                    {patient.gender} • {patient.age} anos • CPF: {patient.cpf}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant={patient.status === "active" ? "default" : "secondary"}>
                      {patient.status === "active" ? "Ativo" : "Inativo"}
                    </Badge>
                    <Badge variant="outline">{patient.totalSessions} sessões</Badge>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Agendar
                </Button>
                <Button>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
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

            <TabsContent value="info" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Informações de Contato</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Telefone</p>
                        <p className="font-medium">{patient.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{patient.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Endereço</p>
                        <p className="font-medium">{patient.address}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Personal Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Informações Pessoais</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Estado Civil</p>
                        <p className="font-medium">{patient.maritalStatus}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Profissão</p>
                        <p className="font-medium">{patient.occupation}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Primeira Consulta</p>
                        <p className="font-medium">{patient.firstAppointment}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Última Consulta</p>
                        <p className="font-medium">{patient.lastAppointment}</p>
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
                      <div key={index} className="flex gap-4 p-4 border rounded-lg">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <FileText className="h-6 w-6 text-primary" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold">{record.type}</h4>
                            <span className="text-sm text-muted-foreground">{record.date}</span>
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
                <CardContent>
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Anamnese não preenchida</h3>
                    <p className="text-muted-foreground mb-4">
                      Ainda não há anamnese cadastrada para este paciente
                    </p>
                    <Button onClick={() => navigate(`/professional/anamnesis/${id}`)}>
                      <FileText className="h-4 w-4 mr-2" />
                      Preencher Anamnese
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sessions">
              <Card>
                <CardHeader>
                  <CardTitle>Sessões e Consultas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Lista de sessões</h3>
                    <p className="text-muted-foreground mb-4">
                      Total de {patient.totalSessions} sessões registradas
                    </p>
                    <Button>
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
