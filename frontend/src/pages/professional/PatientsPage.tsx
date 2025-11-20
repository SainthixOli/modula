import { useState, useEffect } from "react";
import { Sidebar } from "@/components/shared/Sidebar";
import { Header } from "@/components/shared/Header";
import { PatientCard } from "@/components/shared/PatientCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Filter, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getMyPatients, Patient } from "@/services/professional.service";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function PatientsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  // Estados para dados
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para filtros
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [genderFilter, setGenderFilter] = useState<string>("all");
  const [hasActiveFilters, setHasActiveFilters] = useState(false);

  // 2. O "CÉREBRO": Busca os dados da API quando a página carrega
  useEffect(() => {
    const loadPatients = async () => {
      try {
        const data = await getMyPatients();
        setPatients(data);
      } catch (err) {
        console.error("Erro ao carregar pacientes:", err);
        setError("Não foi possível carregar a lista de pacientes.");
        toast.error("Não foi possível carregar a lista de pacientes.");
      } finally {
        setIsLoading(false);
      }
    };
    loadPatients();
  }, []); // O array vazio [] garante que isso rode só uma vez

  // Aplicar todos os filtros
  const filteredPatients = patients.filter((patient) => {
    // Filtro de busca
    const matchesSearch = patient.full_name.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filtro de status
    const matchesStatus = statusFilter === "all" || patient.status === statusFilter;
    
    // Filtro de gênero
    const matchesGender = genderFilter === "all" || patient.gender === genderFilter;
    
    return matchesSearch && matchesStatus && matchesGender;
  });

  const activePatients = filteredPatients.filter((p) => p.status === "active");
  const inactivePatients = filteredPatients.filter((p) => p.status === "inactive");

  // Funções do modal de filtros
  const handleApplyFilters = () => {
    setHasActiveFilters(statusFilter !== "all" || genderFilter !== "all");
    setFilterModalOpen(false);
  };

  const handleClearFilters = () => {
    setStatusFilter("all");
    setGenderFilter("all");
    setHasActiveFilters(false);
  };

  // 3. TELA DE CARREGAMENTO: Mostra enquanto os dados não chegam
  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar userType="professional" />
        <div className="flex-1 flex flex-col">
          <Header userName="Dr. Oliver" />
          <main className="flex-1 p-6 flex items-center justify-center">
            <p>Carregando pacientes...</p>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userType="professional" />

      <div className="flex-1 flex flex-col">
        <Header userName="Dr. Oliver" onSearch={setSearchQuery} />

        <main className="flex-1 p-6 overflow-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Pacientes</h1>
              <p className="text-muted-foreground">Gerencie seus pacientes</p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant={hasActiveFilters ? "default" : "outline"} 
                onClick={() => setFilterModalOpen(true)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtros
                {hasActiveFilters && (
                  <span className="ml-2 bg-background text-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
                    {(statusFilter !== "all" ? 1 : 0) + (genderFilter !== "all" ? 1 : 0)}
                  </span>
                )}
              </Button>
              <Button onClick={() => navigate("/professional/patients/new")}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Paciente
              </Button>
            </div>
          </div>

          {/* Os cards de estatísticas agora são dinâmicos */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Total</p><p className="text-2xl font-bold">{patients.length}</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Ativos</p><p className="text-2xl font-bold text-green-600">{activePatients.length}</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Inativos</p><p className="text-2xl font-bold text-amber-600">{inactivePatients.length}</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Novos (mês)</p><p className="text-2xl font-bold text-blue-600">0</p></CardContent></Card>
          </div>

          <Card>
            <CardHeader><CardTitle>Lista de Pacientes</CardTitle></CardHeader>
            <CardContent>
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="all">Todos ({patients.length})</TabsTrigger>
                  <TabsTrigger value="active">Ativos ({activePatients.length})</TabsTrigger>
                  <TabsTrigger value="inactive">Inativos ({inactivePatients.length})</TabsTrigger>
                </TabsList>
                
                {/* As listas agora usam os dados da API */}
                <TabsContent value="all" className="space-y-3">
                  {filteredPatients.map((patient) => (
                    <PatientCard key={patient.id} name={patient.full_name} {...patient} />
                  ))}
                </TabsContent>
                
                <TabsContent value="active" className="space-y-3">
                  {activePatients.map((patient) => (
                    <PatientCard key={patient.id} name={patient.full_name} {...patient} />
                  ))}
                </TabsContent>
                
                <TabsContent value="inactive" className="space-y-3">
                  {inactivePatients.map((patient) => (
                    <PatientCard key={patient.id} name={patient.full_name} {...patient} />
                  ))}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </main>
      </div>

      {/* Modal de Filtros */}
      <Dialog open={filterModalOpen} onOpenChange={setFilterModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Filtros de Pacientes</DialogTitle>
            <DialogDescription>
              Refine a lista de pacientes aplicando filtros personalizados
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            {/* Filtro de Status */}
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="inactive">Inativos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filtro de Gênero */}
            <div className="grid gap-2">
              <Label htmlFor="gender">Gênero</Label>
              <Select value={genderFilter} onValueChange={setGenderFilter}>
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Selecione o gênero" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="male">Masculino</SelectItem>
                  <SelectItem value="female">Feminino</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="flex justify-between sm:justify-between">
            <Button variant="outline" onClick={handleClearFilters}>
              <X className="h-4 w-4 mr-2" />
              Limpar Filtros
            </Button>
            <Button onClick={handleApplyFilters}>
              Aplicar Filtros
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}