import { useState, useEffect } from "react";
import { Sidebar } from "@/components/shared/Sidebar";
import { Header } from "@/components/shared/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, User, Shield, Palette, Loader2, Mail, Database } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Separator } from "@/components/ui/separator";
import {
  getEmailSettings,
  updateEmailSettings,
  getSystemSettings,
  updateSystemSettings,
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword,
  getAdminAppearanceSettings,
  saveAdminAppearanceSettings,
  applyAdminAppearanceSettings,
  type EmailSettings,
  type SystemSettings,
} from '@/services/admin-settings.service';

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const { userName } = useCurrentUser();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
    professionalRegister: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [appearanceSettings, setAppearanceSettings] = useState<{
    theme: 'light' | 'dark' | 'system';
    fontSize: 'small' | 'medium' | 'large';
  }>({
    theme: 'light',
    fontSize: 'medium',
  });

  const [emailData, setEmailData] = useState<EmailSettings>({
    smtp_host: '',
    smtp_port: 587,
    smtp_user: '',
    smtp_password: '',
    from_email: '',
    from_name: '',
  });

  const [systemData, setSystemData] = useState<SystemSettings>({
    maintenance_mode: false,
    allow_new_registrations: true,
    require_email_verification: true,
    session_timeout_minutes: 120,
    max_login_attempts: 5,
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Load profile
      const profile = await getAdminProfile();
      setProfileData({
        fullName: profile.full_name || "",
        email: profile.email || "",
        professionalRegister: profile.professional_register || "",
      });

      // Load appearance settings
      const appearance = getAdminAppearanceSettings(profile);
      setAppearanceSettings(appearance);
      applyAdminAppearanceSettings(appearance);

      // Load email settings
      const email = await getEmailSettings();
      setEmailData(email);

      // Load system settings
      const system = await getSystemSettings();
      setSystemData(system);

    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as configurações",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      await updateAdminProfile({
        full_name: profileData.fullName,
        email: profileData.email,
        professional_register: profileData.professionalRegister,
      });

      toast({
        title: "Sucesso",
        description: "Perfil atualizado com sucesso",
      });
    } catch (error: any) {
      console.error("Erro ao atualizar perfil:", error);
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Não foi possível atualizar o perfil",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast({
        title: "Erro",
        description: "A senha deve ter no mínimo 8 caracteres com letras e números",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      await changeAdminPassword(passwordData.currentPassword, passwordData.newPassword);
      
      toast({
        title: "Sucesso",
        description: "Senha alterada com sucesso",
      });
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error: any) {
      console.error("Erro ao alterar senha:", error);
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Não foi possível alterar a senha",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleThemeChange = async (theme: 'light' | 'dark' | 'system') => {
    try {
      const newSettings = { ...appearanceSettings, theme };
      setAppearanceSettings(newSettings);
      await saveAdminAppearanceSettings(newSettings);
      toast({
        title: "Tema alterado",
        description: `Tema ${theme === 'light' ? 'claro' : theme === 'dark' ? 'escuro' : 'do sistema'} aplicado`,
      });
    } catch (error: any) {
      console.error("Erro ao salvar tema:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o tema",
        variant: "destructive",
      });
    }
  };

  const handleFontSizeChange = async (fontSize: 'small' | 'medium' | 'large') => {
    try {
      const newSettings = { ...appearanceSettings, fontSize };
      setAppearanceSettings(newSettings);
      await saveAdminAppearanceSettings(newSettings);
      toast({
        title: "Tamanho da fonte alterado",
        description: `Fonte ${fontSize === 'small' ? 'pequena' : fontSize === 'medium' ? 'média' : 'grande'} aplicada`,
      });
    } catch (error: any) {
      console.error("Erro ao salvar tamanho da fonte:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o tamanho da fonte",
        variant: "destructive",
      });
    }
  };

  const handleSaveEmail = async () => {
    try {
      setSaving(true);
      await updateEmailSettings(emailData);
      toast({
        title: "Sucesso",
        description: "Configurações de e-mail atualizadas",
      });
    } catch (error: any) {
      console.error("Erro ao salvar e-mail:", error);
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Não foi possível atualizar as configurações de e-mail",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSystem = async () => {
    try {
      setSaving(true);
      await updateSystemSettings(systemData);
      toast({
        title: "Sucesso",
        description: "Configurações do sistema atualizadas",
      });
    } catch (error: any) {
      console.error("Erro ao salvar sistema:", error);
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Não foi possível atualizar as configurações do sistema",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar userType="admin" />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userType="admin" />

      <div className="flex-1 flex flex-col">
        <Header userName={userName} />

        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold">Configurações</h1>
              <p className="text-muted-foreground">Gerencie as configurações do sistema e da clínica</p>
            </div>

            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="profile">
                  <User className="h-4 w-4 mr-2" />
                  Perfil
                </TabsTrigger>
                <TabsTrigger value="appearance">
                  <Palette className="h-4 w-4 mr-2" />
                  Aparência
                </TabsTrigger>
                <TabsTrigger value="email">
                  <Mail className="h-4 w-4 mr-2" />
                  E-mail
                </TabsTrigger>
                <TabsTrigger value="system">
                  <Shield className="h-4 w-4 mr-2" />
                  Sistema
                </TabsTrigger>
                <TabsTrigger value="database">
                  <Database className="h-4 w-4 mr-2" />
                  Banco
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle>Informações do Perfil</CardTitle>
                    <CardDescription>
                      Atualize suas informações pessoais
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Nome Completo</Label>
                        <Input
                          id="fullName"
                          value={profileData.fullName}
                          onChange={(e) =>
                            setProfileData({ ...profileData, fullName: e.target.value })
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profileData.email}
                          onChange={(e) =>
                            setProfileData({ ...profileData, email: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register">Registro Profissional</Label>
                      <Input
                        id="register"
                        value={profileData.professionalRegister}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            professionalRegister: e.target.value,
                          })
                        }
                        placeholder="CRP, CRM, etc."
                      />
                    </div>

                    <Button onClick={handleSaveProfile} disabled={saving}>
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Salvar Alterações
                        </>
                      )}
                    </Button>

                    <Separator className="my-6" />

                    <CardTitle className="text-lg mb-4">Alterar Senha</CardTitle>
                    
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Senha Atual</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, currentPassword: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword">Nova Senha</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, newPassword: e.target.value })
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        Mínimo de 8 caracteres com letras e números
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                        }
                      />
                    </div>

                    <Button onClick={handleChangePassword} disabled={saving} variant="outline">
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Alterando...
                        </>
                      ) : (
                        <>
                          <Shield className="h-4 w-4 mr-2" />
                          Alterar Senha
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="appearance">
                <Card>
                  <CardHeader>
                    <CardTitle>Aparência</CardTitle>
                    <CardDescription>
                      Personalize a aparência da plataforma
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Tema</Label>
                      <div className="grid grid-cols-3 gap-4">
                        <Card 
                          className={`cursor-pointer transition-all hover:border-primary/50 ${
                            appearanceSettings.theme === 'light' ? 'border-2 border-primary' : ''
                          }`}
                          onClick={() => handleThemeChange('light')}
                        >
                          <CardContent className="p-4 text-center">
                            <p className="font-medium">Claro</p>
                          </CardContent>
                        </Card>
                        <Card 
                          className={`cursor-pointer transition-all hover:border-primary/50 ${
                            appearanceSettings.theme === 'dark' ? 'border-2 border-primary' : ''
                          }`}
                          onClick={() => handleThemeChange('dark')}
                        >
                          <CardContent className="p-4 text-center">
                            <p className="font-medium">Escuro</p>
                          </CardContent>
                        </Card>
                        <Card 
                          className={`cursor-pointer transition-all hover:border-primary/50 ${
                            appearanceSettings.theme === 'system' ? 'border-2 border-primary' : ''
                          }`}
                          onClick={() => handleThemeChange('system')}
                        >
                          <CardContent className="p-4 text-center">
                            <p className="font-medium">Sistema</p>
                          </CardContent>
                        </Card>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Tamanho da Fonte</Label>
                      <div className="grid grid-cols-3 gap-4">
                        <Card 
                          className={`cursor-pointer transition-all hover:border-primary/50 ${
                            appearanceSettings.fontSize === 'small' ? 'border-2 border-primary' : ''
                          }`}
                          onClick={() => handleFontSizeChange('small')}
                        >
                          <CardContent className="p-4 text-center">
                            <p className="text-sm font-medium">Pequena</p>
                          </CardContent>
                        </Card>
                        <Card 
                          className={`cursor-pointer transition-all hover:border-primary/50 ${
                            appearanceSettings.fontSize === 'medium' ? 'border-2 border-primary' : ''
                          }`}
                          onClick={() => handleFontSizeChange('medium')}
                        >
                          <CardContent className="p-4 text-center">
                            <p className="font-medium">Média</p>
                          </CardContent>
                        </Card>
                        <Card 
                          className={`cursor-pointer transition-all hover:border-primary/50 ${
                            appearanceSettings.fontSize === 'large' ? 'border-2 border-primary' : ''
                          }`}
                          onClick={() => handleFontSizeChange('large')}
                        >
                          <CardContent className="p-4 text-center">
                            <p className="text-lg font-medium">Grande</p>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="email">
                <Card>
                  <CardHeader>
                    <CardTitle>Configurações de E-mail</CardTitle>
                    <CardDescription>
                      Configure o servidor SMTP para envio de e-mails
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="smtp_host">Servidor SMTP</Label>
                        <Input
                          id="smtp_host"
                          value={emailData.smtp_host}
                          onChange={(e) => setEmailData({ ...emailData, smtp_host: e.target.value })}
                          placeholder="smtp.gmail.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="smtp_port">Porta</Label>
                        <Input
                          id="smtp_port"
                          type="number"
                          value={emailData.smtp_port}
                          onChange={(e) =>
                            setEmailData({ ...emailData, smtp_port: parseInt(e.target.value) })
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="smtp_user">Usuário SMTP</Label>
                      <Input
                        id="smtp_user"
                        value={emailData.smtp_user}
                        onChange={(e) => setEmailData({ ...emailData, smtp_user: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="smtp_password">Senha SMTP</Label>
                      <Input
                        id="smtp_password"
                        type="password"
                        value={emailData.smtp_password}
                        onChange={(e) => setEmailData({ ...emailData, smtp_password: e.target.value })}
                      />
                    </div>

                    <Separator />

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="from_email">E-mail de Envio</Label>
                        <Input
                          id="from_email"
                          type="email"
                          value={emailData.from_email}
                          onChange={(e) => setEmailData({ ...emailData, from_email: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="from_name">Nome de Envio</Label>
                        <Input
                          id="from_name"
                          value={emailData.from_name}
                          onChange={(e) => setEmailData({ ...emailData, from_name: e.target.value })}
                        />
                      </div>
                    </div>

                    <Button onClick={handleSaveEmail} disabled={saving}>
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Salvar Configurações
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="system">
                <Card>
                  <CardHeader>
                    <CardTitle>Configurações do Sistema</CardTitle>
                    <CardDescription>
                      Gerencie configurações de segurança e acesso
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Modo de Manutenção</Label>
                        <p className="text-sm text-muted-foreground">
                          Desativa o acesso ao sistema para manutenção
                        </p>
                      </div>
                      <Switch
                        checked={systemData.maintenance_mode}
                        onCheckedChange={(checked) =>
                          setSystemData({ ...systemData, maintenance_mode: checked })
                        }
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Permitir Novos Cadastros</Label>
                        <p className="text-sm text-muted-foreground">
                          Permite que novos usuários se cadastrem no sistema
                        </p>
                      </div>
                      <Switch
                        checked={systemData.allow_new_registrations}
                        onCheckedChange={(checked) =>
                          setSystemData({ ...systemData, allow_new_registrations: checked })
                        }
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Verificação de E-mail</Label>
                        <p className="text-sm text-muted-foreground">
                          Exige verificação de e-mail para novos cadastros
                        </p>
                      </div>
                      <Switch
                        checked={systemData.require_email_verification}
                        onCheckedChange={(checked) =>
                          setSystemData({ ...systemData, require_email_verification: checked })
                        }
                      />
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label htmlFor="session_timeout">Timeout da Sessão (minutos)</Label>
                      <Input
                        id="session_timeout"
                        type="number"
                        value={systemData.session_timeout_minutes}
                        onChange={(e) =>
                          setSystemData({
                            ...systemData,
                            session_timeout_minutes: parseInt(e.target.value),
                          })
                        }
                      />
                      <p className="text-sm text-muted-foreground">
                        Tempo máximo de inatividade antes do logout automático
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="max_attempts">Máximo de Tentativas de Login</Label>
                      <Input
                        id="max_attempts"
                        type="number"
                        value={systemData.max_login_attempts}
                        onChange={(e) =>
                          setSystemData({ ...systemData, max_login_attempts: parseInt(e.target.value) })
                        }
                      />
                      <p className="text-sm text-muted-foreground">
                        Número máximo de tentativas antes de bloquear temporariamente
                      </p>
                    </div>

                    <Button onClick={handleSaveSystem} disabled={saving}>
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Salvar Configurações
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="database">
                <Card>
                  <CardHeader>
                    <CardTitle>Configurações de Banco de Dados</CardTitle>
                    <CardDescription>
                      Gerencie backups e manutenção do banco
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      As configurações de backup foram movidas para uma página dedicada. Acesse através do
                      menu lateral.
                    </p>
                    <Button variant="outline" onClick={() => (window.location.href = '/admin/backup')}>
                      Ir para Configurações de Backup
                    </Button>
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
