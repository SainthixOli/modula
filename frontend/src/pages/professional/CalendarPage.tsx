import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Sidebar } from "@/components/shared/Sidebar";
import { Header } from "@/components/shared/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Plus, Edit, Trash2, CalendarIcon } from "lucide-react";
// <<< IMPORT CORRIGIDO AQUI >>>
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

// <<< CORREÇÃO AQUI: "type" foi adicionado ao formulário >>>
const initialFormData = {
  date: new Date(),
  time: "",
  patientId: "",
  type: "Consulta", // Campo para o TIPO (o que o backend espera)
  status: "scheduled" as SessionStatus, // Campo para o STATUS
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

    const [hour, minute] = formData.time.split(':').map(Number);
    // IMPORTANTE: Garanta que a data seja enviada em UTC (formato ISO)
    const sessionDateTime = set(formData.date, { hours: hour, minutes: minute }).toISOString();

    if (!editingSession && isBefore(new Date(sessionDateTime), startOfToday())) {
        toast.error("Data da sessão não pode ser no passado.");
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
          session_date: sessionDateTime,
          session_time: formData.time,
          session_type: apiSessionType,           // Correto
          duration_minutes: Number(formData.duration), // Correto
          notes: formData.notes,
          status: formData.status                  // Correto (status é permitido no update)
        };

        // @ts-ignore
        await updateSession(editingSession.id, updatePayload);
        toast.success("Agendamento atualizado com sucesso!");

      } else {
        // PAYLOAD PARA CRIAR
        const createPayload = {
          patient_id: formData.patientId,
          session_date: sessionDateTime,
          session_time: formData.time,
          session_type: apiSessionType,           // Correto
          duration_minutes: Number(formData.duration), // Correto
          notes: formData.notes
          // 'status' NÃO VAI AQUI
        };
        
        // @ts-ignore
        await createSession(createPayload);
        toast.success("Agendamento criado com sucesso!");
      }

      setIsDialogOpen(false);
      loadData(date);
    } catch (error: any) {
       const apiErrorMessage = error.response?.data?.message || `Falha ao ${editingSession ? 'atualizar' : 'criar'} agendamento.`;
       toast.error(apiErrorMessage);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSession(id);
      toast.success("Agendamento excluído com sucesso.");
      loadData(date);
    } catch (error) {
      toast.error("Falha ao excluir agendamento.");
    }
  };

  const openDialog = (session?: Session, preselectedPatientId?: string) => {
    if (session) {
      setEditingSession(session);
      setFormData({
        date: new Date(session.session_date),
        time: format(new Date(session.session_date), "HH:mm"),
        patientId: session.patient.id,
        status: session.status,
        // @ts-ignore
        type: session.session_type || "Consulta", // Adiciona o 'type'
        duration: session.duration,
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
                        <Label htmlFor="time">Horário *</Label>
                        <Input
                          id="time"
                          type="time"
                          value={formData.time}
                          onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="duration">Duração (min) *</Label>
                        <Input
                          id="duration"
                          type="number"
                          value={formData.duration}
                          onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
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
                    hours.map((hour) => {
                      const hourStr = `${hour.toString().padStart(2, "0")}:00`;
                      
                      const session = Array.isArray(sessions) ? sessions.find((s) => 
                        format(new Date(s.session_date), 'HH:mm') === hourStr && 
                        isSameDay(new Date(s.session_date), date)
                      ) : undefined;

                      return (
                        <div
                          key={hour}
                          className="flex items-start gap-4 py-3 border-b last:border-0"
                        >
                          <div className="w-16 text-sm text-muted-foreground font-medium">
                            {hourStr}
                          </div>
                          {session ? (
                            <div className="flex-1 p-3 rounded-lg bg-primary/5 border border-primary/20">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="font-semibold">{session.patient.full_name}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {format(new Date(session.session_date), 'HH:mm')} - {session.duration}min
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary" className="capitalize">{session.status}</Badge>
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
                          ) : (
                            <div className="flex-1 p-3 rounded-lg border-2 border-dashed hover:bg-muted/50 cursor-pointer" onClick={() => openDialog()}>
                              <p className="text-sm text-muted-foreground text-center">
                                Horário disponível
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })
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