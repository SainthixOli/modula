import { useState } from "react";
import { Sidebar } from "@/components/shared/Sidebar";
import { Header } from "@/components/shared/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Building2, Shield, Database, Mail } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export default function AdminSettingsPage() {
  const { toast } = useToast();

  const [clinicData, setClinicData] = useState({
    name: "Clínica Módula",
    cnpj: "12.345.678/0001-90",
    phone: "(11) 3456-7890",
    email: "contato@clinicamodula.com.br",
    address: "Rua Exemplo, 123 - São Paulo, SP",
    workHours: "Segunda a Sexta: 8h - 18h",
  });

  const [emailSettings, setEmailSettings] = useState({
    smtpHost: "smtp.gmail.com",
    smtpPort: "587",
    smtpUser: "noreply@clinica.com",
    smtpPassword: "",
  });

  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    allowRegistrations: true,
    requireEmailVerification: true,
    sessionTimeout: "24",
    maxLoginAttempts: "5",
  });

  const handleSaveClinic = () => {
    toast({
      title: "Sucesso",
      description: "Dados da clínica atualizados",
    });
  };

  const handleSaveEmail = () => {
    toast({
      title: "Sucesso",
      description: "Configurações de email atualizadas",
    });
  };

  const handleSaveSystem = () => {
    toast({
      title: "Sucesso",
      description: "Configurações do sistema atualizadas",
    });
  };

  const handleBackupDatabase = () => {
    toast({
      title: "Backup Iniciado",
      description: "O backup do banco de dados está sendo gerado",
    });
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userType="admin" />

      <div className="flex-1 flex flex-col">
        <Header userName="Admin" />

        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold">Configurações do Sistema</h1>
              <p className="text-muted-foreground">
                Gerencie as configurações gerais da plataforma
              </p>
            </div>

            <Tabs defaultValue="clinic" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="clinic">
                  <Building2 className="h-4 w-4 mr-2" />
                  Clínica
                </TabsTrigger>
                <TabsTrigger value="email">
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </TabsTrigger>
                <TabsTrigger value="system">
                  <Shield className="h-4 w-4 mr-2" />
                  Sistema
                </TabsTrigger>
                <TabsTrigger value="database">
                  <Database className="h-4 w-4 mr-2" />
                  Banco de Dados
                </TabsTrigger>
              </TabsList>

              <TabsContent value="clinic">
                <Card>
                  <CardHeader>
                    <CardTitle>Informações da Clínica</CardTitle>
                    <CardDescription>
                      Dados institucionais que aparecem no sistema
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="clinicName">Nome da Clínica</Label>
                        <Input
                          id="clinicName"
                          value={clinicData.name}
                          onChange={(e) => setClinicData({ ...clinicData, name: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cnpj">CNPJ</Label>
                        <Input
                          id="cnpj"
                          value={clinicData.cnpj}
                          onChange={(e) => setClinicData({ ...clinicData, cnpj: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="clinicPhone">Telefone</Label>
                        <Input
                          id="clinicPhone"
                          value={clinicData.phone}
                          onChange={(e) => setClinicData({ ...clinicData, phone: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="clinicEmail">Email</Label>
                        <Input
                          id="clinicEmail"
                          type="email"
                          value={clinicData.email}
                          onChange={(e) => setClinicData({ ...clinicData, email: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Endereço</Label>
                      <Textarea
                        id="address"
                        value={clinicData.address}
                        onChange={(e) => setClinicData({ ...clinicData, address: e.target.value })}
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="workHours">Horário de Funcionamento</Label>
                      <Input
                        id="workHours"
                        value={clinicData.workHours}
                        onChange={(e) =>
                          setClinicData({ ...clinicData, workHours: e.target.value })
                        }
                      />
                    </div>

                    <Button onClick={handleSaveClinic}>
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Alterações
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="email">
                <Card>
                  <CardHeader>
                    <CardTitle>Configurações de Email</CardTitle>
                    <CardDescription>
                      Configure o servidor SMTP para envio de emails
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="smtpHost">Servidor SMTP</Label>
                        <Input
                          id="smtpHost"
                          value={emailSettings.smtpHost}
                          onChange={(e) =>
                            setEmailSettings({ ...emailSettings, smtpHost: e.target.value })
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="smtpPort">Porta</Label>
                        <Input
                          id="smtpPort"
                          value={emailSettings.smtpPort}
                          onChange={(e) =>
                            setEmailSettings({ ...emailSettings, smtpPort: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="smtpUser">Usuário SMTP</Label>
                      <Input
                        id="smtpUser"
                        type="email"
                        value={emailSettings.smtpUser}
                        onChange={(e) =>
                          setEmailSettings({ ...emailSettings, smtpUser: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="smtpPassword">Senha SMTP</Label>
                      <Input
                        id="smtpPassword"
                        type="password"
                        value={emailSettings.smtpPassword}
                        onChange={(e) =>
                          setEmailSettings({ ...emailSettings, smtpPassword: e.target.value })
                        }
                        placeholder="••••••••"
                      />
                    </div>

                    <Button onClick={handleSaveEmail}>
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Configurações
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="system">
                <Card>
                  <CardHeader>
                    <CardTitle>Configurações do Sistema</CardTitle>
                    <CardDescription>Gerencie configurações de segurança e acesso</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Modo Manutenção</Label>
                        <p className="text-sm text-muted-foreground">
                          Desabilita acesso ao sistema para manutenção
                        </p>
                      </div>
                      <Switch
                        checked={systemSettings.maintenanceMode}
                        onCheckedChange={(checked) =>
                          setSystemSettings({ ...systemSettings, maintenanceMode: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Permitir Novos Cadastros</Label>
                        <p className="text-sm text-muted-foreground">
                          Permite que novos profissionais sejam cadastrados
                        </p>
                      </div>
                      <Switch
                        checked={systemSettings.allowRegistrations}
                        onCheckedChange={(checked) =>
                          setSystemSettings({ ...systemSettings, allowRegistrations: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Verificação de Email Obrigatória</Label>
                        <p className="text-sm text-muted-foreground">
                          Exige verificação de email para novos usuários
                        </p>
                      </div>
                      <Switch
                        checked={systemSettings.requireEmailVerification}
                        onCheckedChange={(checked) =>
                          setSystemSettings({
                            ...systemSettings,
                            requireEmailVerification: checked,
                          })
                        }
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="sessionTimeout">Timeout de Sessão (horas)</Label>
                        <Input
                          id="sessionTimeout"
                          type="number"
                          value={systemSettings.sessionTimeout}
                          onChange={(e) =>
                            setSystemSettings({ ...systemSettings, sessionTimeout: e.target.value })
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="maxAttempts">Máximo de Tentativas de Login</Label>
                        <Input
                          id="maxAttempts"
                          type="number"
                          value={systemSettings.maxLoginAttempts}
                          onChange={(e) =>
                            setSystemSettings({
                              ...systemSettings,
                              maxLoginAttempts: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <Button onClick={handleSaveSystem}>
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Configurações
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="database">
                <Card>
                  <CardHeader>
                    <CardTitle>Banco de Dados</CardTitle>
                    <CardDescription>
                      Gerenciamento e backup do banco de dados
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Backup do Banco de Dados</Label>
                      <p className="text-sm text-muted-foreground mb-4">
                        Gere um backup completo do banco de dados para segurança
                      </p>
                      <Button onClick={handleBackupDatabase} variant="outline">
                        <Database className="h-4 w-4 mr-2" />
                        Gerar Backup Agora
                      </Button>
                    </div>

                    <div className="border-t pt-4">
                      <Label>Últimos Backups</Label>
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div>
                            <p className="font-medium">backup_2024_03_15.sql</p>
                            <p className="text-sm text-muted-foreground">15/03/2024 às 02:00</p>
                          </div>
                          <Button variant="ghost" size="sm">
                            Download
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div>
                            <p className="font-medium">backup_2024_03_14.sql</p>
                            <p className="text-sm text-muted-foreground">14/03/2024 às 02:00</p>
                          </div>
                          <Button variant="ghost" size="sm">
                            Download
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
