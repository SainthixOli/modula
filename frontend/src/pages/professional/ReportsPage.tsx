import { Sidebar } from "@/components/shared/Sidebar";
import { Header } from "@/components/shared/Header";
import { StatsCard } from "@/components/shared/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Calendar, TrendingUp, Activity, Download, Filter, X } from "lucide-react";
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
import { useState, useEffect } from "react";
import { reportsService, ReportData, ActivityData, MonthlySessionData } from "@/services/reports.service";
import { useToast } from "@/hooks/use-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function ReportsPage() {
  const [period, setPeriod] = useState('month');
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [activityData, setActivityData] = useState<ActivityData | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlySessionData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Estado para modal de filtros
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [tempPeriod, setTempPeriod] = useState('month');

  useEffect(() => {
    fetchReports();
  }, [period]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const [summary, activity, monthly] = await Promise.all([
        reportsService.getPatientSummary(period),
        reportsService.getActivityReport(period),
        reportsService.getMonthlySessions(6)
      ]);
      setReportData(summary);
      setActivityData(activity);
      setMonthlyData(monthly);
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os relatórios",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      toast({
        title: "Exportando",
        description: "Gerando relatório PDF...",
      });

      const blob = await reportsService.exportReport(period, 'pdf');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio-${period}-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Sucesso",
        description: "Relatório exportado com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao exportar:', error);
      toast({
        title: "Erro",
        description: "Não foi possível exportar o relatório",
        variant: "destructive"
      });
    }
  };

  const getGenderLabel = (key: string): string => {
    const labels: Record<string, string> = {
      'male': 'Masculino',
      'female': 'Feminino',
      'other': 'Outro',
      'não_informado': 'Não informado'
    };
    return labels[key] || key;
  };

  const calculatePercentage = (value: number, total: number): number => {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  };

  const handleApplyFilters = () => {
    setPeriod(tempPeriod);
    setFilterModalOpen(false);
  };

  const handleClearFilters = () => {
    setTempPeriod('month');
    setPeriod('month');
  };

  const getPeriodLabel = (period: string): string => {
    const labels: Record<string, string> = {
      'week': 'Última semana',
      'month': 'Último mês',
      'quarter': 'Último trimestre',
      'year': 'Último ano'
    };
    return labels[period] || period;
  };
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
              <Button 
                variant="outline" 
                onClick={() => {
                  setTempPeriod(period);
                  setFilterModalOpen(true);
                }}
              >
                <Filter className="h-4 w-4 mr-2" />
                {getPeriodLabel(period)}
              </Button>
              <Button variant="outline" onClick={fetchReports} disabled={loading}>
                <Calendar className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
              <Button onClick={handleExport} disabled={loading}>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>

          {/* Stats Overview */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {[1, 2, 3, 4].map(i => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="animate-pulse space-y-3">
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                      <div className="h-8 bg-muted rounded w-1/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : reportData && activityData ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <StatsCard
                title="Total de Pacientes"
                value={reportData.summary.totalPatients}
                trend={activityData.trends.patients}
                icon={Users}
              />
              <StatsCard
                title="Consultas no Período"
                value={reportData.summary.completedSessions}
                trend={activityData.trends.sessions}
                icon={Calendar}
              />
              <StatsCard
                title="Taxa de Comparecimento"
                value={reportData.summary.attendanceRate}
                trend={{ value: 0, isPositive: true }}
                icon={TrendingUp}
              />
              <StatsCard
                title="Novos Pacientes"
                value={reportData.summary.newPatients}
                trend={{ value: activityData.trends.patients.value, isPositive: activityData.trends.patients.isPositive }}
                icon={Activity}
              />
            </div>
          ) : null}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Consultas por Mês */}
            <Card>
              <CardHeader>
                <CardTitle>Consultas por Mês</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="h-64 flex items-center justify-center">
                    <div className="animate-pulse">
                      <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    </div>
                  </div>
                ) : monthlyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="completed" name="Concluídas" fill="#10b981" />
                      <Bar dataKey="cancelled" name="Canceladas" fill="#f59e0b" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <Activity className="h-12 w-12 mx-auto mb-4" />
                      <p>Nenhum dado disponível</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Distribuição de Pacientes */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Pacientes</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="animate-pulse space-y-4">
                    {[1, 2].map(i => (
                      <div key={i}>
                        <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                        <div className="h-2 bg-muted rounded w-full"></div>
                      </div>
                    ))}
                  </div>
                ) : reportData ? (
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">Sessões Concluídas</span>
                        <span className="text-sm font-medium">
                          {reportData.summary.completedSessions} ({calculatePercentage(
                            reportData.summary.completedSessions,
                            reportData.summary.completedSessions + reportData.summary.cancelledSessions
                          )}%)
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ 
                            width: `${calculatePercentage(
                              reportData.summary.completedSessions,
                              reportData.summary.completedSessions + reportData.summary.cancelledSessions
                            )}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">Sessões Canceladas</span>
                        <span className="text-sm font-medium">
                          {reportData.summary.cancelledSessions} ({calculatePercentage(
                            reportData.summary.cancelledSessions,
                            reportData.summary.completedSessions + reportData.summary.cancelledSessions
                          )}%)
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-amber-500 h-2 rounded-full" 
                          style={{ 
                            width: `${calculatePercentage(
                              reportData.summary.cancelledSessions,
                              reportData.summary.completedSessions + reportData.summary.cancelledSessions
                            )}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            {/* Faixa Etária */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Faixa Etária</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="animate-pulse space-y-3">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="h-4 bg-muted rounded"></div>
                    ))}
                  </div>
                ) : reportData ? (
                  <div className="space-y-3">
                    {Object.entries(reportData.distribution.ageRanges).map(([range, count]) => (
                      <div key={range} className="flex items-center justify-between">
                        <span className="text-sm">{range} anos</span>
                        <span className="text-sm font-medium">{count} pacientes</span>
                      </div>
                    ))}
                  </div>
                ) : null}
              </CardContent>
            </Card>

            {/* Gênero */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Gênero</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center">
                  {loading ? (
                    <div className="animate-pulse space-y-4 w-full">
                      {[1, 2, 3].map(i => (
                        <div key={i}>
                          <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                          <div className="h-2 bg-muted rounded w-full"></div>
                        </div>
                      ))}
                    </div>
                  ) : reportData ? (
                    <div className="space-y-4 w-full">
                      {Object.entries(reportData.distribution.gender).map(([gender, count], index) => {
                        const colors = ['bg-pink-500', 'bg-blue-500', 'bg-purple-500', 'bg-gray-500'];
                        const percentage = calculatePercentage(count, reportData.summary.totalPatients);
                        return (
                          <div key={gender}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm">{getGenderLabel(gender)}</span>
                              <span className="text-sm font-medium">{count} ({percentage}%)</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div 
                                className={`${colors[index % colors.length]} h-2 rounded-full`} 
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Modal de Filtros */}
      <Dialog open={filterModalOpen} onOpenChange={setFilterModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Filtros de Relatórios</DialogTitle>
            <DialogDescription>
              Selecione o período para gerar os relatórios e estatísticas
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Período</Label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant={tempPeriod === 'week' ? 'default' : 'outline'}
                  onClick={() => setTempPeriod('week')}
                  className="justify-start"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Última semana
                </Button>
                <Button
                  variant={tempPeriod === 'month' ? 'default' : 'outline'}
                  onClick={() => setTempPeriod('month')}
                  className="justify-start"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Último mês
                </Button>
                <Button
                  variant={tempPeriod === 'quarter' ? 'default' : 'outline'}
                  onClick={() => setTempPeriod('quarter')}
                  className="justify-start"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Último trimestre
                </Button>
                <Button
                  variant={tempPeriod === 'year' ? 'default' : 'outline'}
                  onClick={() => setTempPeriod('year')}
                  className="justify-start"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Último ano
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-between sm:justify-between">
            <Button variant="outline" onClick={handleClearFilters}>
              <X className="h-4 w-4 mr-2" />
              Redefinir
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
