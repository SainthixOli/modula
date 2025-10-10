import { Sidebar } from "@/components/shared/Sidebar";
import { Header } from "@/components/shared/Header";
import { StatsCard } from "@/components/shared/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, UserCheck, Activity, TrendingUp, Plus, MoreVertical } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const navigate = useNavigate();

  // Mock data
  const stats = {
    totalProfessionals: 24,
    activeProfessionals: 18,
    totalPatients: 456,
    monthlyGrowth: 12.5,
  };

  const professionals = [
    { id: "1", name: "Dr. Oliver Silva", specialty: "Psicologia", patients: 45, status: "active" },
    { id: "2", name: "Dra. Maria Santos", specialty: "Psiquiatria", patients: 38, status: "active" },
    { id: "3", name: "Dr. João Ribeiro", specialty: "Psicologia", patients: 52, status: "active" },
    { id: "4", name: "Dra. Ana Costa", specialty: "Terapia Familiar", patients: 28, status: "inactive" },
  ];

  const recentActivity = [
    { action: "Novo profissional cadastrado", user: "Dr. Pedro Lima", time: "2h atrás" },
    { action: "Paciente transferido", user: "Maria Silva → Dr. João", time: "5h atrás" },
    { action: "Relatório gerado", user: "Sistema", time: "1d atrás" },
  ];

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
                  {professionals.map((prof) => (
                    <div
                      key={prof.id}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => navigate(`/admin/professionals/${prof.id}`)}
                    >
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {prof.name.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-semibold">{prof.name}</h4>
                        <p className="text-sm text-muted-foreground">{prof.specialty}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{prof.patients} pacientes</p>
                        <Badge variant={prof.status === "active" ? "default" : "secondary"} className="text-xs">
                          {prof.status === "active" ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Atividade Recente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.action}</p>
                        <p className="text-xs text-muted-foreground">{activity.user}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
