import { Sidebar } from "@/components/shared/Sidebar";
import { Header } from "@/components/shared/Header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Server, Database, Users, TrendingUp, AlertTriangle } from "lucide-react";

// Página de monitoramento do sistema (admin)
const MonitoringPage = () => {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar userType="admin" userName="Admin" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header userName="Administrador" userRole="Admin" />
        
        <main className="flex-1 overflow-y-auto p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Activity className="h-8 w-8" />
              Monitoramento do Sistema
            </h1>
            <p className="text-muted-foreground mt-1">
              Acompanhe o desempenho e saúde da plataforma
            </p>
          </div>

          {/* Status Geral */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Status do Sistema</p>
                  <Badge variant="secondary" className="mt-2">Online</Badge>
                </div>
                <Server className="h-8 w-8 text-green-500" />
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Banco de Dados</p>
                  <p className="text-2xl font-bold text-foreground">99.9%</p>
                </div>
                <Database className="h-8 w-8 text-blue-500" />
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Usuários Ativos</p>
                  <p className="text-2xl font-bold text-foreground">127</p>
                </div>
                <Users className="h-8 w-8 text-purple-500" />
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Uptime</p>
                  <p className="text-2xl font-bold text-foreground">99.9%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </Card>
          </div>

          {/* Alertas */}
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Alertas Recentes</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <span className="text-sm">Uso de memória acima de 80% - 15:30</span>
              </div>
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default MonitoringPage;
