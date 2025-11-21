import { Sidebar } from "@/components/shared/Sidebar";
import { Header } from "@/components/shared/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Bell, 
  Settings, 
  Activity, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Play,
  BarChart3,
  Users,
  Calendar,
  FileText,
  UserPlus,
  HardDrive,
  RefreshCw,
  Loader2,
  Plus,
  Trash2
} from "lucide-react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useState, useEffect } from "react";
import { 
  getAllTriggers, 
  updateTriggerStatus, 
  testTrigger, 
  getTriggerStats,
  executeTrigger,
  deleteCustomTrigger,
  NotificationTrigger,
  TriggerStats
} from "@/services/triggers.service";
import { useToast } from "@/hooks/use-toast";
import { CreateTriggerDialog } from "@/components/admin/CreateTriggerDialog";

// Ícones por tipo de trigger
const triggerIcons: Record<string, any> = {
  transfer: Users,
  session: Calendar,
  anamnesis: FileText,
  patient: UserPlus,
  system: HardDrive,
};

// Cores por tipo de trigger
const triggerColors: Record<string, string> = {
  transfer: "text-blue-500",
  session: "text-green-500",
  anamnesis: "text-purple-500",
  patient: "text-orange-500",
  system: "text-gray-500",
};

// Página de configuração de notificações e triggers (admin)
const NotificationsAdminPage = () => {
  const { userName, userType } = useCurrentUser();
  const { toast } = useToast();
  const [triggers, setTriggers] = useState<NotificationTrigger[]>([]);
  const [stats, setStats] = useState<TriggerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [testingTrigger, setTestingTrigger] = useState<string | null>(null);
  const [executingTrigger, setExecutingTrigger] = useState<string | null>(null);
  const [deletingTrigger, setDeletingTrigger] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  
  // Carregar triggers e estatísticas
  const loadData = async () => {
    try {
      setLoading(true);
      const [triggersData, statsData] = await Promise.all([
        getAllTriggers(),
        getTriggerStats()
      ]);
      setTriggers(triggersData);
      setStats(statsData);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar dados",
        description: error.message || "Não foi possível carregar os triggers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Alternar status do trigger
  const handleToggleTrigger = async (triggerId: string, currentStatus: boolean) => {
    try {
      await updateTriggerStatus(triggerId, !currentStatus);
      
      setTriggers(prev => 
        prev.map(t => t.id === triggerId ? { ...t, enabled: !currentStatus } : t)
      );
      
      toast({
        title: !currentStatus ? "Trigger ativado" : "Trigger desativado",
        description: `O trigger foi ${!currentStatus ? 'ativado' : 'desativado'} com sucesso.`,
      });
      
      // Recarregar estatísticas
      const statsData = await getTriggerStats();
      setStats(statsData);
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar trigger",
        description: error.message || "Não foi possível atualizar o status do trigger",
        variant: "destructive",
      });
    }
  };

  // Testar trigger
  const handleTestTrigger = async (triggerId: string, triggerName: string) => {
    try {
      setTestingTrigger(triggerId);
      await testTrigger(triggerId);
      
      toast({
        title: "Trigger testado",
        description: `O trigger "${triggerName}" foi executado para teste. Verifique as notificações.`,
      });
    } catch (error: any) {
      toast({
        title: "Erro ao testar trigger",
        description: error.message || "Não foi possível testar o trigger",
        variant: "destructive",
      });
    } finally {
      setTestingTrigger(null);
    }
  };

  // Executar trigger manualmente
  const handleExecuteTrigger = async (triggerType: string, triggerName: string) => {
    try {
      setExecutingTrigger(triggerType);
      await executeTrigger(triggerType);
      
      toast({
        title: "Trigger executado",
        description: `O trigger "${triggerName}" foi executado com sucesso.`,
      });
      
      // Recarregar dados
      await loadData();
    } catch (error: any) {
      toast({
        title: "Erro ao executar trigger",
        description: error.message || "Não foi possível executar o trigger",
        variant: "destructive",
      });
    } finally {
      setExecutingTrigger(null);
    }
  };

  // Deletar trigger customizado
  const handleDeleteTrigger = async (triggerId: string, triggerName: string) => {
    if (!confirm(`Tem certeza que deseja deletar o trigger "${triggerName}"?`)) {
      return;
    }

    try {
      setDeletingTrigger(triggerId);
      await deleteCustomTrigger(triggerId);
      
      toast({
        title: "Trigger deletado",
        description: `O trigger "${triggerName}" foi deletado com sucesso.`,
      });
      
      // Recarregar dados
      await loadData();
    } catch (error: any) {
      toast({
        title: "Erro ao deletar trigger",
        description: error.message || "Não foi possível deletar o trigger",
        variant: "destructive",
      });
    } finally {
      setDeletingTrigger(null);
    }
  };
  
  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar userType={userType as "professional" | "admin"} />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header userName={userName} />
          
          <main className="flex-1 overflow-y-auto p-8">
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar userType={userType as "professional" | "admin"} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header userName={userName} />
        
        <main className="flex-1 overflow-y-auto p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                <Bell className="h-8 w-8" />
                Configuração de Notificações
              </h1>
              <p className="text-muted-foreground mt-1">
                Configure triggers automáticos e alertas do sistema
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Regra
              </Button>
              <Button onClick={loadData} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
            </div>
          </div>

          {/* Estatísticas */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total de Triggers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    <span className="text-3xl font-bold">{stats.total_triggers}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Triggers Ativos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="text-3xl font-bold">{stats.active_triggers}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Triggers Inativos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <XCircle className="h-5 w-5 text-red-500" />
                    <span className="text-3xl font-bold">{stats.inactive_triggers}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Notificações Enviadas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-500" />
                    <span className="text-3xl font-bold">{stats.total_notifications_sent}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Lista de Triggers */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Settings className="h-5 w-5" />
                <div>
                  <CardTitle>Regras de Notificação</CardTitle>
                  <CardDescription>
                    Configure triggers automáticos para eventos do sistema
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {triggers.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum trigger configurado
                  </p>
                ) : (
                  triggers.map((trigger) => {
                    const Icon = triggerIcons[trigger.type] || Bell;
                    const colorClass = triggerColors[trigger.type] || "text-gray-500";
                    
                    return (
                      <div
                        key={trigger.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-start gap-4 flex-1">
                          <div className={`mt-1 ${colorClass}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{trigger.name}</h3>
                              <Badge variant={trigger.enabled ? "default" : "secondary"}>
                                {trigger.enabled ? "Ativo" : "Inativo"}
                              </Badge>
                              <Badge variant="outline" className="capitalize">
                                {trigger.type}
                              </Badge>
                            </div>
                            
                            <p className="text-sm text-muted-foreground mb-2">
                              {trigger.description}
                            </p>
                            
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              {trigger.schedule && (
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{trigger.schedule}</span>
                                </div>
                              )}
                              
                              {trigger.trigger_count !== undefined && (
                                <div className="flex items-center gap-1">
                                  <Activity className="h-3 w-3" />
                                  <span>{trigger.trigger_count} execuções</span>
                                </div>
                              )}
                              
                              {trigger.last_triggered && (
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  <span>Última: {new Date(trigger.last_triggered).toLocaleDateString('pt-BR')}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleTestTrigger(trigger.id, trigger.name)}
                            disabled={!trigger.enabled || testingTrigger === trigger.id}
                          >
                            {testingTrigger === trigger.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </Button>
                          
                          {trigger.schedule && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleExecuteTrigger(trigger.event, trigger.name)}
                              disabled={!trigger.enabled || executingTrigger === trigger.event}
                            >
                              {executingTrigger === trigger.event ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <RefreshCw className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                          
                          {/* @ts-ignore - is_custom pode não estar na interface */}
                          {trigger.is_custom && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteTrigger(trigger.id, trigger.name)}
                              disabled={deletingTrigger === trigger.id}
                            >
                              {deletingTrigger === trigger.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4 text-red-500" />
                              )}
                            </Button>
                          )}
                          
                          <Switch
                            checked={trigger.enabled}
                            onCheckedChange={() => handleToggleTrigger(trigger.id, trigger.enabled)}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>

      {/* Dialog de Criação */}
      <CreateTriggerDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={() => {
          loadData();
          toast({
            title: "Trigger criado!",
            description: "A nova regra de notificação foi criada com sucesso.",
          });
        }}
      />
    </div>
  );
};

export default NotificationsAdminPage;
