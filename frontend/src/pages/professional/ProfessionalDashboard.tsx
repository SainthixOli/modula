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
import { getCurrentUser } from "@/services/auth.service";
import { useToast } from "@/hooks/use-toast";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function ProfessionalDashboard() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedFilter, setSelectedFilter] = useState("Hoje");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ProfessionalDashboardStats | null>(null);
  const [currentUser, setCurrentUser] = useState<{ full_name: string; professional_register?: string } | null>(null);
  const { toast } = useToast();
  const { userName } = useCurrentUser();

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setCurrentUser({
        full_name: user.full_name,
        professional_register: user.professional_register
      });
    }
  }, []);

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
        <Header 
          userName={userName || currentUser?.full_name || "Usuário"} 
          userRole={currentUser?.professional_register ? `Psicólogo - ${currentUser.professional_register}` : "Psicólogo"}
        />
        
        <main className="flex-1 p-6 overflow-auto">
          {/* Greeting */}
          <h1 className="text-3xl font-bold mb-6">
            Bom dia <span className="text-primary">{userName || currentUser?.full_name || 'Usuário'}!</span>
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
                    <h2 className="text-5xl font-bold mb-6">{stats.today_schedule?.total_appointments || 0}</h2>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                        <p className="text-white/80 text-sm mb-1">Total de Pacientes</p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold">{stats.overview?.patients?.total || 0}</span>
                        </div>
                      </div>
                      
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                        <p className="text-white/80 text-sm mb-1">Pacientes Ativos</p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold">{stats.overview?.patients?.active || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Avatar className="h-24 w-24 border-4 border-white/20">
                    <AvatarFallback className="bg-white/10 text-white text-2xl">
                      {currentUser?.full_name ? currentUser.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'US'}
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
                <p className="text-sm text-muted-foreground capitalize">
                  {format(date || new Date(), "MMMM yyyy", { locale: ptBR })}
                </p>
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
                  {stats.today_schedule?.appointments && stats.today_schedule.appointments.length > 0 ? (
                    stats.today_schedule.appointments.slice(0, 3).map((session: any, index: number) => (
                      <div key={index} className="flex gap-3 p-3 rounded-lg bg-primary/5 mb-2">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-medium text-primary">
                            {session.Patient?.full_name?.charAt(0) || 'P'}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">{session.Patient?.full_name || 'Paciente'}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(session.session_date).toLocaleDateString('pt-BR')} às {session.scheduled_start_time || ''}
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

          {/* Patients List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Pacientes Atualizados Recentemente</CardTitle>
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
              {stats.recent_updates && stats.recent_updates.length > 0 ? (
                stats.recent_updates.slice(0, 6).map((patient: any) => (
                  <div key={patient.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {patient.full_name?.charAt(0) || 'P'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{patient.full_name}</p>
                        <p className="text-xs text-muted-foreground">
                          Atualizado {new Date(patient.updated_at).toLocaleDateString('pt-BR')}
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
