import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/shared/Sidebar";
import { Header } from "@/components/shared/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, Search, Filter, Plus, Calendar, Clock, User, FileText } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Página de consultas/sessões do profissional
const SessionsPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  // Dados mockados de sessões
  const sessions = [
    {
      id: 1,
      patientId: 1,
      patientName: "Maria Silva",
      date: "2024-01-15",
      time: "14:00",
      duration: "50 min",
      type: "Consulta Regular",
      status: "scheduled",
      notes: "Primeira consulta do mês"
    },
    {
      id: 2,
      patientId: 2,
      patientName: "João Santos",
      date: "2024-01-15",
      time: "15:00",
      duration: "50 min",
      type: "Retorno",
      status: "scheduled",
      notes: "Acompanhamento mensal"
    },
    {
      id: 3,
      patientId: 3,
      patientName: "Ana Costa",
      date: "2024-01-14",
      time: "10:00",
      duration: "50 min",
      type: "Consulta Regular",
      status: "completed",
      notes: "Sessão produtiva, paciente apresentou melhora"
    },
    {
      id: 4,
      patientId: 4,
      patientName: "Carlos Oliveira",
      date: "2024-01-14",
      time: "14:00",
      duration: "50 min",
      type: "Avaliação Inicial",
      status: "completed",
      notes: "Primeira consulta, anamnese completa realizada"
    },
    {
      id: 5,
      patientId: 5,
      patientName: "Paula Rodrigues",
      date: "2024-01-13",
      time: "09:00",
      duration: "50 min",
      type: "Retorno",
      status: "cancelled",
      notes: "Paciente cancelou com antecedência"
    }
  ];

  // Filtra sessões por busca
  const filteredSessions = sessions.filter(session =>
    session.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Agrupa sessões por status
  const scheduledSessions = filteredSessions.filter(s => s.status === "scheduled");
  const completedSessions = filteredSessions.filter(s => s.status === "completed");
  const cancelledSessions = filteredSessions.filter(s => s.status === "cancelled");

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
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
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
              {filteredSessions.map((session) => (
                <Card key={session.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-3 rounded-full bg-muted">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-foreground">{session.patientName}</h3>
                          {getStatusBadge(session.status)}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{session.date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>{session.time} ({session.duration})</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <span>{session.type}</span>
                          </div>
                        </div>
                        
                        {session.notes && (
                          <p className="text-sm text-muted-foreground mt-3 italic">
                            {session.notes}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/professional/patients/${session.patientId}`)}
                    >
                      Ver Paciente
                    </Button>
                  </div>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="scheduled" className="space-y-4 mt-6">
              {scheduledSessions.map((session) => (
                <Card key={session.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-3 rounded-full bg-muted">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-foreground">{session.patientName}</h3>
                          {getStatusBadge(session.status)}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{session.date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>{session.time} ({session.duration})</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <span>{session.type}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/professional/patients/${session.patientId}`)}
                    >
                      Ver Paciente
                    </Button>
                  </div>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="completed" className="space-y-4 mt-6">
              {completedSessions.map((session) => (
                <Card key={session.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-3 rounded-full bg-muted">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-foreground">{session.patientName}</h3>
                          {getStatusBadge(session.status)}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{session.date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>{session.time} ({session.duration})</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <span>{session.type}</span>
                          </div>
                        </div>
                        
                        {session.notes && (
                          <p className="text-sm text-muted-foreground mt-3 italic">
                            {session.notes}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/professional/patients/${session.patientId}`)}
                    >
                      Ver Paciente
                    </Button>
                  </div>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="cancelled" className="space-y-4 mt-6">
              {cancelledSessions.map((session) => (
                <Card key={session.id} className="p-4 hover:shadow-md transition-shadow opacity-75">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-3 rounded-full bg-muted">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-foreground">{session.patientName}</h3>
                          {getStatusBadge(session.status)}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{session.date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>{session.time} ({session.duration})</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <span>{session.type}</span>
                          </div>
                        </div>
                        
                        {session.notes && (
                          <p className="text-sm text-muted-foreground mt-3 italic">
                            {session.notes}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/professional/patients/${session.patientId}`)}
                    >
                      Ver Paciente
                    </Button>
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

export default SessionsPage;
