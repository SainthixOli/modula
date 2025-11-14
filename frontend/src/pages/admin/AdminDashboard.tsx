import { Sidebar } from "@/components/shared/Sidebar";
import { Header } from "@/components/shared/Header";
import { StatsCard } from "@/components/shared/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, UserCheck, Activity, TrendingUp, Plus, MoreVertical, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getAdminDashboardStats, getProfessionalsList } from "@/services/admin.service";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  console.log('🏠 AdminDashboard - Componente renderizado');
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProfessionals: 0,
    activeProfessionals: 0,
    totalPatients: 0,
    monthlyGrowth: 0,
  });
  const [professionals, setProfessionals] = useState<any[]>([]);

  console.log('🏠 Estado atual:', { loading, stats, professionalsCount: professionals.length });

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('🏠 AdminDashboard - Iniciando carregamento...');
        setLoading(true);
        
        // Buscar estatísticas
        console.log('📊 Buscando estatísticas...');
        const dashboardData = await getAdminDashboardStats();
        console.log('✅ Estatísticas carregadas:', dashboardData);
        
        setStats({
          totalProfessionals: dashboardData.professionals?.total || 0,
          activeProfessionals: dashboardData.professionals?.active || 0,
          totalPatients: dashboardData.patients?.total || 0,
          monthlyGrowth: 0, // Será calculado no backend futuramente
        });

        // Buscar lista de profissionais
        console.log('👨‍⚕️ Buscando lista de profissionais...');
        const profsList = await getProfessionalsList();
        console.log('✅ Profissionais carregados:', profsList);
        setProfessionals(profsList.slice(0, 4)); // Primeiros 4 para o dashboard
        
        console.log('✅ AdminDashboard - Carregamento concluído');
      } catch (error: any) {
        console.error('❌ AdminDashboard - Erro ao carregar:', error);
        console.error('❌ Detalhes:', error.response?.data);
        toast({
          title: "Erro ao carregar dados",
          description: error.response?.data?.message || "Não foi possível carregar os dados do dashboard",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userType="admin" />

      <div className="flex-1 flex flex-col">
        <Header userName="Administrador" userRole="Sistema Módula" />

        <main className="flex-1 p-6 overflow-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Dashboard Administrativo</h1>
              <p className="text-muted-foreground">Visão geral do sistema</p>
            </div>
            <Button onClick={() => navigate("/admin/professionals/new")}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Profissional
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatsCard
              title="Total de Profissionais"
              value={stats.totalProfessionals}
              icon={Users}
              gradient="from-blue-500 to-blue-600"
            />
            <StatsCard
              title="Profissionais Ativos"
              value={stats.activeProfessionals}
              icon={UserCheck}
              gradient="from-green-500 to-green-600"
            />
            <StatsCard
              title="Total de Pacientes"
              value={stats.totalPatients}
              icon={Activity}
              gradient="from-purple-500 to-purple-600"
            />
            <StatsCard
              title="Crescimento Mensal"
              value={`+${stats.monthlyGrowth}%`}
              icon={TrendingUp}
              gradient="from-amber-500 to-amber-600"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Professionals List */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Profissionais</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => navigate("/admin/professionals")}>
                    Ver Todos
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {professionals.map((prof) => {
                    const name = prof.full_name || prof.name || 'Sem nome';
                    const patientCount = prof.patient_count || prof.patients || 0;
                    const initials = name.split(" ").map(n => n[0]).join("").toUpperCase();
                    
                    return (
                      <div
                        key={prof.id}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => navigate(`/admin/professionals/${prof.id}`)}
                      >
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h4 className="font-semibold">{name}</h4>
                          <p className="text-sm text-muted-foreground">{prof.specialty || 'Sem especialidade'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{patientCount} pacientes</p>
                          <Badge variant={prof.status === "active" ? "default" : "secondary"} className="text-xs">
                            {prof.status === "active" ? "Ativo" : "Inativo"}
                          </Badge>
                        </div>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
          </>
          )}
        </main>
      </div>
    </div>
  );
}
