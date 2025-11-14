import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Trash2, AlertCircle, Calendar, User, FileText } from "lucide-react";
import { Notification } from "@/services/notification.service";

interface NotificationCardProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

export const NotificationCard = ({ notification, onMarkAsRead, onDelete }: NotificationCardProps) => {
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'session_reminder':
        return { icon: Calendar, color: 'text-blue-500' };
      case 'transfer_request':
        return { icon: User, color: 'text-green-500' };
      case 'session_cancelled':
        return { icon: AlertCircle, color: 'text-red-500' };
      default:
        return { icon: FileText, color: 'text-orange-500' };
    }
  };

  const { icon: Icon, color } = getNotificationIcon(notification.type);

  return (
    <Card className={`p-4 ${!notification.read ? 'border-l-4 border-l-primary' : ''}`}>
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-full bg-muted ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-foreground">{notification.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
              <p className="text-xs text-muted-foreground mt-2">
                {new Date(notification.created_at).toLocaleString('pt-BR')}
              </p>
            </div>
            
            <div className="flex gap-2">
              {!notification.read && (
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => onMarkAsRead(notification.id)}
                >
                  <Check className="h-4 w-4" />
                </Button>
              )}
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => onDelete(notification.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
