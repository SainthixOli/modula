import { useState } from "react";
import { Sidebar } from "@/components/shared/Sidebar";
import { Header } from "@/components/shared/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Plus, Edit, Trash2, Clock } from "lucide-react";
import { format } from "date-fns";
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
import { useToast } from "@/hooks/use-toast";
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
import { CalendarIcon } from "lucide-react";

interface Appointment {
  id: string;
  time: string;
  patient: string;
  patientId: string;
  type: string;
  duration: string;
  notes?: string;
  date: Date;
}

export default function CalendarPage() {
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  const [appointments, setAppointments] = useState<Appointment[]>([
    { id: "1", time: "09:00", patient: "Stacy Mitchell", patientId: "1", type: "Consulta", duration: "50", date: new Date(), notes: "" },
    { id: "2", time: "10:00", patient: "Amy Dunham", patientId: "2", type: "Retorno", duration: "50", date: new Date(), notes: "" },
    { id: "3", time: "11:00", patient: "Demi Joan", patientId: "3", type: "Avaliação", duration: "50", date: new Date(), notes: "" },
    { id: "4", time: "14:00", patient: "Susan Myers", patientId: "4", type: "Consulta", duration: "50", date: new Date(), notes: "" },
    { id: "5", time: "15:00", patient: "Denzel White", patientId: "5", type: "Consulta", duration: "50", date: new Date(), notes: "" },
  ]);

  const [formData, setFormData] = useState({
    date: new Date(),
    time: "",
    patientId: "",
    type: "",
    duration: "50",
    notes: "",
  });

  // Mock patients
  const patients = [
    { id: "1", name: "Stacy Mitchell" },
    { id: "2", name: "Amy Dunham" },
    { id: "3", name: "Demi Joan" },
    { id: "4", name: "Susan Myers" },
    { id: "5", name: "Denzel White" },
  ];

  const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8h - 19h

  const handleCreateAppointment = () => {
    if (!formData.date || !formData.time || !formData.patientId || !formData.type) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    const patient = patients.find(p => p.id === formData.patientId);
    if (!patient) return;

    const newAppointment: Appointment = {
      id: Date.now().toString(),
      time: formData.time,
      patient: patient.name,
      patientId: formData.patientId,
      type: formData.type,
      duration: formData.duration,
      date: formData.date,
      notes: formData.notes,
    };

    setAppointments([...appointments, newAppointment]);
    setIsDialogOpen(false);
    resetForm();
    toast({
      title: "Sucesso",
      description: "Agendamento criado com sucesso",
    });
  };

  const handleEditAppointment = () => {
    if (!editingAppointment) return;

    const patient = patients.find(p => p.id === formData.patientId);
    if (!patient) return;

    setAppointments(
      appointments.map((a) =>
        a.id === editingAppointment.id
          ? {
              ...editingAppointment,
              time: formData.time,
              patient: patient.name,
              patientId: formData.patientId,
              type: formData.type,
              duration: formData.duration,
              date: formData.date,
              notes: formData.notes,
            }
          : a
      )
    );
    setIsDialogOpen(false);
    setEditingAppointment(null);
    resetForm();
    toast({
      title: "Sucesso",
      description: "Agendamento atualizado com sucesso",
    });
  };

  const handleDeleteAppointment = (id: string) => {
    setAppointments(appointments.filter((a) => a.id !== id));
    toast({
      title: "Sucesso",
      description: "Agendamento excluído com sucesso",
    });
  };

  const openEditDialog = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setFormData({
      date: appointment.date,
      time: appointment.time,
      patientId: appointment.patientId,
      type: appointment.type,
      duration: appointment.duration,
      notes: appointment.notes || "",
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      date: new Date(),
      time: "",
      patientId: "",
      type: "",
      duration: "50",
      notes: "",
    });
    setEditingAppointment(null);
  };

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
                {date && format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <ChevronRight className="h-4 w-4" />
              </Button>
              
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetForm}>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Agendamento
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingAppointment ? "Editar Agendamento" : "Novo Agendamento"}
                    </DialogTitle>
                    <DialogDescription>
                      Preencha os dados do agendamento
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
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
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={formData.date}
                            onSelect={(date) => date && setFormData({ ...formData, date })}
                            initialFocus
                            className={cn("p-3 pointer-events-auto")}
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
                          onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
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
                              {patient.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

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
                    <Button onClick={editingAppointment ? handleEditAppointment : handleCreateAppointment}>
                      {editingAppointment ? "Salvar Alterações" : "Criar Agendamento"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Mini Calendar */}
            <Card>
              <CardContent className="p-4">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md"
                />
                
                <div className="mt-4 space-y-2">
                  <h3 className="font-semibold text-sm">Legenda</h3>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span>Consulta</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span>Retorno</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    <span>Avaliação</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Schedule */}
            <Card className="lg:col-span-3">
              <CardContent className="p-6">
                <div className="space-y-1">
                  {hours.map((hour) => {
                    const hourStr = `${hour.toString().padStart(2, "0")}:00`;
                    const appointment = appointments.find((apt) => apt.time === hourStr);

                    return (
                      <div
                        key={hour}
                        className="flex items-start gap-4 py-3 border-b last:border-0"
                      >
                        <div className="w-16 text-sm text-muted-foreground font-medium">
                          {hourStr}
                        </div>
                        {appointment ? (
                          <div className="flex-1 p-3 rounded-lg bg-primary/5 border border-primary/20 hover:bg-primary/10 transition-colors">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold">{appointment.patient}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {appointment.time} - {appointment.duration}min
                                </p>
                                {appointment.notes && (
                                  <p className="text-xs text-muted-foreground mt-1">{appointment.notes}</p>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary">{appointment.type}</Badge>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditDialog(appointment)}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteAppointment(appointment.id)}
                                >
                                  <Trash2 className="h-3 w-3 text-destructive" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex-1 p-3 rounded-lg border-2 border-dashed hover:bg-muted/50 cursor-pointer transition-colors">
                            <p className="text-sm text-muted-foreground text-center">
                              Horário disponível
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
