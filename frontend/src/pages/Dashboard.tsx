import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Bell,
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  Home,
  MessageCircle,
  Search,
  Settings,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { pt } from "date-fns/locale";
import logomodula from '../components/assets/logo.png'; 

const Dashboard = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const currentMonth = new Date().toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  const patients = [
    {
      initials: "SM",
      name: "Stacy Mitchell",
      type: "Visita Semanal",
      time: "9h15",
      color: "bg-pink-200",
    },
    {
      initials: "AD",
      name: "Amy Dunham",
      type: "Verificação de rotina",
      time: "9h30",
      color: "bg-purple-200",
    },
    {
      initials: "DJ",
      name: "Demi Joan",
      type: "Relatório",
      time: "9h50",
      color: "bg-gray-200",
    },
    {
      initials: "SM",
      name: "Susan Myers",
      type: "Visita Semanal",
      time: "10h15",
      color: "bg-pink-200",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-20 bg-card border-r border-border flex flex-col items-center py-6 space-y-8">
        {/* Logo */}
        <img 
               src={logomodula} 
                alt="Logo MÓDULA" 
               className="w-12 h-12"
/>

        {/* Menu Items */}
        <nav className="flex-1 flex flex-col items-center space-y-6">
          <Button
            variant="ghost"
            size="icon"
            className="w-12 h-12 rounded-xl bg-sidebar-accent text-sidebar-accent-foreground"
          >
            <Home className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="w-12 h-12 rounded-xl hover:bg-sidebar-accent"
          >
            <CalendarIcon className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="w-12 h-12 rounded-xl hover:bg-sidebar-accent"
          >
            <Users className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="w-12 h-12 rounded-xl hover:bg-sidebar-accent"
          >
            <FileText className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="w-12 h-12 rounded-xl hover:bg-sidebar-accent"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="ml-20">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar"
                  className="pl-10 bg-muted/30 border-0"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="rounded-full">
                <MessageCircle className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Bell className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2">
                <Avatar>
                  <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver" />
                  <AvatarFallback>DO</AvatarFallback>
                </Avatar>
                <span className="font-medium">Dr. Oliver</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">
              Bom dia <span className="text-primary">Dr. Oliver!</span>
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Stats & Patients */}
            <div className="lg:col-span-2 space-y-6">
              {/* Stats Card */}
              <Card className="relative overflow-hidden bg-gradient-card border-0 p-8 text-white">
                <div className="relative z-10">
                  <p className="text-white/90 mb-2">Visitas para hoje</p>
                  <h2 className="text-6xl font-bold mb-8">104</h2>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                      <p className="text-sm text-white/90 mb-1">Novos</p>
                      <p className="text-sm text-white/80 mb-2">Pacientes</p>
                      <div className="flex items-center justify-between">
                        <span className="text-3xl font-bold">40</span>
                        <div className="flex items-center gap-1 text-green-300 text-sm bg-green-400/20 px-2 py-1 rounded-full">
                          <TrendingUp className="h-3 w-3" />
                          51%
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                      <p className="text-sm text-white/90 mb-1">Antigos</p>
                      <p className="text-sm text-white/80 mb-2">Pacientes</p>
                      <div className="flex items-center justify-between">
                        <span className="text-3xl font-bold">64</span>
                        <div className="flex items-center gap-1 text-red-300 text-sm bg-red-400/20 px-2 py-1 rounded-full">
                          <TrendingDown className="h-3 w-3" />
                          20%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Profile Picture */}
                
              </Card>

              {/* Patients List */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold">Lista de Pacientes</h3>
                  <Button variant="ghost" size="sm" className="gap-2">
                    Hoje
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  {patients.map((patient, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <Avatar className={`${patient.color} text-foreground`}>
                        <AvatarFallback>{patient.initials}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{patient.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {patient.type}
                        </p>
                      </div>
                      <span className="text-sm font-medium px-3 py-1 bg-primary/10 text-primary rounded-full">
                        {patient.time}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Right Column - Calendar & Events */}
            <div className="space-y-6">
              {/* Calendar Card */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Calendário</h3>
                  <ChevronDown className="h-4 w-4" />
                </div>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm capitalize">{currentMonth}</span>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  locale={pt}
                  className="rounded-md"
                />
              </Card>

              {/* Upcoming Events */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Chegando</h3>
                  <Button variant="link" className="text-primary text-sm p-0">
                    View All
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="flex gap-3">
                    <Avatar className="bg-primary/10">
                      <AvatarFallback className="text-primary text-xs">
                        M
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">
                        Encontro mensal de médicos
                      </p>
                      <p className="text-xs text-muted-foreground">
                        8 de outubro de 2025 | 16h00
                      </p>
                    </div>
                  </div>

                  <div className="relative bg-muted/30 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex -space-x-2">
                        {[1, 2, 3, 4].map((i) => (
                          <Avatar key={i} className="border-2 border-background w-6 h-6">
                            <AvatarImage
                              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`}
                            />
                            <AvatarFallback>U{i}</AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                      <span className="text-xs font-medium">Médicos 🎭</span>
                      <span className="ml-auto bg-accent text-accent-foreground text-xs px-2 py-0.5 rounded-full">
                        48
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      last seen 45 minutes ago
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
