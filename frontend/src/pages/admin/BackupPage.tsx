import { useState, useEffect } from "react";
import { Sidebar } from "@/components/shared/Sidebar";
import { Header } from "@/components/shared/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Database, Plus, RotateCw, Download, Trash2, CheckCircle, AlertTriangle, Loader2, HardDrive } from "lucide-react";
import { getBackups, createBackup, restoreBackup, verifyBackup, deleteBackup, rotateBackups, type Backup } from "@/services/backup.service";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Página de backup do sistema (admin)
const BackupPage = () => {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [rotating, setRotating] = useState(false);
  const [totalSize, setTotalSize] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<Backup | null>(null);

  const loadBackups = async () => {
    try {
      setLoading(true);
      const response = await getBackups();
      setBackups(response.backups);
      setTotalSize(response.totalSizeFormatted);
    } catch (error) {
      console.error('Erro ao carregar backups:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBackups();
  }, []);

  const handleCreateBackup = async () => {
    try {
      setCreating(true);
      await createBackup();
      await loadBackups();
    } catch (error) {
      console.error('Erro ao criar backup:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleRotateBackups = async () => {
    try {
      setRotating(true);
      const result = await rotateBackups();
      console.log(`${result.deleted} backups antigos foram deletados`);
      await loadBackups();
    } catch (error) {
      console.error('Erro ao rotacionar backups:', error);
    } finally {
      setRotating(false);
    }
  };

  const handleDeleteBackup = async () => {
    if (!selectedBackup) return;
    
    try {
      await deleteBackup(selectedBackup.name);
      await loadBackups();
      setDeleteDialogOpen(false);
      setSelectedBackup(null);
    } catch (error) {
      console.error('Erro ao deletar backup:', error);
    }
  };

  const handleRestoreBackup = async () => {
    if (!selectedBackup) return;
    
    try {
      await restoreBackup(selectedBackup.name);
      setRestoreDialogOpen(false);
      setSelectedBackup(null);
      alert('Backup restaurado com sucesso! O sistema será reiniciado.');
    } catch (error) {
      console.error('Erro ao restaurar backup:', error);
    }
  };

  const openDeleteDialog = (backup: Backup) => {
    setSelectedBackup(backup);
    setDeleteDialogOpen(true);
  };

  const openRestoreDialog = (backup: Backup) => {
    setSelectedBackup(backup);
    setRestoreDialogOpen(true);
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
          {/* Cabeçalho */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                <Database className="h-8 w-8" />
                Backup do Sistema
              </h1>
              <p className="text-muted-foreground mt-1">
                Gerencie backups automáticos e manuais do banco de dados
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={handleRotateBackups}
                disabled={rotating}
                variant="outline"
              >
                {rotating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RotateCw className="h-4 w-4 mr-2" />}
                Limpar Antigos
              </Button>
              <Button
                onClick={handleCreateBackup}
                disabled={creating}
              >
                {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                Criar Backup Manual
              </Button>
            </div>
          </div>

          {/* Alerta informativo */}
          <Card className="p-4 mb-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <Database className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                  Backup Automático Configurado
                </h3>
                <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                  Backups automáticos são executados diariamente às 02:00. Os backups são mantidos por 30 dias e depois automaticamente removidos.
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
                <HardDrive className="h-8 w-8 text-blue-500" />
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Espaço Utilizado</p>
                  <p className="text-2xl font-bold text-foreground">{totalSize}</p>
                </div>
                <Database className="h-8 w-8 text-purple-500" />
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Último Backup</p>
                  <p className="text-lg font-bold text-foreground">
                    {backups.length > 0 
                      ? new Date(backups[0].createdAt).toLocaleDateString('pt-BR')
                      : 'Nenhum'
                    }
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </Card>
          </div>

          {/* Lista de Backups */}
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Backups Disponíveis</h2>
              
              {backups.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Database className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Nenhum backup encontrado</p>
                  <p className="text-sm mt-2">Crie seu primeiro backup manual para começar</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {backups.map((backup) => (
                    <div key={backup.name} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-primary/10">
                          <Database className="h-6 w-6 text-primary" />
                        </div>
                        
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{backup.name}</h3>
                            <Badge variant={backup.type === 'automatic' ? 'secondary' : 'default'}>
                              {backup.type === 'automatic' ? 'Automático' : 'Manual'}
                            </Badge>
                            {backup.verified && (
                              <Badge variant="secondary" className="bg-green-500">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Verificado
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Tamanho: {backup.sizeFormatted}</span>
                            <span>•</span>
                            <span>
                              Criado: {new Date(backup.createdAt).toLocaleString('pt-BR')}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openRestoreDialog(backup)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Restaurar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openDeleteDialog(backup)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </main>
      </div>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar o backup <strong>{selectedBackup?.name}</strong>?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteBackup} className="bg-red-500 hover:bg-red-600">
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de Confirmação de Restauração */}
      <AlertDialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Confirmar Restauração
            </AlertDialogTitle>
            <AlertDialogDescription>
              <strong className="text-yellow-600">ATENÇÃO:</strong> Ao restaurar o backup <strong>{selectedBackup?.name}</strong>, 
              todos os dados atuais do banco serão substituídos pelos dados do backup. 
              O sistema será reiniciado automaticamente após a restauração.
              <br /><br />
              Esta ação é irreversível. Recomendamos criar um backup manual antes de prosseguir.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleRestoreBackup} className="bg-yellow-500 hover:bg-yellow-600">
              Restaurar Mesmo Assim
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BackupPage;
