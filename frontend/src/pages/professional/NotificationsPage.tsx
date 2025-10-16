import { useState } from "react";
import { Sidebar } from "@/components/shared/Sidebar";
import { Header } from "@/components/shared/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Check, Trash2, AlertCircle, Calendar, User, FileText } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Página de notificações do profissional
const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "appointment",
      title: "Nova consulta agendada",
      message: "Maria Silva agendou consulta para amanhã às 14h",
      timestamp: "2024-01-15 10:30",
      read: false,
      icon: Calendar,
      color: "text-blue-500"
    },
    {
      id: 2,
      type: "patient",
      title: "Paciente transferido",
      message: "João Santos foi transferido para seu atendimento",
      timestamp: "2024-01-15 09:15",
      read: false,
      icon: User,
      color: "text-green-500"
    },
    {
      id: 3,
      type: "system",
      title: "Anamnese pendente",
      message: "Você possui 3 anamneses pendentes de preenchimento",
      timestamp: "2024-01-14 16:45",
      read: true,
      icon: FileText,
      color: "text-orange-500"
    },
    {
      id: 4,
      type: "alert",
      title: "Lembrete importante",
      message: "Revisar prontuário de Carlos Oliveira antes da consulta",
      timestamp: "2024-01-14 14:20",
      read: true,
      icon: AlertCircle,
      color: "text-red-500"
    }
  ]);

  // Marca notificação como lida
  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  // Marca todas como lidas
  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  // Remove notificação
  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

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
              {notifications.map((notification) => (
                <Card key={notification.id} className={`p-4 ${!notification.read ? 'border-l-4 border-l-primary' : ''}`}>
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-full bg-muted ${notification.color}`}>
                      <notification.icon className="h-5 w-5" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-foreground">{notification.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                          <p className="text-xs text-muted-foreground mt-2">{notification.timestamp}</p>
                        </div>
                        
                        <div className="flex gap-2">
                          {!notification.read && (
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => markAsRead(notification.id)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => deleteNotification(notification.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="unread" className="space-y-4 mt-6">
              {notifications.filter(n => !n.read).map((notification) => (
                <Card key={notification.id} className="p-4 border-l-4 border-l-primary">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-full bg-muted ${notification.color}`}>
                      <notification.icon className="h-5 w-5" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-foreground">{notification.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                          <p className="text-xs text-muted-foreground mt-2">{notification.timestamp}</p>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => markAsRead(notification.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => deleteNotification(notification.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="appointments" className="space-y-4 mt-6">
              {notifications.filter(n => n.type === "appointment").map((notification) => (
                <Card key={notification.id} className={`p-4 ${!notification.read ? 'border-l-4 border-l-primary' : ''}`}>
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-full bg-muted ${notification.color}`}>
                      <notification.icon className="h-5 w-5" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-foreground">{notification.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                          <p className="text-xs text-muted-foreground mt-2">{notification.timestamp}</p>
                        </div>
                        
                        <div className="flex gap-2">
                          {!notification.read && (
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => markAsRead(notification.id)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => deleteNotification(notification.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="system" className="space-y-4 mt-6">
              {notifications.filter(n => n.type === "system").map((notification) => (
                <Card key={notification.id} className={`p-4 ${!notification.read ? 'border-l-4 border-l-primary' : ''}`}>
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-full bg-muted ${notification.color}`}>
                      <notification.icon className="h-5 w-5" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-foreground">{notification.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                          <p className="text-xs text-muted-foreground mt-2">{notification.timestamp}</p>
                        </div>
                        
                        <div className="flex gap-2">
                          {!notification.read && (
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => markAsRead(notification.id)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => deleteNotification(notification.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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

export default NotificationsPage;
