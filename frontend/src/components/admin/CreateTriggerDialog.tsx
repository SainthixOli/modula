import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { createCustomTrigger } from "@/services/triggers.service";
import { useToast } from "@/hooks/use-toast";

interface CreateTriggerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateTriggerDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateTriggerDialogProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  // Formulário simplificado para usuários não-técnicos
  const [formData, setFormData] = useState({
    ruleName: '',
    situation: 'transfer_requested',
    whoReceives: 'all',
    messageTitle: '',
    messageContent: '',
    importance: 'medium'
  });

  // Opções em português claro
  const situations = [
    { value: 'transfer_requested', label: 'Quando uma transferência for solicitada' },
    { value: 'transfer_approved', label: 'Quando uma transferência for aprovada' },
    { value: 'transfer_rejected', label: 'Quando uma transferência for rejeitada' },
    { value: 'session_upcoming', label: 'Quando uma sessão estiver próxima (24h antes)' },
    { value: 'session_completed', label: 'Quando uma sessão for concluída' },
    { value: 'session_cancelled', label: 'Quando uma sessão for cancelada' },
    { value: 'anamnesis_completed', label: 'Quando uma anamnese for preenchida' },
    { value: 'patient_registered', label: 'Quando um novo paciente for cadastrado' },
    { value: 'professional_inactive', label: 'Quando um profissional ficar inativo por 7 dias' }
  ];

  const recipients = [
    { value: 'all', label: 'Todos os usuários' },
    { value: 'admin', label: 'Apenas administradores' },
    { value: 'professional', label: 'Apenas profissionais' },
    { value: 'origin_professional', label: 'Profissional de origem (em transferências)' },
    { value: 'destination_professional', label: 'Profissional de destino (em transferências)' }
  ];

  const importanceLevels = [
    { value: 'low', label: 'Baixa' },
    { value: 'medium', label: 'Média' },
    { value: 'high', label: 'Alta' },
    { value: 'urgent', label: 'Urgente' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.ruleName || !formData.messageTitle || !formData.messageContent) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Converte o formulário simples para o formato técnico do backend
      await createCustomTrigger({
        name: formData.ruleName,
        description: `Notificação customizada: ${formData.ruleName}`,
        type: 'custom',
        category: formData.situation.includes('transfer') ? 'transfer' : 
                  formData.situation.includes('session') ? 'session' : 'system',
        event_type: formData.situation,
        notification_template: {
          type: 'info',
          priority: formData.importance as 'low' | 'medium' | 'high' | 'urgent',
          title: formData.messageTitle,
          message: formData.messageContent,
          action_url: ''
        },
        target_user_type: formData.whoReceives as any,
        enabled: true
      });

      toast({
        title: "Regra criada com sucesso!",
        description: "A regra de notificação foi criada e está ativa.",
      });

      onSuccess();
      onOpenChange(false);
      
      // Limpa o formulário
      setFormData({
        ruleName: '',
        situation: 'transfer_requested',
        whoReceives: 'all',
        messageTitle: '',
        messageContent: '',
        importance: 'medium'
      });
    } catch (error: any) {
      toast({
        title: "Erro ao criar regra",
        description: error.response?.data?.message || "Ocorreu um erro ao criar a regra.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Nova Regra de Notificação</DialogTitle>
          <DialogDescription>
            Configure quando e para quem as notificações devem ser enviadas.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nome da Regra */}
          <div className="space-y-2">
            <Label htmlFor="ruleName">
              Nome da Regra <span className="text-red-500">*</span>
            </Label>
            <Input
              id="ruleName"
              placeholder="Ex: Notificar transferências urgentes"
              value={formData.ruleName}
              onChange={(e) => setFormData({ ...formData, ruleName: e.target.value })}
              required
            />
            <p className="text-sm text-gray-500">
              Escolha um nome para identificar esta regra facilmente
            </p>
          </div>

          {/* Quando Enviar */}
          <div className="space-y-2">
            <Label htmlFor="situation">
              Quando enviar a notificação? <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.situation}
              onValueChange={(value) => setFormData({ ...formData, situation: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {situations.map((situation) => (
                  <SelectItem key={situation.value} value={situation.value}>
                    {situation.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Quem Recebe */}
          <div className="space-y-2">
            <Label htmlFor="whoReceives">
              Quem deve receber a notificação? <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.whoReceives}
              onValueChange={(value) => setFormData({ ...formData, whoReceives: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {recipients.map((recipient) => (
                  <SelectItem key={recipient.value} value={recipient.value}>
                    {recipient.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Título da Mensagem */}
          <div className="space-y-2">
            <Label htmlFor="messageTitle">
              Título da Notificação <span className="text-red-500">*</span>
            </Label>
            <Input
              id="messageTitle"
              placeholder="Ex: Nova transferência solicitada"
              value={formData.messageTitle}
              onChange={(e) => setFormData({ ...formData, messageTitle: e.target.value })}
              required
            />
          </div>

          {/* Conteúdo da Mensagem */}
          <div className="space-y-2">
            <Label htmlFor="messageContent">
              Mensagem <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="messageContent"
              placeholder="Ex: Uma nova transferência de paciente foi solicitada e aguarda sua aprovação."
              value={formData.messageContent}
              onChange={(e) => setFormData({ ...formData, messageContent: e.target.value })}
              rows={4}
              required
            />
            <p className="text-sm text-gray-500">
              Escreva a mensagem que será exibida na notificação
            </p>
          </div>

          {/* Nível de Importância */}
          <div className="space-y-2">
            <Label htmlFor="importance">Nível de Importância</Label>
            <Select
              value={formData.importance}
              onValueChange={(value) => setFormData({ ...formData, importance: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {importanceLevels.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500">
              Notificações mais importantes aparecem em destaque
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                "Criar Regra"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
