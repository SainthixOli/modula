import { Sidebar } from "@/components/shared/Sidebar";
import { Header } from "@/components/shared/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Database, Download, Clock, CheckCircle, AlertCircle } from "lucide-react";

// Página de visualização de backups (profissional)
const BackupPage = () => {
  // Dados mockados de backups
  const backups = [
    {
      id: 1,
      date: "2024-01-15",
      time: "03:00",
      size: "245 MB",
      status: "completed",
      type: "Backup Automático Diário",
      includes: ["Pacientes", "Consultas", "Anamneses"]
    },
    {
      id: 2,
      date: "2024-01-14",
      time: "03:00",
      size: "243 MB",
      status: "completed",
      type: "Backup Automático Diário",
      includes: ["Pacientes", "Consultas", "Anamneses"]
    },
    {
      id: 3,
      date: "2024-01-13",
      time: "03:00",
      size: "241 MB",
      status: "completed",
      type: "Backup Automático Diário",
      includes: ["Pacientes", "Consultas", "Anamneses"]
    },
    {
      id: 4,
      date: "2024-01-12",
      time: "03:00",
      size: "238 MB",
      status: "completed",
      type: "Backup Automático Diário",
      includes: ["Pacientes", "Consultas", "Anamneses"]
    },
    {
      id: 5,
      date: "2024-01-11",
      time: "03:00",
      size: "236 MB",
      status: "failed",
      type: "Backup Automático Diário",
      includes: ["Pacientes", "Consultas", "Anamneses"]
    }
  ];

  // Retorna badge de status
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { label: "Concluído", variant: "secondary" as const, icon: CheckCircle },
      failed: { label: "Falhou", variant: "destructive" as const, icon: AlertCircle },
      running: { label: "Em andamento", variant: "default" as const, icon: Clock }
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar userType="professional" userName="Dr. João Silva" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header userName="Dr. João Silva" />
        
        <main className="flex-1 overflow-y-auto p-8">
          {/* Cabeçalho da página */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                <Database className="h-8 w-8" />
                Backups
              </h1>
              <p className="text-muted-foreground mt-1">
                Visualize o histórico de backups dos seus dados
              </p>
            </div>
          </div>

          {/* Alerta informativo */}
          <Card className="p-4 mb-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <Database className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                  Sistema de Backup Automático
                </h3>
                <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                  Os backups são realizados automaticamente todos os dias às 03:00. 
                  Seus dados estão protegidos e podem ser restaurados pelo administrador do sistema em caso de necessidade.
                </p>
              </div>
            </div>
          </Card>

          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total de Backups</p>
                  <p className="text-2xl font-bold text-foreground">{backups.length}</p>
                </div>
                <Database className="h-8 w-8 text-primary" />
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Último Backup</p>
                  <p className="text-2xl font-bold text-foreground">{backups[0].date}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-500" />
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Taxa de Sucesso</p>
                  <p className="text-2xl font-bold text-foreground">
                    {Math.round((backups.filter(b => b.status === "completed").length / backups.length) * 100)}%
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </Card>
          </div>

          {/* Lista de backups */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Histórico de Backups</h2>
            
            {backups.map((backup) => (
              <Card key={backup.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-3 rounded-full bg-muted">
                      <Database className="h-5 w-5 text-primary" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-foreground">{backup.type}</h3>
                        {getStatusBadge(backup.status)}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{backup.date} às {backup.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Database className="h-4 w-4" />
                          <span>Tamanho: {backup.size}</span>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <p className="text-xs text-muted-foreground">
                          Inclui: {backup.includes.join(", ")}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {backup.status === "completed" && (
                    <Button variant="outline" size="sm" disabled>
                      <Download className="h-4 w-4 mr-2" />
                      Solicitar ao Admin
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {/* Informação adicional */}
          <Card className="p-4 mt-6 bg-muted">
            <p className="text-sm text-muted-foreground">
              <strong>Nota:</strong> Para restaurar um backup, entre em contato com o administrador do sistema.
              Apenas administradores têm permissão para realizar operações de restauração de dados.
            </p>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default BackupPage;
