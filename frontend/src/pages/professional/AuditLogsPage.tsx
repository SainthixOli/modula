import { useState, useEffect } from "react";
import { Sidebar } from "@/components/shared/Sidebar";
import { Header } from "@/components/shared/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Shield, Search, Download, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAuditLogs, exportAuditLogs, type AuditLog, type AuditLogFilters } from "@/services/audit.service";

// Página de logs de auditoria LGPD
const AuditLogsPage = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;

  const loadLogs = async () => {
    try {
      setLoading(true);
      
      const filters: AuditLogFilters = {
        limit,
        offset: (page - 1) * limit
      };

      if (actionFilter !== 'all') filters.action = actionFilter;
      if (statusFilter !== 'all') filters.status = statusFilter;

      const response = await getAuditLogs(filters);
      setLogs(response.logs);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Erro ao carregar logs de auditoria:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [page, actionFilter, statusFilter]);

  const handleExport = async (format: 'csv' | 'json') => {
    try {
      setExporting(true);
      
      const filters: AuditLogFilters = {};
      if (actionFilter !== 'all') filters.action = actionFilter;
      if (statusFilter !== 'all') filters.status = statusFilter;

      const blob = await exportAuditLogs(filters, format);
      
      // Criar link para download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erro ao exportar logs:', error);
    } finally {
      setExporting(false);
    }
  };

  // Filtra logs por busca local
  const filteredLogs = logs.filter(log =>
    searchQuery === "" ||
    log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.resource.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.user?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      success: { label: "Sucesso", variant: "secondary" as const, color: "bg-green-500" },
      failure: { label: "Falha", variant: "default" as const, color: "bg-yellow-500" },
      error: { label: "Erro", variant: "destructive" as const, color: "bg-red-500" }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.success;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getActionLabel = (action: string) => {
    const actions: Record<string, string> = {
      'create': 'Criação',
      'read': 'Leitura',
      'update': 'Atualização',
      'delete': 'Exclusão',
      'login': 'Login',
      'logout': 'Logout',
      'export': 'Exportação'
    };
    return actions[action.toLowerCase()] || action;
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar userType="professional" userName="Profissional" />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar userType="professional" userName="Profissional" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header userName="Profissional" userRole="Psicólogo" />
        
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
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => handleExport('csv')}
                disabled={exporting}
              >
                {exporting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
                Exportar CSV
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleExport('json')}
                disabled={exporting}
              >
                Exportar JSON
              </Button>
            </div>
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

          {/* Filtros */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por ação, recurso ou usuário..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Ação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Ações</SelectItem>
                <SelectItem value="create">Criação</SelectItem>
                <SelectItem value="read">Leitura</SelectItem>
                <SelectItem value="update">Atualização</SelectItem>
                <SelectItem value="delete">Exclusão</SelectItem>
                <SelectItem value="export">Exportação</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Status</SelectItem>
                <SelectItem value="success">Sucesso</SelectItem>
                <SelectItem value="failure">Falha</SelectItem>
                <SelectItem value="error">Erro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tabela de Logs */}
          <Card className="mb-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr className="text-left">
                    <th className="p-4 font-semibold">Data/Hora</th>
                    <th className="p-4 font-semibold">Usuário</th>
                    <th className="p-4 font-semibold">Ação</th>
                    <th className="p-4 font-semibold">Recurso</th>
                    <th className="p-4 font-semibold">IP</th>
                    <th className="p-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-muted-foreground">
                        Nenhum log encontrado
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => (
                      <tr key={log.id} className="border-b hover:bg-muted/50">
                        <td className="p-4 text-sm">
                          {new Date(log.timestamp).toLocaleString('pt-BR')}
                        </td>
                        <td className="p-4 text-sm">
                          {log.user?.name || 'Sistema'}
                        </td>
                        <td className="p-4 text-sm font-medium">
                          {getActionLabel(log.action)}
                        </td>
                        <td className="p-4 text-sm">
                          {log.resource}
                          {log.resourceId && <span className="text-muted-foreground"> #{log.resourceId}</span>}
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {log.ipAddress}
                        </td>
                        <td className="p-4">
                          {getStatusBadge(log.status)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Página {page} de {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Próxima
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AuditLogsPage;
