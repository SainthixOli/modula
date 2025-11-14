import { useState, useEffect } from "react";
import { Sidebar } from "@/components/shared/Sidebar";
import { Header } from "@/components/shared/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Loader2, Check } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  getNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  deleteNotification as deleteNotificationApi,
  Notification 
} from "@/services/notification.service";
import { useToast } from "@/hooks/use-toast";
import { NotificationCard } from "@/components/shared/NotificationCard";

// Página de notificações do profissional
const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      console.log('🔔 Carregando notificações...');
      const data = await getNotifications();
      console.log('✅ Notificações carregadas:', data);
      setNotifications(data);
    } catch (error: any) {
      console.error('❌ Erro ao carregar notificações:', error);
      console.error('❌ Detalhes:', error.response?.data);
      toast({
        title: 'Erro',
        description: error.response?.data?.message || 'Não foi possível carregar as notificações',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Marca notificação como lida
  const markAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      ));
      toast({
        title: 'Sucesso',
        description: 'Notificação marcada como lida',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível marcar como lida',
        variant: 'destructive',
      });
    }
  };

  // Marca todas como lidas
  const markAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      toast({
        title: 'Sucesso',
        description: 'Todas as notificações foram marcadas como lidas',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível marcar todas como lidas',
        variant: 'destructive',
      });
    }
  };

  // Remove notificação
  const deleteNotification = async (id: string) => {
    try {
      await deleteNotificationApi(id);
      setNotifications(notifications.filter(n => n.id !== id));
      toast({
        title: 'Sucesso',
        description: 'Notificação removida',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível remover a notificação',
        variant: 'destructive',
      });
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  console.log('📊 Estado das notificações:', { 
    total: notifications.length, 
    unreadCount, 
    loading 
  });

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
                <Bell className="h-8 w-8" />
                Notificações
              </h1>
              <p className="text-muted-foreground mt-1">
                Acompanhe suas notificações e alertas
              </p>
            </div>
            
            <div className="flex gap-2">
              <Badge variant="secondary" className="text-base px-4 py-2">
                {unreadCount} não lidas
              </Badge>
              {unreadCount > 0 && (
                <Button onClick={markAllAsRead} variant="outline">
                  <Check className="h-4 w-4 mr-2" />
                  Marcar todas como lidas
                </Button>
              )}
            </div>
          </div>

          {/* Abas de filtro */}
          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">Todas ({notifications.length})</TabsTrigger>
              <TabsTrigger value="unread">Não lidas ({unreadCount})</TabsTrigger>
              <TabsTrigger value="appointments">Consultas</TabsTrigger>
              <TabsTrigger value="system">Sistema</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4 mt-6">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={markAsRead}
                    onDelete={deleteNotification}
                  />
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">Nenhuma notificação</p>
              )}
            </TabsContent>

            <TabsContent value="unread" className="space-y-4 mt-6">
              {unreadCount > 0 ? (
                notifications.filter(n => !n.read).map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={markAsRead}
                    onDelete={deleteNotification}
                  />
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">Nenhuma notificação não lida</p>
              )}
            </TabsContent>

            <TabsContent value="appointments" className="space-y-4 mt-6">
              {notifications.filter(n => n.type === "session_reminder").length > 0 ? (
                notifications.filter(n => n.type === "session_reminder").map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={markAsRead}
                    onDelete={deleteNotification}
                  />
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">Nenhuma notificação de consulta</p>
              )}
            </TabsContent>

            <TabsContent value="system" className="space-y-4 mt-6">
              {notifications.filter(n => n.type === "system").length > 0 ? (
                notifications.filter(n => n.type === "system").map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={markAsRead}
                    onDelete={deleteNotification}
                  />
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">Nenhuma notificação do sistema</p>
              )}
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default NotificationsPage;
