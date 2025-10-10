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
  Mail,
  Phone,
  Calendar,
  Users,
  Activity,
  Key
} from "lucide-react";
import { toast } from "sonner";

export default function ProfessionalDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock data
  const professional = {
    id,
    name: "Dr. Oliver Silva",
    email: "oliver.silva@email.com",
    phone: "(11) 98765-4321",
    specialty: "Psicologia",
    register: "CRP 12345",
    patients: 45,
    status: "active",
    lastLogin: "2 horas atrás",
    createdAt: "15/01/2024",
    totalSessions: 342,
  };

  const stats = [
    { label: "Pacientes Ativos", value: 45, color: "text-green-600" },
    { label: "Sessões no Mês", value: 87, color: "text-blue-600" },
    { label: "Taxa de Presença", value: "94%", color: "text-purple-600" },
    { label: "Total de Sessões", value: 342, color: "text-amber-600" },
  ];

  const recentActivity = [
    { action: "Nova sessão registrada", patient: "Maria Silva", time: "2h atrás" },
    { action: "Paciente cadastrado", patient: "João Santos", time: "5h atrás" },
    { action: "Anamnese preenchida", patient: "Ana Costa", time: "1d atrás" },
  ];

  const handleResetPassword = () => {
    toast.success("Email com senha temporária enviado!");
  };

  const handleToggleStatus = () => {
    const newStatus = professional.status === "active" ? "inativo" : "ativo";
    toast.success(`Profissional ${newStatus} com sucesso!`);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userType="admin" />

      <div className="flex-1 flex flex-col">
        <Header userName="Administrador" />

        <main className="flex-1 p-6 overflow-auto">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate("/admin/professionals")}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>

            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                    OS
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-3xl font-bold">{professional.name}</h1>
                  <p className="text-muted-foreground">
                    {professional.specialty} • {professional.register}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant={professional.status === "active" ? "default" : "secondary"}>
                      {professional.status === "active" ? "Ativo" : "Inativo"}
                    </Badge>
                    <Badge variant="outline">Último acesso: {professional.lastLogin}</Badge>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleResetPassword}>
                  <Key className="h-4 w-4 mr-2" />
                  Resetar Senha
                </Button>
                <Button variant="outline" onClick={handleToggleStatus}>
                  {professional.status === "active" ? "Desativar" : "Ativar"}
                </Button>
                <Button onClick={() => navigate(`/admin/professionals/${professional.id}/edit`)}>
  <Edit className="h-4 w-4 mr-2" />
  Editar
</Button>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {stats.map((stat, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Tabs defaultValue="info" className="w-full">
            <TabsList>
              <TabsTrigger value="info">Informações</TabsTrigger>
              <TabsTrigger value="patients">Pacientes</TabsTrigger>
              <TabsTrigger value="activity">Atividade</TabsTrigger>
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
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{professional.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Telefone</p>
                        <p className="font-medium">{professional.phone}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Professional Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Informações Profissionais</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Especialidade</p>
                        <p className="font-medium">{professional.specialty}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Data de Cadastro</p>
                        <p className="font-medium">{professional.createdAt}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Total de Pacientes</p>
                        <p className="font-medium">{professional.patients}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="patients">
              <Card>
                <CardHeader>
                  <CardTitle>Pacientes do Profissional</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      {professional.patients} pacientes cadastrados
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle>Atividade Recente</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex gap-3 p-3 border rounded-lg">
                        <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.action}</p>
                          <p className="text-xs text-muted-foreground">{activity.patient}</p>
                          <p className="text-xs text-muted-foreground">{activity.time}</p>
                        </div>
                      </div>
                    ))}
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
