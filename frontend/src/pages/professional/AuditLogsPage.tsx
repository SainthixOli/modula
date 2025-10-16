import { useState } from "react";
import { Sidebar } from "@/components/shared/Sidebar";
import { Header } from "@/components/shared/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Shield, Search, Filter, Download, Eye, User, Calendar, FileText } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Página de logs de auditoria LGPD (visualização para profissional)
const AuditLogsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");

  // Dados mockados de logs de auditoria
  const auditLogs = [
    {
      id: 1,
      action: "VIEW_PATIENT",
      description: "Visualizou prontuário do paciente Maria Silva",
      timestamp: "2024-01-15 14:30:25",
      user: "Dr. João Silva",
      ipAddress: "192.168.1.100",
      category: "access",
      severity: "info"
    },
    {
      id: 2,
      action: "UPDATE_PATIENT",
      description: "Atualizou dados do paciente João Santos",
      timestamp: "2024-01-15 13:15:10",
      user: "Dr. João Silva",
      ipAddress: "192.168.1.100",
      category: "modification",
      severity: "info"
    },
    {
      id: 3,
      action: "CREATE_ANAMNESIS",
      description: "Criou nova anamnese para Ana Costa",
      timestamp: "2024-01-14 16:45:30",
      user: "Dr. João Silva",
      ipAddress: "192.168.1.100",
      category: "creation",
      severity: "info"
    },
    {
      id: 4,
      action: "EXPORT_DATA",
      description: "Exportou relatório de pacientes",
      timestamp: "2024-01-14 10:20:15",
      user: "Dr. João Silva",
      ipAddress: "192.168.1.100",
      category: "export",
      severity: "warning"
    },
    {
      id: 5,
      action: "VIEW_PATIENT",
      description: "Visualizou prontuário do paciente Carlos Oliveira",
      timestamp: "2024-01-13 15:30:00",
      user: "Dr. João Silva",
      ipAddress: "192.168.1.100",
      category: "access",
      severity: "info"
    }
  ];

  // Filtra logs por busca
  const filteredLogs = auditLogs.filter(log =>
    log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.action.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Retorna badge de severidade
  const getSeverityBadge = (severity: string) => {
    const severityConfig = {
      info: { label: "Informação", variant: "secondary" as const },
      warning: { label: "Aviso", variant: "default" as const },
      error: { label: "Erro", variant: "destructive" as const }
    };
    const config = severityConfig[severity as keyof typeof severityConfig];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // Retorna ícone de ação
  const getActionIcon = (category: string) => {
    const iconMap = {
      access: Eye,
      modification: FileText,
      creation: FileText,
      export: Download
    };
    const Icon = iconMap[category as keyof typeof iconMap] || FileText;
    return <Icon className="h-5 w-5" />;
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
                <Shield className="h-8 w-8" />
                Logs de Auditoria LGPD
              </h1>
              <p className="text-muted-foreground mt-1">
                Visualize suas ações e acesso a dados de pacientes
              </p>
            </div>
            
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar Logs
            </Button>
          </div>

          {/* Alerta informativo */}
          <Card className="p-4 mb-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                  Conformidade LGPD
                </h3>
                <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                  Todos os acessos a dados de pacientes são registrados conforme a Lei Geral de Proteção de Dados (LGPD).
                  Este registro garante rastreabilidade e transparência no tratamento de dados pessoais sensíveis.
                </p>
              </div>
            </div>
          </Card>

          {/* Barra de busca e filtros */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por ação ou descrição..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtros Avançados
            </Button>
          </div>

          {/* Estatísticas rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total de Logs</p>
                  <p className="text-2xl font-bold text-foreground">{auditLogs.length}</p>
                </div>
                <FileText className="h-8 w-8 text-primary" />
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Acessos</p>
                  <p className="text-2xl font-bold text-foreground">
                    {auditLogs.filter(l => l.category === "access").length}
                  </p>
                </div>
                <Eye className="h-8 w-8 text-blue-500" />
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Modificações</p>
                  <p className="text-2xl font-bold text-foreground">
                    {auditLogs.filter(l => l.category === "modification").length}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-orange-500" />
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Exportações</p>
                  <p className="text-2xl font-bold text-foreground">
                    {auditLogs.filter(l => l.category === "export").length}
                  </p>
                </div>
                <Download className="h-8 w-8 text-green-500" />
              </div>
            </Card>
          </div>

          {/* Lista de logs */}
          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">Todos ({filteredLogs.length})</TabsTrigger>
              <TabsTrigger value="access">Acessos</TabsTrigger>
              <TabsTrigger value="modification">Modificações</TabsTrigger>
              <TabsTrigger value="export">Exportações</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4 mt-6">
              {filteredLogs.map((log) => (
                <Card key={log.id} className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-full bg-muted">
                      {getActionIcon(log.category)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-foreground">{log.action}</h3>
                            {getSeverityBadge(log.severity)}
                          </div>
                          <p className="text-sm text-muted-foreground">{log.description}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 mt-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <User className="h-3 w-3" />
                          <span>{log.user}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          <span>{log.timestamp}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Shield className="h-3 w-3" />
                          <span>IP: {log.ipAddress}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="access" className="space-y-4 mt-6">
              {filteredLogs.filter(l => l.category === "access").map((log) => (
                <Card key={log.id} className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-full bg-muted">
                      {getActionIcon(log.category)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-foreground">{log.action}</h3>
                            {getSeverityBadge(log.severity)}
                          </div>
                          <p className="text-sm text-muted-foreground">{log.description}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 mt-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <User className="h-3 w-3" />
                          <span>{log.user}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          <span>{log.timestamp}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Shield className="h-3 w-3" />
                          <span>IP: {log.ipAddress}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="modification" className="space-y-4 mt-6">
              {filteredLogs.filter(l => l.category === "modification").map((log) => (
                <Card key={log.id} className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-full bg-muted">
                      {getActionIcon(log.category)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-foreground">{log.action}</h3>
                            {getSeverityBadge(log.severity)}
                          </div>
                          <p className="text-sm text-muted-foreground">{log.description}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 mt-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <User className="h-3 w-3" />
                          <span>{log.user}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          <span>{log.timestamp}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Shield className="h-3 w-3" />
                          <span>IP: {log.ipAddress}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="export" className="space-y-4 mt-6">
              {filteredLogs.filter(l => l.category === "export").map((log) => (
                <Card key={log.id} className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-full bg-muted">
                      {getActionIcon(log.category)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-foreground">{log.action}</h3>
                            {getSeverityBadge(log.severity)}
                          </div>
                          <p className="text-sm text-muted-foreground">{log.description}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 mt-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <User className="h-3 w-3" />
                          <span>{log.user}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          <span>{log.timestamp}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Shield className="h-3 w-3" />
                          <span>IP: {log.ipAddress}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default AuditLogsPage;
