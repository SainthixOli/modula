import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Sidebar } from "@/components/shared/Sidebar";
import { Header } from "@/components/shared/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Plus, Edit, Trash2, CalendarIcon } from "lucide-react";
import { format, startOfMonth, endOfMonth, isSameDay, set, isBefore, startOfToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  getSessions, 
  getMyPatients, 
  createSession, 
  updateSession, 
  deleteSession, 
  Session, 
  Patient,
  SessionPayload 
} from "@/services/professional.service";

type SessionStatus = 'scheduled' | 'completed' | 'cancelled' | 'no_show';

const initialFormData = {
  date: new Date(),
  time: "",
  patientId: "",
  type: "Consulta", 
  status: "scheduled" as SessionStatus, 
  duration: 50,
  notes: "",
};

export default function CalendarPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [date, setDate] = useState<Date>(new Date());
  const [sessions, setSessions] = useState<Session[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [formData, setFormData] = useState(initialFormData);

  const loadData = async (currentDate: Date) => {
    setIsLoading(true);
    try {
      const firstDay = startOfMonth(currentDate);
      const lastDay = endOfMonth(currentDate);
      const [sessionData, patientData] = await Promise.all([
        getSessions(firstDay, lastDay),
        getMyPatients(),
      ]);
      
      console.log('📅 Sessões carregadas:', sessionData);
      console.log('📆 Período:', { firstDay, lastDay });
      console.log('📍 Data selecionada:', currentDate);
      
      setSessions(sessionData || []);
      setPatients(patientData || []);
    } catch (error) {
      toast.error("Falha ao carregar dados da agenda.");
      console.error("Falha ao carregar dados:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData(date);
  }, [date]);

  useEffect(() => {
    const patientIdFromUrl = searchParams.get('patientId');
    if (patientIdFromUrl && patients.length > 0) {
      openDialog(undefined, patientIdFromUrl);
      setSearchParams({});
    }
  }, [patients, searchParams, setSearchParams]);

const handleSubmit = async () => {
    if (!formData.date || !formData.time || !formData.patientId || !formData.type) {
      toast.error("Data, Horário, Paciente e Tipo são obrigatórios.");
      return;
    }

    // Validar formato do horário (HH:MM em 24h)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(formData.time)) {
      toast.error("Formato de horário inválido. Use formato 24h (ex: 14:30)");
      return;
    }

    const [hour, minute] = formData.time.split(':').map(Number);
    
    // Validar hora e minuto
    if (isNaN(hour) || isNaN(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
      toast.error("Horário inválido. Use formato 24h (ex: 14:30). Hora: 00-23, Minutos: 00-59");
      return;
    }

    // Criar datetime combinando data e hora
    const sessionDateTime = set(formData.date, { 
      hours: hour, 
      minutes: minute,
      seconds: 0,
      milliseconds: 0
    });

    console.log('📝 Dados do formulário:', {
      date: formData.date,
      time: formData.time,
      sessionDateTime: sessionDateTime.toISOString(),
      hour,
      minute
    });

    // Validar se não está no passado (apenas para novas sessões)
    if (!editingSession && isBefore(sessionDateTime, new Date())) {
        toast.error("Data e horário da sessão não podem ser no passado.");
        return;
    }

      const sessionTypeMap = {
        "Consulta": "first_consultation", 
        "Avaliação": "evaluation",
        "Sessão de Terapia": "therapy_session",
        "Retorno": "follow_up", 
        "Reavaliação": "reassessment",
        "Emergência": "emergency",
        "Terapia em Grupo": "group_session", 
        "Terapia Familiar": "family_session", 
        "Alta": "discharge"
};

    const apiSessionType = sessionTypeMap[formData.type]; 

    if (!apiSessionType) {
      toast.error(`Tipo de sessão inválido no frontend: ${formData.type}`);
      return;
    }

    try {
      if (editingSession) {
        const updatePayload = {
          session_date: sessionDateTime.toISOString(),
          session_time: formData.time,
          session_type: apiSessionType,           
          duration_minutes: Number(formData.duration), 
          notes: formData.notes || '',
          status: formData.status                  
        };

        console.log('📤 Enviando payload para atualizar sessão:', updatePayload);

        await updateSession(editingSession.id, updatePayload);
        toast.success("Agendamento atualizado com sucesso!");

      } else {
        // PAYLOAD PARA CRIAR
        const createPayload = {
          patient_id: formData.patientId,
          session_date: sessionDateTime.toISOString(),
          session_time: formData.time,
          session_type: apiSessionType,           
          duration_minutes: Number(formData.duration), 
          notes: formData.notes || ''
        };
        
        console.log('📤 Enviando payload para criar sessão:', createPayload);
        console.log('🕐 Horário formatado:', formData.time, '(deve estar em formato 24h: HH:MM)');
        
        const createdSession = await createSession(createPayload);
        console.log('✅ Sessão criada com sucesso:', createdSession);
        toast.success("Agendamento criado com sucesso!");
      }

      setIsDialogOpen(false);
      
      // Recarregar dados após criar/atualizar
      console.log('🔄 Recarregando dados da agenda...');
      await loadData(date);
      console.log('✅ Dados recarregados!');
    } catch (error: any) {
       console.error('❌ Erro ao criar/atualizar sessão:', error);
       const apiErrorMessage = error.response?.data?.message || error.response?.data?.errors?.[0]?.message || `Falha ao ${editingSession ? 'atualizar' : 'criar'} agendamento.`;
       toast.error(apiErrorMessage);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este agendamento?')) {
      return;
    }

    try {
      console.log('🗑️ Excluindo sessão:', id);
      await deleteSession(id);
      console.log('✅ Sessão excluída com sucesso');
      toast.success("Agendamento excluído com sucesso.");
      await loadData(date);
    } catch (error: any) {
      console.error('❌ Erro ao excluir sessão:', error);
      console.error('❌ Detalhes:', error.response?.data);
      toast.error(error.response?.data?.message || "Falha ao excluir agendamento.");
    }
  };

  const openDialog = (session?: Session, preselectedPatientId?: string) => {
    if (session) {
      setEditingSession(session);
      const patientData = session.Patient || session.patient;
      setFormData({
        date: new Date(session.session_date),
        time: format(new Date(session.session_date), "HH:mm"),
        patientId: patientData.id,
        status: session.status,
        type: session.session_type || "Consulta", 
        duration: session.duration_minutes || session.duration || 50,
        notes: session.notes || "",
      });
    } else {
      setEditingSession(null);
      setFormData({
        ...initialFormData,
        date: date,
        patientId: preselectedPatientId || ""
      });
    }
    setIsDialogOpen(true);
  };

  const hours = Array.from({ length: 12 }, (_, i) => i + 8);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userType="professional" />
      <div className="flex-1 flex flex-col">
        <Header userName="Dr. Oliver" />
        <main className="flex-1 p-6 overflow-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Calendário</h1>
              <p className="text-muted-foreground">
                {format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={() => setDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => setDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => openDialog()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Agendamento
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingSession ? "Editar Agendamento" : "Novo Agendamento"}</DialogTitle>
                    <DialogDescription>
                      Preencha os dados do agendamento
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Data *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !formData.date && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.date ? format(formData.date, "PPP", { locale: ptBR }) : "Selecione a data"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={formData.date}
                            onSelect={(d) => d && setFormData({ ...formData, date: d })}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="time">Horário * (formato 24h: HH:MM)</Label>
                        <Input
                          id="time"
                          type="text"
                          value={formData.time}
                          onChange={(e) => {
                            let value = e.target.value.replace(/[^0-9:]/g, ''); // Remove caracteres inválidos
                            
                            // Auto-adicionar : após 2 dígitos
                            if (value.length === 2 && !value.includes(':')) {
                              value = value + ':';
                            }
                            
                            // Limitar a 5 caracteres (HH:MM)
                            if (value.length > 5) {
                              value = value.substring(0, 5);
                            }
                            
                            console.log('⏰ Horário digitado:', value);
                            setFormData({ ...formData, time: value });
                          }}
                          onBlur={(e) => {
                            // Validar ao sair do campo
                            const value = e.target.value;
                            if (value && !value.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
                              toast.error('Formato de horário inválido. Use HH:MM (ex: 14:30)');
                            }
                          }}
                          placeholder="14:30"
                          maxLength={5}
                        />
                        <p className="text-xs text-muted-foreground">
                          Digite no formato 24h. Ex: 08:00, 14:30, 18:45
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="duration">Duração (min) *</Label>
                        <Input
                          id="duration"
                          type="number"
                          value={formData.duration}
                          onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                          min="15"
                          max="180"
                          step="5"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="patient">Paciente *</Label>
                      <Select
                        value={formData.patientId}
                        onValueChange={(value) => setFormData({ ...formData, patientId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o paciente" />
                        </SelectTrigger>
                        <SelectContent>
                          {patients.map((patient) => (
                            <SelectItem key={patient.id} value={patient.id}>
                              {patient.full_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="type">Tipo de Consulta *</Label>
                        <Select
                          value={formData.type}
                          onValueChange={(value) => setFormData({ ...formData, type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Consulta">Consulta</SelectItem>
                            <SelectItem value="Retorno">Retorno</SelectItem>
                            <SelectItem value="Avaliação">Avaliação</SelectItem>
                            <SelectItem value="Sessão">Sessão</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="status">Status da Sessão *</Label>
                        <Select
                          value={formData.status}
                          onValueChange={(value) => setFormData({ ...formData, status: value as SessionStatus })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="scheduled">Agendada</SelectItem>
                            <SelectItem value="completed">Realizada</SelectItem>
                            <SelectItem value="cancelled">Cancelada</SelectItem>
                            <SelectItem value="no_show">Falta</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Observações</Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        rows={3}
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleSubmit}>
                      {editingSession ? "Salvar Alterações" : "Criar Agendamento"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-4">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(day) => day && setDate(day)}
                  onMonthChange={setDate}
                  locale={ptBR}
                  className="rounded-md"
                />
              </CardContent>
            </Card>

            <Card className="lg:col-span-3">
              <CardContent className="p-6">
                <div className="space-y-1">
                  {isLoading ? (
                    <p className="text-center text-muted-foreground py-4">Carregando agenda...</p>
                  ) : (
                    <>
                      {/* Mostrar todas as sessões do dia */}
                      {(() => {
                        const daySessionsFiltered = Array.isArray(sessions) ? sessions.filter((s) => {
                          try {
                            const sessionDate = new Date(s.session_date);
                            return isSameDay(sessionDate, date);
                          } catch (e) {
                            console.error('Erro ao processar data da sessão:', s, e);
                            return false;
                          }
                        }).sort((a, b) => {
                          // Ordenar por horário
                          return new Date(a.session_date).getTime() - new Date(b.session_date).getTime();
                        }) : [];

                        console.log('🔍 Sessões do dia selecionado:', date, daySessionsFiltered);

                        if (daySessionsFiltered.length === 0) {
                          return (
                            <p className="text-center text-muted-foreground py-8">
                              Nenhuma sessão agendada para {format(date, "dd/MM/yyyy")}
                            </p>
                          );
                        }

                        return daySessionsFiltered.map((session) => {
                          const patientData = session.Patient || session.patient;
                          const duration = session.duration_minutes || session.duration || 50;
                          
                          return (
                          <div
                            key={session.id}
                            className="flex items-start gap-4 py-3 border-b last:border-0"
                          >
                            <div className="w-16 text-sm text-muted-foreground font-medium">
                              {format(new Date(session.session_date), 'HH:mm')}
                            </div>
                            <div className="flex-1 p-3 rounded-lg bg-primary/5 border border-primary/20">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="font-semibold">{patientData.full_name}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {format(new Date(session.session_date), 'HH:mm')} - {duration}min
                                  </p>
                                  {session.notes && (
                                    <p className="text-xs text-muted-foreground mt-1">{session.notes}</p>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary" className="capitalize">
                                    {session.status === 'scheduled' ? 'Agendada' : 
                                     session.status === 'completed' ? 'Realizada' :
                                     session.status === 'cancelled' ? 'Cancelada' : 'Falta'}
                                  </Badge>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openDialog(session)}
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(session.id)}
                                  >
                                    <Trash2 className="h-3 w-3 text-destructive" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                        });
                      })()}
                      
                      {/* Botão para adicionar nova sessão */}
                      <div className="pt-4">
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => openDialog()}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Adicionar sessão neste dia
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}