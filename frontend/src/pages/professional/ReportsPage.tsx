import { Sidebar } from "@/components/shared/Sidebar";
import { Header } from "@/components/shared/Header";
import { StatsCard } from "@/components/shared/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Calendar, TrendingUp, Activity, Download, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ReportsPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userType="professional" />

      <div className="flex-1 flex flex-col">
        <Header userName="Dr. Oliver" />

        <main className="flex-1 p-6 overflow-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Relatórios</h1>
              <p className="text-muted-foreground">Análises e estatísticas</p>
            </div>
            <div className="flex gap-2">
              <Select defaultValue="month">
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Última semana</SelectItem>
                  <SelectItem value="month">Último mês</SelectItem>
                  <SelectItem value="quarter">Último trimestre</SelectItem>
                  <SelectItem value="year">Último ano</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatsCard
              title="Total de Pacientes"
              value={104}
              trend={{ value: 12, isPositive: true }}
              icon={Users}
            />
            <StatsCard
              title="Consultas no Mês"
              value={87}
              trend={{ value: 8, isPositive: true }}
              icon={Calendar}
            />
            <StatsCard
              title="Taxa de Comparecimento"
              value="94%"
              trend={{ value: 2, isPositive: true }}
              icon={TrendingUp}
            />
            <StatsCard
              title="Novos Pacientes"
              value={12}
              trend={{ value: 20, isPositive: true }}
              icon={Activity}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Consultas por Mês */}
            <Card>
              <CardHeader>
                <CardTitle>Consultas por Mês</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Activity className="h-12 w-12 mx-auto mb-4" />
                    <p>Gráfico de consultas por mês</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Distribuição de Pacientes */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Pacientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">Ativos</span>
                      <span className="text-sm font-medium">89 (85%)</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: "85%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">Inativos</span>
                      <span className="text-sm font-medium">15 (15%)</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-amber-500 h-2 rounded-full" style={{ width: "15%" }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Faixa Etária */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Faixa Etária</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">18-25 anos</span>
                    <span className="text-sm font-medium">23 pacientes</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">26-35 anos</span>
                    <span className="text-sm font-medium">45 pacientes</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">36-50 anos</span>
                    <span className="text-sm font-medium">28 pacientes</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">51+ anos</span>
                    <span className="text-sm font-medium">8 pacientes</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Gênero */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Gênero</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center">
                  <div className="space-y-4 w-full">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">Feminino</span>
                        <span className="text-sm font-medium">62 (60%)</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-pink-500 h-2 rounded-full" style={{ width: "60%" }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">Masculino</span>
                        <span className="text-sm font-medium">40 (38%)</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: "38%" }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">Outro</span>
                        <span className="text-sm font-medium">2 (2%)</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: "2%" }}></div>
                      </div>
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
