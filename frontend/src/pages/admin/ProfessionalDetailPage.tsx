import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/shared/Sidebar";
import { Header } from "@/components/shared/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Edit, Mail, Phone, Calendar, Users, Activity, Key } from "lucide-react";
import { toast } from "sonner";
import { getProfessionalDetails, resetPassword } from "@/services/admin.service";
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ProfessionalDetails {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  specialty: string;
  professional_register: string;
  status: 'active' | 'inactive';
  last_login: string;
  created_at: string;
  patients: { id: string; full_name: string; status: string }[];
  statistics: {
    total_patients: number;
    active_patients: number;
    sessions_in_month: number;
    attendance_rate: number;
    total_sessions: number;
  };
}

export default function ProfessionalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [professional, setProfessional] = useState<ProfessionalDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // <<< CORREÇÃO AQUI: A DECLARAÇÃO DO ESTADO DE LOADING ESTAVA FALTANDO >>>
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  useEffect(() => {
    if (!id) {
      setError("ID do profissional não fornecido.");
      setIsLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        const data = await getProfessionalDetails(id);
        setProfessional(data);
      } catch (err) {
        console.error("Erro ao buscar detalhes do profissional:", err);
        setError("Não foi possível carregar os dados do profissional.");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleResetPassword = async () => {
    if (!professional) return;
    setIsResettingPassword(true);

    try {
      const response = await resetPassword(professional.id);
      const tempPassword = response.data.temporary_password;

      if (tempPassword) {
        toast.success("Senha Resetada!", {
          description: `A nova senha temporária é: ${tempPassword}. O profissional será forçado a alterá-la no próximo login.`,
          duration: 10000,
        });
      } else {
        toast.success("Senha resetada com sucesso!");
      }

    } catch (err: any) {
      const apiErrorMessage = err.response?.data?.message || "Ocorreu um erro ao resetar a senha.";
      toast.error(apiErrorMessage);
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleToggleStatus = () => {
    const newStatus = professional?.status === "active" ? "inativo" : "ativo";
    toast.success(`Profissional ${newStatus} com sucesso!`);
  };
  
  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-background"><Sidebar userType="admin" /><div className="flex-1 flex flex-col"><Header userName="Administrador" /><main className="flex-1 p-6 flex items-center justify-center"><p>Carregando detalhes do profissional...</p></main></div></div>
    );
  }

  if (error || !professional) {
    return (
       <div className="flex min-h-screen bg-background"><Sidebar userType="admin" /><div className="flex-1 flex flex-col"><Header userName="Administrador" /><main className="flex-1 p-6 flex items-center justify-center"><p className="text-destructive">{error || "Profissional não encontrado."}</p></main></div></div>
    );
  }
  
  const getInitials = (name: string) => name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userType="admin" />

      <div className="flex-1 flex flex-col">
        <Header userName="Administrador" />

        <main className="flex-1 p-6 overflow-auto">
          <div className="mb-6">
            <Button variant="ghost" onClick={() => navigate("/admin/professionals")} className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                    {getInitials(professional.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-3xl font-bold">{professional.full_name}</h1>
                  <p className="text-muted-foreground">
                    {professional.specialty} • {professional.professional_register}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant={professional.status === "active" ? "default" : "secondary"}>
                      {professional.status === "active" ? "Ativo" : "Inativo"}
                    </Badge>
                    {professional.last_login && (
                      <Badge variant="outline">Último acesso: {formatDistanceToNow(new Date(professional.last_login), { locale: ptBR, addSuffix: true })}</Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={handleResetPassword}
                  disabled={isResettingPassword}
                >
                  <Key className="h-4 w-4 mr-2" />
                  {isResettingPassword ? 'Resetando...' : 'Resetar Senha'}
                </Button>
                <Button variant="outline" onClick={handleToggleStatus}>{professional.status === "active" ? "Desativar" : "Ativar"}</Button>
                <Button onClick={() => navigate(`/admin/professionals/${professional.id}/edit`)}><Edit className="h-4 w-4 mr-2" />Editar</Button>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Pacientes Ativos</p><p className="text-2xl font-bold text-green-600">{professional.statistics.active_patients}</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Sessões no Mês</p><p className="text-2xl font-bold text-blue-600">{professional.statistics.sessions_in_month}</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Taxa de Presença</p><p className="text-2xl font-bold text-purple-600">{professional.statistics.attendance_rate}%</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Total de Sessões</p><p className="text-2xl font-bold text-amber-600">{professional.statistics.total_sessions}</p></CardContent></Card>
          </div>

          <Tabs defaultValue="info" className="w-full">
            <TabsList>
              <TabsTrigger value="info">Informações</TabsTrigger>
              <TabsTrigger value="patients">Pacientes</TabsTrigger>
              <TabsTrigger value="activity">Atividade</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-6 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader><CardTitle>Informações de Contato</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3"><Mail className="h-4 w-4 text-muted-foreground" /><div><p className="text-sm text-muted-foreground">Email</p><p className="font-medium">{professional.email}</p></div></div>
                    <div className="flex items-center gap-3"><Phone className="h-4 w-4 text-muted-foreground" /><div><p className="text-sm text-muted-foreground">Telefone</p><p className="font-medium">{professional.phone}</p></div></div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>Informações Profissionais</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3"><Activity className="h-4 w-4 text-muted-foreground" /><div><p className="text-sm text-muted-foreground">Especialidade</p><p className="font-medium">{professional.specialty}</p></div></div>
                    <div className="flex items-center gap-3"><Calendar className="h-4 w-4 text-muted-foreground" /><div><p className="text-sm text-muted-foreground">Data de Cadastro</p><p className="font-medium">{format(new Date(professional.created_at), "dd/MM/yyyy", { locale: ptBR })}</p></div></div>
                    <div className="flex items-center gap-3"><Users className="h-4 w-4 text-muted-foreground" /><div><p className="text-sm text-muted-foreground">Total de Pacientes</p><p className="font-medium">{professional.statistics.total_patients}</p></div></div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="patients" className="pt-4">
              <Card>
                <CardHeader><CardTitle>Pacientes do Profissional</CardTitle></CardHeader>
                <CardContent>
                  {professional.patients.length > 0 ? (
                    <ul className="space-y-2">
                      {professional.patients.map(patient => (
                        <li key={patient.id} className="flex justify-between items-center p-3 rounded-lg hover:bg-muted">
                          <span className="font-medium">{patient.full_name}</span>
                          <Badge variant={patient.status === 'active' ? 'default' : 'secondary'}>{patient.status === 'active' ? 'Ativo' : 'Inativo'}</Badge>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-center py-12"><Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><p className="text-muted-foreground">Nenhum paciente cadastrado para este profissional.</p></div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="pt-4">
              <Card>
                <CardHeader><CardTitle>Atividade Recente</CardTitle></CardHeader>
                <CardContent>
                  <div className="text-center py-12"><Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><p className="text-muted-foreground">Funcionalidade de atividade recente será implementada na Fase 2.</p></div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}