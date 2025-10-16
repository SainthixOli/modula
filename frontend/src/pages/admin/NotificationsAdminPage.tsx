import { Sidebar } from "@/components/shared/Sidebar";
import { Header } from "@/components/shared/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Plus, Settings } from "lucide-react";

// Página de configuração de notificações e triggers (admin)
const NotificationsAdminPage = () => {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar userType="admin" userName="Admin" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header userName="Administrador" userRole="Admin" />
        
        <main className="flex-1 overflow-y-auto p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                <Bell className="h-8 w-8" />
                Configuração de Notificações
              </h1>
              <p className="text-muted-foreground mt-1">
                Configure triggers automáticos e alertas do sistema
              </p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Regra
            </Button>
          </div>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Settings className="h-5 w-5" />
              <h2 className="text-xl font-semibold">Regras de Notificação</h2>
            </div>
            <p className="text-muted-foreground">Configure triggers automáticos para eventos do sistema</p>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default NotificationsAdminPage;
