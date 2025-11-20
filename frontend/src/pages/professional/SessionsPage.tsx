import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/shared/Sidebar";
import { Header } from "@/components/shared/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, Search, Plus, Loader2, Filter, Calendar, FileText, Clock, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getSessions, Session } from "@/services/professional.service";
import { useToast } from "@/hooks/use-toast";
import { SessionCard } from "@/components/shared/SessionCard";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Página de consultas/sessões do profissional
const SessionsPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Estados para filtros
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [hasActiveFilters, setHasActiveFilters] = useState(false);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        // Buscar sessões dos últimos 30 dias e próximos 30 dias
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 30);
        
        console.log('🔍 SessionsPage - Buscando sessões de', startDate, 'até', endDate);
        const data = await getSessions(startDate, endDate);
        console.log('✅ SessionsPage - Sessões carregadas:', data);
        setSessions(data);
      } catch (error) {
        console.error('❌ SessionsPage - Erro ao carregar sessões:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar as sessões',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [toast]);

  // Aplicar todos os filtros
  const filteredSessions = sessions.filter(session => {
    const patientData = session.Patient || session.patient;
    const notesData = session.notes;
    
    // Filtro de busca
    const matchesSearch = patientData?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           notesData?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filtro de status
    const matchesStatus = statusFilter === "all" || session.status === statusFilter;
    
    // Filtro de tipo
    const matchesType = typeFilter === "all" || session.session_type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Funções do modal de filtros
  const handleApplyFilters = () => {
    setHasActiveFilters(statusFilter !== "all" || typeFilter !== "all");
    setFilterModalOpen(false);
  };

  const handleClearFilters = () => {
    setStatusFilter("all");
    setTypeFilter("all");
    setHasActiveFilters(false);
  };

  console.log('📊 Estatísticas:', {
    total: sessions.length,
    filtradas: filteredSessions.length,
    searchQuery
  });

  // Agrupa sessões por status
  const scheduledSessions = filteredSessions.filter(s => s.status === "scheduled");
  const completedSessions = filteredSessions.filter(s => s.status === "completed");
  const cancelledSessions = filteredSessions.filter(s => s.status === "cancelled" || s.status === "no_show");

  // Retorna badge de status
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      scheduled: { label: "Agendada", variant: "default" as const },
      completed: { label: "Concluída", variant: "secondary" as const },
      cancelled: { label: "Cancelada", variant: "destructive" as const }
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // Helper para formatar data
  const formatSessionDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR');
    } catch {
      return dateString;
    }
  };

  // Helper para formatar hora
  const formatSessionTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar userType="professional" userName="Dr. João Silva" />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header userName="Dr. João Silva" />
          <main className="flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </main>
        </div>
      </div>
    );
  }

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
                <ClipboardList className="h-8 w-8" />
                Consultas e Sessões
              </h1>
              <p className="text-muted-foreground mt-1">
                Gerencie o histórico de consultas e sessões
              </p>
            </div>
            
            <Button onClick={() => navigate("/professional/calendar")}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Consulta
            </Button>
          </div>

          {/* Barra de busca e filtros */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por paciente ou tipo de consulta..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button 
              variant={hasActiveFilters ? "default" : "outline"}
              onClick={() => setFilterModalOpen(true)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtros
              {hasActiveFilters && (
                <span className="ml-2 bg-background text-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
                  {(statusFilter !== "all" ? 1 : 0) + (typeFilter !== "all" ? 1 : 0)}
                </span>
              )}
            </Button>
          </div>

          {/* Estatísticas rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total de Sessões</p>
                  <p className="text-2xl font-bold text-foreground">{sessions.length}</p>
                </div>
                <ClipboardList className="h-8 w-8 text-primary" />
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Agendadas</p>
                  <p className="text-2xl font-bold text-foreground">{scheduledSessions.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-500" />
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Concluídas</p>
                  <p className="text-2xl font-bold text-foreground">{completedSessions.length}</p>
                </div>
                <FileText className="h-8 w-8 text-green-500" />
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Canceladas</p>
                  <p className="text-2xl font-bold text-foreground">{cancelledSessions.length}</p>
                </div>
                <Clock className="h-8 w-8 text-red-500" />
              </div>
            </Card>
          </div>

          {/* Abas de sessões */}
          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">Todas ({filteredSessions.length})</TabsTrigger>
              <TabsTrigger value="scheduled">Agendadas ({scheduledSessions.length})</TabsTrigger>
              <TabsTrigger value="completed">Concluídas ({completedSessions.length})</TabsTrigger>
              <TabsTrigger value="cancelled">Canceladas ({cancelledSessions.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4 mt-6">
              {filteredSessions.length > 0 ? (
                filteredSessions.map((session) => (
                  <SessionCard key={session.id} session={session} />
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">Nenhuma sessão encontrada</p>
              )}
            </TabsContent>

            <TabsContent value="scheduled" className="space-y-4 mt-6">
              {scheduledSessions.length > 0 ? (
                scheduledSessions.map((session) => (
                  <SessionCard key={session.id} session={session} />
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">Nenhuma sessão agendada</p>
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-4 mt-6">
              {completedSessions.length > 0 ? (
                completedSessions.map((session) => (
                  <SessionCard key={session.id} session={session} />
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">Nenhuma sessão concluída</p>
              )}
            </TabsContent>

            <TabsContent value="cancelled" className="space-y-4 mt-6">
              {cancelledSessions.length > 0 ? (
                cancelledSessions.map((session) => (
                  <SessionCard key={session.id} session={session} opacity />
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">Nenhuma sessão cancelada</p>
              )}
            </TabsContent>
          </Tabs>
        </main>
      </div>

      {/* Modal de Filtros */}
      <Dialog open={filterModalOpen} onOpenChange={setFilterModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Filtros de Sessões</DialogTitle>
            <DialogDescription>
              Refine a lista de sessões aplicando filtros personalizados
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            {/* Filtro de Status */}
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="scheduled">Agendada</SelectItem>
                  <SelectItem value="completed">Concluída</SelectItem>
                  <SelectItem value="cancelled">Cancelada</SelectItem>
                  <SelectItem value="no_show">Falta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filtro de Tipo */}
            <div className="grid gap-2">
              <Label htmlFor="type">Tipo de Consulta</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="initial">Inicial</SelectItem>
                  <SelectItem value="followup">Retorno</SelectItem>
                  <SelectItem value="therapy">Terapia</SelectItem>
                  <SelectItem value="evaluation">Avaliação</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="flex justify-between sm:justify-between">
            <Button variant="outline" onClick={handleClearFilters}>
              <X className="h-4 w-4 mr-2" />
              Limpar Filtros
            </Button>
            <Button onClick={handleApplyFilters}>
              Aplicar Filtros
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SessionsPage;
