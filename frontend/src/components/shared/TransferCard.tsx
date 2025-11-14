import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRightLeft, User, Calendar, Check, X, Clock } from "lucide-react";
import { Transfer } from "@/services/transfer.service";

interface TransferCardProps {
  transfer: Transfer;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}

export const TransferCard = ({ transfer, onApprove, onReject }: TransferCardProps) => {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "Pendente", variant: "default" as const, icon: Clock },
      approved: { label: "Aprovada", variant: "secondary" as const, icon: Check },
      rejected: { label: "Rejeitada", variant: "destructive" as const, icon: X }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4 flex-1">
          <div className="p-3 rounded-full bg-muted">
            <ArrowRightLeft className="h-5 w-5 text-primary" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-foreground">
                {transfer.patient?.full_name || 'Paciente'}
              </h3>
              {getStatusBadge(transfer.status)}
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground mb-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>De: {transfer.from_professional?.full_name || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>Para: {transfer.to_professional?.full_name || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Solicitado em: {new Date(transfer.created_at).toLocaleDateString('pt-BR')}</span>
              </div>
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="h-4 w-4" />
                <span>Motivo: {transfer.reason}</span>
              </div>
            </div>
          </div>
        </div>
        
        {transfer.status === "pending" && onApprove && onReject && (
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="default"
              onClick={() => onApprove(transfer.id)}
            >
              <Check className="h-4 w-4 mr-1" />
              Aprovar
            </Button>
            <Button 
              size="sm" 
              variant="destructive"
              onClick={() => onReject(transfer.id)}
            >
              <X className="h-4 w-4 mr-1" />
              Rejeitar
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};
