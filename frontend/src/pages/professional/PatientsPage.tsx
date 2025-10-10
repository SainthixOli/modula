import { useState } from "react";
import { Sidebar } from "@/components/shared/Sidebar";
import { Header } from "@/components/shared/Header";
import { PatientCard } from "@/components/shared/PatientCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function PatientsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data - substituir por chamada à API
  const patients = [
    { id: "1", name: "Stacy Mitchell", age: 28, gender: "female", status: "active" as const },
    { id: "2", name: "Amy Dunham", age: 35, gender: "female", status: "active" as const },
    { id: "3", name: "Demi Joan", age: 42, gender: "male", status: "active" as const },
    { id: "4", name: "Susan Myers", age: 31, gender: "female", status: "active" as const },
    { id: "5", name: "Denzel White", age: 28, gender: "male", status: "active" as const },
    { id: "6", name: "John Doe", age: 45, gender: "male", status: "inactive" as const },
  ];

  const filteredPatients = patients.filter((patient) =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activePatients = filteredPatients.filter((p) => p.status === "active");
  const inactivePatients = filteredPatients.filter((p) => p.status === "inactive");

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
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
              <Button onClick={() => navigate("/professional/patients/new")}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Paciente
              </Button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{patients.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Ativos</p>
                <p className="text-2xl font-bold text-green-600">{activePatients.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Inativos</p>
                <p className="text-2xl font-bold text-amber-600">{inactivePatients.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Novos (mês)</p>
                <p className="text-2xl font-bold text-blue-600">12</p>
              </CardContent>
            </Card>
          </div>

          {/* Patients List */}
          <Card>
            <CardHeader>
              <CardTitle>Lista de Pacientes</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="all">Todos ({patients.length})</TabsTrigger>
                  <TabsTrigger value="active">Ativos ({activePatients.length})</TabsTrigger>
                  <TabsTrigger value="inactive">Inativos ({inactivePatients.length})</TabsTrigger>
                </TabsList>
                
                <TabsContent value="all" className="space-y-3">
                  {filteredPatients.map((patient) => (
                    <PatientCard key={patient.id} {...patient} />
                  ))}
                </TabsContent>
                
                <TabsContent value="active" className="space-y-3">
                  {activePatients.map((patient) => (
                    <PatientCard key={patient.id} {...patient} />
                  ))}
                </TabsContent>
                
                <TabsContent value="inactive" className="space-y-3">
                  {inactivePatients.map((patient) => (
                    <PatientCard key={patient.id} {...patient} />
                  ))}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
