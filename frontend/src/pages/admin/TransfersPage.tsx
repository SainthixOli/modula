import { useState, useEffect } from "react";
import { Sidebar } from "@/components/shared/Sidebar";
import { Header } from "@/components/shared/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRightLeft, Search, Check, X, Clock, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  getTransfers, 
  approveTransfer, 
  rejectTransfer,
  Transfer 
} from "@/services/transfer.service";
import { useToast } from "@/hooks/use-toast";
import { TransferCard } from "@/components/shared/TransferCard";

const TransfersPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchTransfers();
  }, []);

  const fetchTransfers = async () => {
    try {
      const data = await getTransfers();
      setTransfers(data);
    } catch (error) {
      console.error('Erro ao carregar transferências:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as transferências',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await approveTransfer(id);
      toast({
        title: 'Sucesso',
        description: 'Transferência aprovada com sucesso',
      });
      fetchTransfers();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível aprovar a transferência',
        variant: 'destructive',
      });
    }
  };

  const handleReject = async (id: string) => {
    try {
      await rejectTransfer(id);
      toast({
        title: 'Sucesso',
        description: 'Transferência rejeitada',
      });
      fetchTransfers();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível rejeitar a transferência',
        variant: 'destructive',
      });
    }
  };

  const filteredTransfers = transfers.filter(transfer =>
    transfer.patient?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    transfer.from_professional?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    transfer.to_professional?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    transfer.reason?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingTransfers = filteredTransfers.filter(t => t.status === "pending");
  const approvedTransfers = filteredTransfers.filter(t => t.status === "approved");
  const rejectedTransfers = filteredTransfers.filter(t => t.status === "rejected");

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar userType="admin" />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header userName="Administrador" />
          <main className="flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar userType="admin" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header userName="Administrador" />
        
        <main className="flex-1 overflow-y-auto p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                <ArrowRightLeft className="h-8 w-8" />
                Transferências de Pacientes
              </h1>
              <p className="text-muted-foreground mt-1">
                Gerencie as solicitações de transferência de pacientes
              </p>
            </div>
          </div>

          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por paciente, profissional ou motivo..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

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

          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">Todas ({filteredTransfers.length})</TabsTrigger>
              <TabsTrigger value="pending">Pendentes ({pendingTransfers.length})</TabsTrigger>
              <TabsTrigger value="approved">Aprovadas ({approvedTransfers.length})</TabsTrigger>
              <TabsTrigger value="rejected">Rejeitadas ({rejectedTransfers.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4 mt-6">
              {filteredTransfers.length > 0 ? (
                filteredTransfers.map((transfer) => (
                  <TransferCard 
                    key={transfer.id} 
                    transfer={transfer}
                    onApprove={handleApprove}
                    onReject={handleReject}
                  />
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">Nenhuma transferência encontrada</p>
              )}
            </TabsContent>

            <TabsContent value="pending" className="space-y-4 mt-6">
              {pendingTransfers.length > 0 ? (
                pendingTransfers.map((transfer) => (
                  <TransferCard 
                    key={transfer.id} 
                    transfer={transfer}
                    onApprove={handleApprove}
                    onReject={handleReject}
                  />
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">Nenhuma transferência pendente</p>
              )}
            </TabsContent>

            <TabsContent value="approved" className="space-y-4 mt-6">
              {approvedTransfers.length > 0 ? (
                approvedTransfers.map((transfer) => (
                  <TransferCard 
                    key={transfer.id} 
                    transfer={transfer}
                  />
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">Nenhuma transferência aprovada</p>
              )}
            </TabsContent>

            <TabsContent value="rejected" className="space-y-4 mt-6">
              {rejectedTransfers.length > 0 ? (
                rejectedTransfers.map((transfer) => (
                  <TransferCard 
                    key={transfer.id} 
                    transfer={transfer}
                  />
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">Nenhuma transferência rejeitada</p>
              )}
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default TransfersPage;
