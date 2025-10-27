import { useState, useEffect } from "react";
import { Sidebar } from "@/components/shared/Sidebar";
import { Header } from "@/components/shared/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Plus, Filter, MoreVertical, Mail, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  getProfessionalsList, 
  getAdminDashboardStats,
  Professional,
  DashboardStats 
} from "@/services/admin.service";

export default function ProfessionalsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [professionalsData, statsData] = await Promise.all([
          getProfessionalsList(),
          getAdminDashboardStats(),
        ]);
        
        setProfessionals(professionalsData);
        setStats(statsData);
      } catch (err) {
        console.error("Erro ao carregar dados da página:", err);
        setError("Falha ao carregar os dados. Tente novamente mais tarde.");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredProfessionals = professionals.filter((prof) =>
    (prof.full_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (prof.email?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (prof.specialty?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );
  
  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar userType="admin" />
        <div className="flex-1 flex flex-col">
          <Header userName="Administrador" />
          <main className="flex-1 p-6 flex items-center justify-center">
            <p>Carregando profissionais...</p>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar userType="admin" />
        <div className="flex-1 flex flex-col">
          <Header userName="Administrador" />
          <main className="flex-1 p-6 flex items-center justify-center">
            <p className="text-destructive">{error}</p>
          </main>
        </div>
      </div>
    );
  }
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userType="admin" />
      <div className="flex-1 flex flex-col">
        <Header userName="Administrador" onSearch={setSearchQuery} />
        <main className="flex-1 p-6 overflow-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Profissionais</h1>
              <p className="text-muted-foreground">Gerencie os profissionais da clínica</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
              <Button onClick={() => navigate("/admin/professionals/new")}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Profissional
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats?.professionals.total ?? 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Ativos</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats?.professionals.active ?? 0}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Inativos</p>
                <p className="text-2xl font-bold text-amber-600">
                  {stats?.professionals.inactive ?? 0}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Total Pacientes</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats?.patients.total ?? 0}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Lista de Profissionais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredProfessionals.length > 0 ? (
                  filteredProfessionals.map((prof) => (
                    <div
                      key={prof.id}
                      className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => navigate(`/admin/professionals/${prof.id}`)}
                    >
                      <Avatar className="h-16 w-16">
                        <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                          {prof.full_name?.split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-lg">{prof.full_name}</h4>
                          <Badge variant={prof.status === "active" ? "default" : "secondary"}>
                            {prof.status === "active" ? "Ativo" : "Inativo"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {prof.email}
                          </span>
                          {prof.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {prof.phone}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          {prof.specialty && <span>{prof.specialty}</span>}
                          
                          {prof.specialty && prof.professional_register && <span>•</span>}
                          
                          {prof.professional_register && <span>{prof.professional_register}</span>}
                          
                          {(prof.specialty || prof.professional_register) && <span>•</span>}
                          <span className="font-medium text-foreground">{prof.patient_count} pacientes</span>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/admin/professionals/${prof.id}`)}>
                            Ver Detalhes
                          </DropdownMenuItem>
                          <DropdownMenuItem>Editar</DropdownMenuItem>
                          <DropdownMenuItem>Resetar Senha</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            {prof.status === "active" ? "Desativar" : "Ativar"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-4">Nenhum profissional encontrado.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )};