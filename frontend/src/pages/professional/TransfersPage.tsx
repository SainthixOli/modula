import { useState, useEffect } from "react";
import { Sidebar } from "@/components/shared/Sidebar";
import { Header } from "@/components/shared/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowRightLeft, 
  Plus, 
  Search, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Ban,
  Loader2,
  User
} from "lucide-react";
import {
  getMyTransferRequests,
  requestTransfer,
  cancelTransfer,
  type Transfer,
  type TransferStats,
} from "@/services/transfer.service";
import { getMyPatients, type Patient } from "@/services/professional.service";
import { getActiveProfessionals } from "@/services/transfer.service";
import { format, isValid, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function TransfersPage() {
  const { userName } = useCurrentUser();
  const { toast } = useToast();

  // Helper para formatar datas com segurança
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-";
    try {
      const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
      if (!isValid(date)) return "-";
      return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch {
      return "-";
    }
  };

  const [loading, setLoading] = useState(true);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [stats, setStats] = useState<TransferStats | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // Modal de nova transferência
  const [newTransferOpen, setNewTransferOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [selectedProfessional, setSelectedProfessional] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const transfersData = await getMyTransferRequests();
      setTransfers(transfersData);
      
      // Calcular estatísticas localmente
      const calculatedStats = {
        total: transfersData.length,
        pending: transfersData.filter(t => t.status === 'pending').length,
        approved: transfersData.filter(t => t.status === 'approved').length,
        rejected: transfersData.filter(t => t.status === 'rejected').length,
        cancelled: transfersData.filter(t => t.status === 'cancelled').length,
      };
      setStats(calculatedStats);
    } catch (error) {
      console.error("Erro ao carregar transferências:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as transferências",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenNewTransfer = async () => {
    try {
      const [patientsData, professionalsData] = await Promise.all([
        getMyPatients(),
        getActiveProfessionals(),
      ]);
      setPatients(patientsData);
      setProfessionals(professionalsData.users || professionalsData);
      setNewTransferOpen(true);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados necessários",
        variant: "destructive",
      });
    }
  };

  const handleSubmitTransfer = async () => {
    if (!selectedPatient || !selectedProfessional || !reason.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos antes de enviar",
        variant: "destructive",
      });
      return;
    }

    if (reason.trim().length < 10) {
      toast({
        title: "Motivo muito curto",
        description: "O motivo deve ter no mínimo 10 caracteres",
        variant: "destructive",
      });
      return;
    }

    if (reason.trim().length > 1000) {
      toast({
        title: "Motivo muito longo",
        description: "O motivo deve ter no máximo 1000 caracteres",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      await requestTransfer({
        patient_id: selectedPatient,
        to_user_id: selectedProfessional,
        reason: reason.trim(),
      });

      toast({
        title: "Sucesso!",
        description: "Solicitação de transferência enviada para aprovação",
      });

      setNewTransferOpen(false);
      setSelectedPatient("");
      setSelectedProfessional("");
      setReason("");
      loadData();
    } catch (error: any) {
      console.error("Erro ao solicitar transferência:", error);
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Não foi possível criar a solicitação",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelTransfer = async (id: string) => {
    if (!confirm("Tem certeza que deseja cancelar esta solicitação?")) {
      return;
    }

    try {
      await cancelTransfer(id);
      toast({
        title: "Cancelado",
        description: "Solicitação cancelada com sucesso",
      });
      loadData();
    } catch (error: any) {
      console.error("Erro ao cancelar:", error);
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Não foi possível cancelar",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { label: "Pendente", variant: "warning" as const, icon: Clock },
      approved: { label: "Aprovada", variant: "success" as const, icon: CheckCircle },
      rejected: { label: "Rejeitada", variant: "destructive" as const, icon: XCircle },
      cancelled: { label: "Cancelada", variant: "secondary" as const, icon: Ban },
    };

    const config = variants[status as keyof typeof variants] || variants.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const filteredTransfers = transfers.filter((transfer) => {
    const matchesSearch =
      transfer.Patient?.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transfer.ToUser?.full_name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTab =
      activeTab === "all" ||
      (activeTab === "pending" && transfer.status === "pending") ||
      (activeTab === "approved" && transfer.status === "approved") ||
      (activeTab === "rejected" && transfer.status === "rejected");

    return matchesSearch && matchesTab;
  });

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar userType="professional" />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userType="professional" />

      <div className="flex-1 flex flex-col">
        <Header userName={userName} />

        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                  <ArrowRightLeft className="h-8 w-8 text-primary" />
                  Transferências de Pacientes
                </h1>
                <p className="text-muted-foreground mt-2">
                  Solicite a transferência de pacientes para outros profissionais
                </p>
              </div>
              <Button onClick={handleOpenNewTransfer} size="lg">
                <Plus className="h-5 w-5 mr-2" />
                Nova Transferência
              </Button>
            </div>

            {/* Stats */}
            {stats && (
              <div className="grid grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stats.total}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Pendentes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-orange-600">{stats.pending}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Aprovadas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600">{stats.approved}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Rejeitadas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-red-600">{stats.rejected}</div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por paciente ou profissional..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Tabs e Lista */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">Todas ({stats?.total || 0})</TabsTrigger>
                <TabsTrigger value="pending">Pendentes ({stats?.pending || 0})</TabsTrigger>
                <TabsTrigger value="approved">Aprovadas ({stats?.approved || 0})</TabsTrigger>
                <TabsTrigger value="rejected">Rejeitadas ({stats?.rejected || 0})</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="space-y-4 mt-6">
                {filteredTransfers.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <ArrowRightLeft className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        {searchQuery
                          ? "Nenhuma transferência encontrada"
                          : "Nenhuma transferência encontrada"}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  filteredTransfers.map((transfer) => (
                    <Card key={transfer.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="flex items-center gap-2">
                              <User className="h-5 w-5" />
                              {transfer.Patient?.full_name}
                            </CardTitle>
                            <CardDescription>
                              Para: {transfer.ToUser?.full_name}
                            </CardDescription>
                          </div>
                          {getStatusBadge(transfer.status)}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label className="text-sm text-muted-foreground">Motivo</Label>
                          <p className="mt-1">{transfer.reason}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <Label className="text-muted-foreground">Solicitado em</Label>
                            <p>{formatDate(transfer.created_at)}</p>
                          </div>
                          {transfer.approved_at && (
                            <div>
                              <Label className="text-muted-foreground">
                                {transfer.status === "approved" ? "Aprovado em" : "Rejeitado em"}
                              </Label>
                              <p>{formatDate(transfer.approved_at)}</p>
                            </div>
                          )}
                        </div>

                        {transfer.rejection_reason && (
                          <div className="p-3 bg-destructive/10 rounded-md">
                            <Label className="text-sm text-destructive">Motivo da Rejeição</Label>
                            <p className="mt-1 text-sm">{transfer.rejection_reason}</p>
                          </div>
                        )}

                        {transfer.status === "pending" && (
                          <Button
                            variant="outline"
                            onClick={() => handleCancelTransfer(transfer.id)}
                            className="w-full"
                          >
                            <Ban className="h-4 w-4 mr-2" />
                            Cancelar Solicitação
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      {/* Modal Nova Transferência */}
      <Dialog open={newTransferOpen} onOpenChange={setNewTransferOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nova Transferência</DialogTitle>
            <DialogDescription>
              Solicite a transferência de um paciente para outro profissional
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="patient">Paciente *</Label>
              <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                <SelectTrigger id="patient">
                  <SelectValue placeholder="Selecione o paciente" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="professional">Profissional de Destino *</Label>
              <Select value={selectedProfessional} onValueChange={setSelectedProfessional}>
                <SelectTrigger id="professional">
                  <SelectValue placeholder="Selecione o profissional" />
                </SelectTrigger>
                <SelectContent>
                  {professionals.map((prof) => (
                    <SelectItem key={prof.id} value={prof.id}>
                      {prof.full_name} - {prof.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="reason">Motivo da Transferência *</Label>
                <span className={`text-xs ${reason.trim().length < 10 ? 'text-destructive' : reason.trim().length > 1000 ? 'text-destructive' : 'text-muted-foreground'}`}>
                  {reason.trim().length}/1000 (mínimo: 10 caracteres)
                </span>
              </div>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explique o motivo da transferência... (mínimo 10 caracteres)"
                rows={4}
                className={reason.trim().length > 0 && reason.trim().length < 10 ? 'border-destructive' : ''}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setNewTransferOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmitTransfer} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Solicitar Transferência"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
