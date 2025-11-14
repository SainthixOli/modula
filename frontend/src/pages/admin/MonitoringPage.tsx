import { Sidebar } from "@/components/shared/Sidebar";
import { Header } from "@/components/shared/Header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, Server, Database, Users, TrendingUp, AlertTriangle, Clock, Cpu, HardDrive, Loader2, CheckCircle, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { getAdvancedHealthCheck, getMetricsSummary, getAlerts, acknowledgeAlert, resolveAlert, type AdvancedHealthStatus, type MetricsSummary, type Alert } from "@/services/monitoring.service";

// Página de monitoramento do sistema (admin)
const MonitoringPage = () => {
  const [health, setHealth] = useState<AdvancedHealthStatus | null>(null);
  const [metrics, setMetrics] = useState<MetricsSummary | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true);
      else setLoading(true);

      const [healthData, metricsData, alertsData] = await Promise.all([
        getAdvancedHealthCheck(),
        getMetricsSummary(),
        getAlerts('active')
      ]);

      setHealth(healthData);
      setMetrics(metricsData);
      setAlerts(alertsData);
    } catch (error) {
      console.error('Erro ao carregar dados de monitoramento:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    
    // Auto-refresh a cada 30 segundos
    const interval = setInterval(() => loadData(true), 30000);
    return () => clearInterval(interval);
  }, []);

  const handleAcknowledgeAlert = async (alertId: number) => {
    try {
      await acknowledgeAlert(alertId);
      await loadData(true);
    } catch (error) {
      console.error('Erro ao reconhecer alerta:', error);
    }
  };

  const handleResolveAlert = async (alertId: number) => {
    try {
      await resolveAlert(alertId);
      await loadData(true);
    } catch (error) {
      console.error('Erro ao resolver alerta:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'critical': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy': return <Badge className="bg-green-500">Saudável</Badge>;
      case 'warning': return <Badge className="bg-yellow-500">Atenção</Badge>;
      case 'critical': return <Badge className="bg-red-500">Crítico</Badge>;
      default: return <Badge variant="secondary">Desconhecido</Badge>;
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical': return <XCircle className="h-5 w-5 text-red-600" />;
      case 'error': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      default: return <AlertTriangle className="h-5 w-5 text-blue-500" />;
    }
  };

  const getAlertBgColor = (type: string) => {
    switch (type) {
      case 'critical': return 'bg-red-50 dark:bg-red-950 border-red-200';
      case 'error': return 'bg-red-50 dark:bg-red-950 border-red-200';
      case 'warning': return 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200';
      default: return 'bg-blue-50 dark:bg-blue-950 border-blue-200';
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar userType="admin" userName="Admin" />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar userType="admin" userName="Admin" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header userName="Administrador" userRole="Admin" />
        
        <main className="flex-1 overflow-y-auto p-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                <Activity className="h-8 w-8" />
                Monitoramento do Sistema
              </h1>
              <p className="text-muted-foreground mt-1">
                Acompanhe o desempenho e saúde da plataforma
              </p>
            </div>
            <Button 
              onClick={() => loadData(true)} 
              disabled={refreshing}
              variant="outline"
            >
              {refreshing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Activity className="h-4 w-4 mr-2" />
              )}
              Atualizar
            </Button>
          </div>

          {/* Status Geral */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Status do Sistema</p>
                  <div className="mt-2">
                    {health && getStatusBadge(health.status)}
                  </div>
                </div>
                <Server className={`h-8 w-8 ${health ? getStatusColor(health.status) : 'text-gray-500'}`} />
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Banco de Dados</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {health?.database.status === 'connected' ? 'Conectado' : 'Desconectado'}
                  </p>
                  <p className="text-lg font-bold text-foreground mt-1">
                    {health?.database.latency || 'N/A'}
                  </p>
                </div>
                <Database className={`h-8 w-8 ${health?.database.status === 'connected' ? 'text-blue-500' : 'text-red-500'}`} />
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Requisições</p>
                  <p className="text-2xl font-bold text-foreground">{metrics?.totalRequests || 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Taxa de erro: {metrics?.errorRate || 0}%
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Uptime</p>
                  <p className="text-lg font-bold text-foreground">{health?.uptime.process || 'N/A'}</p>
                </div>
                <Clock className="h-8 w-8 text-green-500" />
              </div>
            </Card>
          </div>

          {/* Recursos do Sistema */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <HardDrive className="h-5 w-5" />
                Memória
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Uso</span>
                  <span className="font-semibold">{health?.memory.percentUsed || '0%'}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: health?.memory.percentUsed || '0%' }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Usado: {health?.memory.used || '0 GB'}</span>
                  <span>Livre: {health?.memory.free || '0 GB'}</span>
                  <span>Total: {health?.memory.total || '0 GB'}</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Cpu className="h-5 w-5" />
                CPU
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Núcleos</span>
                  <span className="font-semibold">{health?.cpu.cores || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Load Average</span>
                  <span className="font-semibold">
                    {health?.cpu.load?.map(l => l.toFixed(2)).join(' / ') || 'N/A'}
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* Métricas de Performance */}
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Performance</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Tempo Médio de Resposta</p>
                <p className="text-2xl font-bold text-foreground">{metrics?.avgResponseTime || 0}ms</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Usuários Ativos</p>
                <p className="text-2xl font-bold text-foreground">{metrics?.activeUsers || 0}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sessões Ativas</p>
                <p className="text-2xl font-bold text-foreground">{metrics?.activeSessions || 0}</p>
              </div>
            </div>
          </Card>

          {/* Alertas */}
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Alertas Ativos</h2>
            {alerts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground flex flex-col items-center gap-2">
                <CheckCircle className="h-12 w-12 text-green-500" />
                <p>Nenhum alerta ativo no momento</p>
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div key={alert.id} className={`flex items-start gap-3 p-4 rounded-lg border ${getAlertBgColor(alert.type)}`}>
                    {getAlertIcon(alert.type)}
                    <div className="flex-1">
                      <div className="font-semibold">{alert.title}</div>
                      <div className="text-sm text-muted-foreground">{alert.message}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(alert.timestamp).toLocaleString('pt-BR')}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleAcknowledgeAlert(alert.id)}>
                        Reconhecer
                      </Button>
                      <Button size="sm" onClick={() => handleResolveAlert(alert.id)}>
                        Resolver
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Issues */}
          {health && health.issues.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-red-600">Problemas Detectados</h2>
              <div className="space-y-2">
                {health.issues.map((issue, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <XCircle className="h-4 w-4 text-red-500" />
                    <span>{issue}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
};

export default MonitoringPage;
