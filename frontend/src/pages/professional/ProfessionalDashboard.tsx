import { useState, useEffect } from "react";
import { Sidebar } from "@/components/shared/Sidebar";
import { Header } from "@/components/shared/Header";
import { StatsCard } from "@/components/shared/StatsCard";
import { PatientCard } from "@/components/shared/PatientCard";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, TrendingUp, Activity, Calendar as CalendarIcon, ChevronDown, MoreVertical } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ProfessionalDashboard() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedFilter, setSelectedFilter] = useState("Hoje");
  
  // Mock data - substituir por chamadas reais à API
  const stats = {
    visitsToday: 104,
    newPatients: { value: 40, trend: 51 },
    oldPatients: { value: 64, trend: -20 },
    totalPatients: 104,
  };

  const todayPatients = [
    { id: "1", name: "Stacy Mitchell", schedule: "Visita Semanal", time: "9h15" },
    { id: "2", name: "Amy Dunham", schedule: "Verificação de rotina", time: "9h30" },
    { id: "3", name: "Demi Joan", schedule: "Relatório", time: "9h50" },
    { id: "4", name: "Susan Myers", schedule: "Visita Semanal", time: "10h15" },
  ];

  const upcomingEvents = [
    { title: "Encontro mensal de médicos", date: "8 de outubro de 2025 | 16h00" },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userType="professional" />
      
      <div className="flex-1 flex flex-col">
        <Header userName="Dr. Oliver" userRole="Psicólogo - CRP 12345" />
        
        <main className="flex-1 p-6 overflow-auto">
          {/* Greeting */}
          <h1 className="text-3xl font-bold mb-6">
            Bom dia <span className="text-primary">Dr. Oliver!</span>
          </h1>

          {/* Main Stats Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <Card className="lg:col-span-2 bg-gradient-to-br from-primary via-secondary to-accent text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-white/80 text-sm mb-2">Visitas para hoje</p>
                    <h2 className="text-5xl font-bold mb-6">{stats.visitsToday}</h2>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                        <p className="text-white/80 text-sm mb-1">Novos Pacientes</p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold">{stats.newPatients.value}</span>
                          <Badge className="bg-green-500/20 text-green-300 border-0">
                            +{stats.newPatients.trend}%
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                        <p className="text-white/80 text-sm mb-1">Antigos Pacientes</p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold">{stats.oldPatients.value}</span>
                          <Badge className="bg-red-500/20 text-red-300 border-0">
                            {stats.oldPatients.trend}%
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Avatar className="h-24 w-24 border-4 border-white/20">
                    <AvatarFallback className="bg-white/10 text-white text-2xl">
                      DO
                    </AvatarFallback>
                  </Avatar>
                </div>
              </CardContent>
            </Card>

            {/* Calendar Card */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Calendário</CardTitle>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">Setembro 2025</p>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md"
                />
                
                <div className="mt-4">
                  <h4 className="font-semibold mb-2 text-sm">Chegando</h4>
                  {upcomingEvents.map((event, index) => (
                    <div key={index} className="flex gap-3 p-3 rounded-lg bg-primary/5">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-medium text-primary">M</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{event.title}</p>
                        <p className="text-xs text-muted-foreground">{event.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Patients List and Consultation Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Today's Patients */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Lista de Pacientes</CardTitle>
                  <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Hoje">Hoje</SelectItem>
                      <SelectItem value="Semana">Semana</SelectItem>
                      <SelectItem value="Mês">Mês</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {todayPatients.map((patient) => (
                  <PatientCard key={patient.id} {...patient} />
                ))}
              </CardContent>
            </Card>

            {/* Consultation Details */}
            <Card>
              <CardHeader>
                <CardTitle>Consulta</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Patient Header */}
                  <div className="flex items-center gap-3 pb-4 border-b">
                    <Avatar className="h-16 w-16 bg-blue-100">
                      <AvatarFallback className="bg-blue-100 text-blue-600 text-lg">DW</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">Denzel White</h3>
                      <p className="text-sm text-muted-foreground">Masculino - 28 anos e 3 meses</p>
                    </div>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Health Indicators */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-3 rounded-lg bg-muted/50">
                      <Activity className="h-8 w-8 mx-auto mb-1 text-red-500" />
                      <p className="text-xs text-muted-foreground">Febre</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted/50">
                      <Activity className="h-8 w-8 mx-auto mb-1 text-blue-500" />
                      <p className="text-xs text-muted-foreground">Tosse</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted/50">
                      <Activity className="h-8 w-8 mx-auto mb-1 text-purple-500" />
                      <p className="text-xs text-muted-foreground">Azia</p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-3 pt-2">
                    <div>
                      <h4 className="text-sm font-semibold mb-1">Última verificação</h4>
                      <p className="text-sm text-muted-foreground">
                        Dr. Everly em 21 de junho de 2025, receita{" "}
                        <span className="text-primary">#2J983K10</span>
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold mb-1">Observação</h4>
                      <p className="text-sm text-muted-foreground">
                        Febre alta e tosse com níveis normais de hemoglobina.
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold mb-1">Prescrição</h4>
                      <p className="text-sm text-muted-foreground">
                        Paracetamol - 2 vezes ao dia<br />
                        Dizopam - Dia e Noite antes das refeições<br />
                        Wikoryl
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
