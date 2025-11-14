import { useState, useEffect } from "react";
import { Sidebar } from "@/components/shared/Sidebar";
import { Header } from "@/components/shared/Header";
import { StatsCard } from "@/components/shared/StatsCard";
import { PatientCard } from "@/components/shared/PatientCard";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, TrendingUp, Activity, Calendar as CalendarIcon, ChevronDown, MoreVertical, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getProfessionalDashboard, ProfessionalDashboardStats } from "@/services/professional.service";
import { useToast } from "@/hooks/use-toast";

export default function ProfessionalDashboard() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedFilter, setSelectedFilter] = useState("Hoje");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ProfessionalDashboardStats | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dashboardData = await getProfessionalDashboard();
        setStats(dashboardData);
      } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os dados do dashboard',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userType="professional" />
      
      <div className="flex-1 flex flex-col">
        <Header userName="Dr. Oliver" userRole="Psicólogo - CRP 12345" />
        
        <main className="flex-1 p-6 overflow-auto">
          {/* Greeting */}
          <h1 className="text-3xl font-bold mb-6">
            Bom dia <span className="text-primary">Dr. Oliver!</span>
          </h1>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : stats ? (
            <>
          {/* Main Stats Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <Card className="lg:col-span-2 bg-gradient-to-br from-primary via-secondary to-accent text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-white/80 text-sm mb-2">Sessões para hoje</p>
                    <h2 className="text-5xl font-bold mb-6">{stats.todaySessions || 0}</h2>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                        <p className="text-white/80 text-sm mb-1">Total de Pacientes</p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold">{stats.totalPatients || 0}</span>
                        </div>
                      </div>
                      
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                        <p className="text-white/80 text-sm mb-1">Pacientes Ativos</p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold">{stats.activePatients || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Avatar className="h-24 w-24 border-4 border-white/20">
                    <AvatarFallback className="bg-white/10 text-white text-2xl">
                      DO
                    </AvatarFallback>
                  </Avatar>
                </div>
              </CardContent>
            </Card>

            {/* Calendar Card */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Calendário</CardTitle>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">Setembro 2025</p>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md"
                />
                
                <div className="mt-4">
                  <h4 className="font-semibold mb-2 text-sm">Próximas Sessões</h4>
                  {stats.upcomingSessions && stats.upcomingSessions.length > 0 ? (
                    stats.upcomingSessions.slice(0, 3).map((session: any, index: number) => (
                      <div key={index} className="flex gap-3 p-3 rounded-lg bg-primary/5 mb-2">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-medium text-primary">
                            {session.patient_name?.charAt(0) || 'P'}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">{session.patient_name || 'Paciente'}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(session.date).toLocaleDateString('pt-BR')} às {session.time || ''}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground">Nenhuma sessão agendada</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Patients List and Consultation Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Today's Patients */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Lista de Pacientes</CardTitle>
                  <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Hoje">Hoje</SelectItem>
                      <SelectItem value="Semana">Semana</SelectItem>
                      <SelectItem value="Mês">Mês</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {stats.recentPatients && stats.recentPatients.length > 0 ? (
                  stats.recentPatients.slice(0, 4).map((patient: any) => (
                    <div key={patient.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {patient.full_name?.charAt(0) || 'P'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{patient.full_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {patient.age ? `${patient.age} anos` : 'Idade não informada'}
                          </p>
                        </div>
                      </div>
                      <Badge variant={patient.status === 'active' ? 'default' : 'secondary'}>
                        {patient.status === 'active' ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhum paciente registrado
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Consultation Details */}
            <Card>
              <CardHeader>
                <CardTitle>Consulta</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Patient Header */}
                  <div className="flex items-center gap-3 pb-4 border-b">
                    <Avatar className="h-16 w-16 bg-blue-100">
                      <AvatarFallback className="bg-blue-100 text-blue-600 text-lg">DW</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">Denzel White</h3>
                      <p className="text-sm text-muted-foreground">Masculino - 28 anos e 3 meses</p>
                    </div>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Health Indicators */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-3 rounded-lg bg-muted/50">
                      <Activity className="h-8 w-8 mx-auto mb-1 text-red-500" />
                      <p className="text-xs text-muted-foreground">Febre</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted/50">
                      <Activity className="h-8 w-8 mx-auto mb-1 text-blue-500" />
                      <p className="text-xs text-muted-foreground">Tosse</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted/50">
                      <Activity className="h-8 w-8 mx-auto mb-1 text-purple-500" />
                      <p className="text-xs text-muted-foreground">Azia</p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-3 pt-2">
                    <div>
                      <h4 className="text-sm font-semibold mb-1">Última verificação</h4>
                      <p className="text-sm text-muted-foreground">
                        Dr. Everly em 21 de junho de 2025, receita{" "}
                        <span className="text-primary">#2J983K10</span>
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold mb-1">Observação</h4>
                      <p className="text-sm text-muted-foreground">
                        Febre alta e tosse com níveis normais de hemoglobina.
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold mb-1">Prescrição</h4>
                      <p className="text-sm text-muted-foreground">
                        Paracetamol - 2 vezes ao dia<br />
                        Dizopam - Dia e Noite antes das refeições<br />
                        Wikoryl
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          </>
          ) : (
            <div className="text-center text-muted-foreground">
              Nenhum dado disponível
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
