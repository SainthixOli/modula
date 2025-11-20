import { useState, useEffect } from "react";
import { Search, MessageSquare, Bell } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import api from "@/services/api";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface HeaderProps {
  userName: string;
  userRole?: string;
  onSearch?: (query: string) => void;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  createdAt: string;
  created_at: string;
}

export const Header = ({ userName, userRole, onSearch }: HeaderProps) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const response = await api.get('/notifications', { params: { limit: 5 } });
      const notifs = response.data.data?.notifications || [];
      setNotifications(notifs);
      setUnreadCount(notifs.filter((n: Notification) => !n.is_read).length);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatNotificationDate = (notification: Notification) => {
    const dateString = notification.created_at || notification.createdAt;
    if (!dateString) return 'Agora';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      
      if (diffInMinutes < 1) return 'Agora';
      if (diffInMinutes < 60) return `${diffInMinutes} min atrás`;
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h atrás`;
      
      return format(date, "dd/MM 'às' HH:mm", { locale: ptBR });
    } catch {
      return 'Agora';
    }
  };

  return (
    <header className="h-16 border-b border-border bg-background px-6 flex items-center justify-between">
      {/* Search Bar */}
      <div className="flex-1 max-w-2xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Pesquisar"
            className="pl-10 bg-muted/30"
            onChange={(e) => onSearch?.(e.target.value)}
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        {/* Mensagens Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full relative">
              <MessageSquare className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="px-4 py-3 border-b">
              <h3 className="font-semibold">Mensagens</h3>
            </div>
            <div className="max-h-[300px] overflow-auto">
              <div className="p-4 text-center text-sm text-muted-foreground">
                Nenhuma mensagem no momento
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="cursor-pointer justify-center"
              onClick={() => navigate('/professional/notifications')}
            >
              Ver todas
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notificações Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="px-4 py-3 border-b">
              <h3 className="font-semibold">Notificações</h3>
            </div>
            <div className="max-h-[400px] overflow-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Nenhuma notificação
                </div>
              ) : (
                notifications.map((notification) => (
                  <DropdownMenuItem 
                    key={notification.id}
                    className="flex flex-col items-start p-4 cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate('/professional/notifications')}
                  >
                    <div className="flex items-start justify-between w-full gap-2">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{notification.title}</p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatNotificationDate(notification)}
                        </p>
                      </div>
                      {!notification.is_read && (
                        <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                      )}
                    </div>
                  </DropdownMenuItem>
                ))
              )}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="cursor-pointer justify-center"
              onClick={() => navigate('/professional/notifications')}
            >
              Ver todas as notificações
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex items-center gap-3 ml-4">
          <Avatar>
            <AvatarImage src="" />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials(userName)}
            </AvatarFallback>
          </Avatar>
          <div className="text-sm">
            <div className="font-medium">{userName}</div>
            {userRole && <div className="text-xs text-muted-foreground">{userRole}</div>}
          </div>
        </div>
      </div>
    </header>
  );
};
