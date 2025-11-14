import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Session } from "@/services/professional.service";

interface SessionCardProps {
  session: Session;
  opacity?: boolean;
}

export const SessionCard = ({ session, opacity = false }: SessionCardProps) => {
  const navigate = useNavigate();

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch {
      return dateString;
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      scheduled: { label: "Agendada", variant: "default" as const },
      completed: { label: "Concluída", variant: "secondary" as const },
      cancelled: { label: "Cancelada", variant: "destructive" as const },
      no_show: { label: "Falta", variant: "destructive" as const }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.scheduled;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <Card className={`p-4 hover:shadow-md transition-shadow ${opacity ? 'opacity-75' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4 flex-1">
          <div className="p-3 rounded-full bg-muted">
            <User className="h-5 w-5 text-primary" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-foreground">
                {(session.Patient || session.patient)?.full_name || 'Paciente'}
              </h3>
              {getStatusBadge(session.status)}
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(session.session_date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{formatTime(session.session_date)} ({session.duration_minutes || session.duration} min)</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span>{session.session_type || 'Sessão'}</span>
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
          onClick={() => navigate(`/professional/patients/${(session.Patient || session.patient)?.id}`)}
        >
          Ver Paciente
        </Button>
      </div>
    </Card>
  );
};
