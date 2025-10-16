import { useState } from "react";
import { Sidebar } from "@/components/shared/Sidebar";
import { Header } from "@/components/shared/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowRightLeft, Search, Filter, Check, X, Clock, User, Calendar } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Página de gerenciamento de transferências de pacientes (admin)
const TransfersPage = () => {
  const [searchQuery, setSearchQuery] = useState("");

  // Dados mockados de transferências
  const transfers = [
    {
      id: 1,
      patientName: "Maria Silva",
      patientId: 1,
      fromProfessional: "Dr. João Silva",
      toProfessional: "Dra. Ana Costa",
      requestDate: "2024-01-15",
      status: "pending",
      reason: "Especialização em ansiedade",
      notes: "Paciente solicitou especialista em transtornos de ansiedade"
    },
    {
      id: 2,
      patientName: "Carlos Oliveira",
      patientId: 4,
      fromProfessional: "Dra. Paula Rodrigues",
      toProfessional: "Dr. João Silva",
      requestDate: "2024-01-14",
      status: "approved",
      approvedDate: "2024-01-14",
      reason: "Mudança de horário",
      notes: "Paciente precisa de horários alternativos"
    },
    {
      id: 3,
      patientName: "João Santos",
      patientId: 2,
      fromProfessional: "Dr. João Silva",
      toProfessional: "Dr. Roberto Lima",
      requestDate: "2024-01-13",
      status: "rejected",
      rejectedDate: "2024-01-14",
      reason: "Incompatibilidade de agenda",
      notes: "Profissional não possui disponibilidade",
      rejectionReason: "Agenda completa no momento"
    },
    {
      id: 4,
      patientName: "Ana Paula",
      patientId: 6,
      fromProfessional: "Dra. Ana Costa",
      toProfessional: "Dra. Paula Rodrigues",
      requestDate: "2024-01-12",
      status: "approved",
      approvedDate: "2024-01-13",
      reason: "Abordagem terapêutica",
      notes: "Necessidade de abordagem cognitivo-comportamental"
    }
  ];

  // Filtra transferências por busca
  const filteredTransfers = transfers.filter(transfer =>
    transfer.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    transfer.fromProfessional.toLowerCase().includes(searchQuery.toLowerCase()) ||
    transfer.toProfessional.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Agrupa transferências por status
  const pendingTransfers = filteredTransfers.filter(t => t.status === "pending");
  const approvedTransfers = filteredTransfers.filter(t => t.status === "approved");
  const rejectedTransfers = filteredTransfers.filter(t => t.status === "rejected");

  // Retorna badge de status
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "Pendente", variant: "default" as const, icon: Clock },
      approved: { label: "Aprovada", variant: "secondary" as const, icon: Check },
      rejected: { label: "Rejeitada", variant: "destructive" as const, icon: X }
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

  // Aprova transferência
  const handleApprove = (id: number) => {
    console.log("Aprovar transferência:", id);
    // Implementar lógica de aprovação
  };

  // Rejeita transferência
  const handleReject = (id: number) => {
    console.log("Rejeitar transferência:", id);
    // Implementar lógica de rejeição
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar userType="admin" userName="Admin" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header userName="Administrador" userRole="Admin" />
        
        <main className="flex-1 overflow-y-auto p-8">
          {/* Cabeçalho da página */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                <ArrowRightLeft className="h-8 w-8" />
                Transferências de Pacientes
              </h1>
              <p className="text-muted-foreground mt-1">
                Gerencie as solicitações de transferência entre profissionais
              </p>
            </div>
          </div>

          {/* Barra de busca e filtros */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por paciente ou profissional..."
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

          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold text-foreground">{transfers.length}</p>
                </div>
                <ArrowRightLeft className="h-8 w-8 text-primary" />
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pendentes</p>
                  <p className="text-2xl font-bold text-foreground">{pendingTransfers.length}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Aprovadas</p>
                  <p className="text-2xl font-bold text-foreground">{approvedTransfers.length}</p>
                </div>
                <Check className="h-8 w-8 text-green-500" />
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Rejeitadas</p>
                  <p className="text-2xl font-bold text-foreground">{rejectedTransfers.length}</p>
                </div>
                <X className="h-8 w-8 text-red-500" />
              </div>
            </Card>
          </div>

          {/* Abas de transferências */}
          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">Todas ({filteredTransfers.length})</TabsTrigger>
              <TabsTrigger value="pending">Pendentes ({pendingTransfers.length})</TabsTrigger>
              <TabsTrigger value="approved">Aprovadas ({approvedTransfers.length})</TabsTrigger>
              <TabsTrigger value="rejected">Rejeitadas ({rejectedTransfers.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4 mt-6">
              {filteredTransfers.map((transfer) => (
                <Card key={transfer.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-3 rounded-full bg-muted">
                        <ArrowRightLeft className="h-5 w-5 text-primary" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-foreground">{transfer.patientName}</h3>
                          {getStatusBadge(transfer.status)}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground mb-3">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>De: {transfer.fromProfessional}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>Para: {transfer.toProfessional}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>Solicitado em: {transfer.requestDate}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <ArrowRightLeft className="h-4 w-4" />
                            <span>Motivo: {transfer.reason}</span>
                          </div>
                        </div>
                        
                        {transfer.notes && (
                          <p className="text-sm text-muted-foreground italic">
                            {transfer.notes}
                          </p>
                        )}
                        
                        {transfer.status === "rejected" && transfer.rejectionReason && (
                          <p className="text-sm text-destructive mt-2">
                            Motivo da rejeição: {transfer.rejectionReason}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {transfer.status === "pending" && (
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="default"
                          onClick={() => handleApprove(transfer.id)}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Aprovar
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleReject(transfer.id)}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Rejeitar
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="pending" className="space-y-4 mt-6">
              {pendingTransfers.map((transfer) => (
                <Card key={transfer.id} className="p-4 border-l-4 border-l-orange-500">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-3 rounded-full bg-muted">
                        <ArrowRightLeft className="h-5 w-5 text-primary" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-foreground">{transfer.patientName}</h3>
                          {getStatusBadge(transfer.status)}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground mb-3">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>De: {transfer.fromProfessional}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>Para: {transfer.toProfessional}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>Solicitado em: {transfer.requestDate}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <ArrowRightLeft className="h-4 w-4" />
                            <span>Motivo: {transfer.reason}</span>
                          </div>
                        </div>
                        
                        {transfer.notes && (
                          <p className="text-sm text-muted-foreground italic">
                            {transfer.notes}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="default"
                        onClick={() => handleApprove(transfer.id)}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Aprovar
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleReject(transfer.id)}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Rejeitar
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="approved" className="space-y-4 mt-6">
              {approvedTransfers.map((transfer) => (
                <Card key={transfer.id} className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-full bg-muted">
                      <ArrowRightLeft className="h-5 w-5 text-primary" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-foreground">{transfer.patientName}</h3>
                        {getStatusBadge(transfer.status)}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>De: {transfer.fromProfessional}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>Para: {transfer.toProfessional}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>Aprovado em: {transfer.approvedDate}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="rejected" className="space-y-4 mt-6">
              {rejectedTransfers.map((transfer) => (
                <Card key={transfer.id} className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-full bg-muted">
                      <ArrowRightLeft className="h-5 w-5 text-primary" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-foreground">{transfer.patientName}</h3>
                        {getStatusBadge(transfer.status)}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>De: {transfer.fromProfessional}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>Para: {transfer.toProfessional}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>Rejeitado em: {transfer.rejectedDate}</span>
                        </div>
                      </div>
                      
                      {transfer.rejectionReason && (
                        <p className="text-sm text-destructive">
                          Motivo: {transfer.rejectionReason}
                        </p>
                      )}
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

export default TransfersPage;
