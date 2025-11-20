import { useState, useEffect } from "react";
import { Sidebar } from "@/components/shared/Sidebar";
import { Header } from "@/components/shared/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, User, Bell, Shield, Palette, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  getMyProfile,
  updateProfile,
  changePassword,
  getNotificationPreferences,
  saveNotificationPreferences,
  getAppearanceSettings,
  saveAppearanceSettings,
  applyAppearanceSettings,
} from "@/services/settings.service";

export default function SettingsPage() {
  const { toast } = useToast();
  const { userName } = useCurrentUser();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
    phone: "",
    professionalRegister: "",
    bio: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailAppointments: true,
    emailReports: true,
    pushNotifications: false,
    smsReminders: true,
  });

  const [appearanceSettings, setAppearanceSettings] = useState<{
    theme: 'light' | 'dark' | 'system';
    fontSize: 'small' | 'medium' | 'large';
  }>({
    theme: 'light',
    fontSize: 'medium',
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const profile = await getMyProfile();
      
      setProfileData({
        fullName: profile.full_name || "",
        email: profile.email || "",
        phone: profile.metadata?.phone || "",
        professionalRegister: profile.professional_register || "",
        bio: profile.metadata?.bio || "",
      });

      // Carregar preferências do perfil do backend
      const notifPrefs = getNotificationPreferences(profile);
      setNotificationSettings(notifPrefs);

      const appearance = getAppearanceSettings(profile);
      setAppearanceSettings(appearance);
      
      // Aplicar configurações de aparência salvas
      applyAppearanceSettings(appearance);
    } catch (error) {
      console.error("Erro ao carregar dados do usuário:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar seus dados",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      await updateProfile({
        full_name: profileData.fullName,
        email: profileData.email,
        phone: profileData.phone,
        bio: profileData.bio,
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
      await changePassword(passwordData);
      
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

  const handleSaveNotifications = async () => {
    try {
      setSaving(true);
      await saveNotificationPreferences(notificationSettings);
      toast({
        title: "Sucesso",
        description: "Preferências de notificação atualizadas",
      });
    } catch (error: any) {
      console.error("Erro ao salvar preferências:", error);
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Não foi possível salvar as preferências",
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
      await saveAppearanceSettings(newSettings);
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
      await saveAppearanceSettings(newSettings);
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

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar userType="professional" />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userType="professional" />

      <div className="flex-1 flex flex-col">
        <Header userName={userName} />

        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold">Configurações</h1>
              <p className="text-muted-foreground">Gerencie suas preferências e informações</p>
            </div>

            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="profile">
                  <User className="h-4 w-4 mr-2" />
                  Perfil
                </TabsTrigger>
                <TabsTrigger value="security">
                  <Shield className="h-4 w-4 mr-2" />
                  Segurança
                </TabsTrigger>
                <TabsTrigger value="notifications">
                  <Bell className="h-4 w-4 mr-2" />
                  Notificações
                </TabsTrigger>
                <TabsTrigger value="appearance">
                  <Palette className="h-4 w-4 mr-2" />
                  Aparência
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle>Informações do Perfil</CardTitle>
                    <CardDescription>
                      Atualize suas informações pessoais e profissionais
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

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Telefone</Label>
                        <Input
                          id="phone"
                          value={profileData.phone}
                          onChange={(e) =>
                            setProfileData({ ...profileData, phone: e.target.value })
                          }
                        />
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
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Biografia</Label>
                      <Textarea
                        id="bio"
                        value={profileData.bio}
                        onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                        rows={4}
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
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="security">
                <Card>
                  <CardHeader>
                    <CardTitle>Segurança</CardTitle>
                    <CardDescription>Altere sua senha e gerencie a segurança da conta</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
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

                    <Button onClick={handleChangePassword} disabled={saving}>
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

              <TabsContent value="notifications">
                <Card>
                  <CardHeader>
                    <CardTitle>Preferências de Notificação</CardTitle>
                    <CardDescription>
                      Escolha como você deseja receber notificações
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Agendamentos por Email</Label>
                        <p className="text-sm text-muted-foreground">
                          Receba confirmações de agendamentos por email
                        </p>
                      </div>
                      <Switch
                        checked={notificationSettings.emailAppointments}
                        onCheckedChange={(checked) =>
                          setNotificationSettings({ ...notificationSettings, emailAppointments: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Relatórios por Email</Label>
                        <p className="text-sm text-muted-foreground">
                          Receba relatórios mensais por email
                        </p>
                      </div>
                      <Switch
                        checked={notificationSettings.emailReports}
                        onCheckedChange={(checked) =>
                          setNotificationSettings({ ...notificationSettings, emailReports: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Notificações Push</Label>
                        <p className="text-sm text-muted-foreground">
                          Receba notificações push no navegador
                        </p>
                      </div>
                      <Switch
                        checked={notificationSettings.pushNotifications}
                        onCheckedChange={(checked) =>
                          setNotificationSettings({ ...notificationSettings, pushNotifications: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Lembretes por SMS</Label>
                        <p className="text-sm text-muted-foreground">
                          Receba lembretes de consultas por SMS
                        </p>
                      </div>
                      <Switch
                        checked={notificationSettings.smsReminders}
                        onCheckedChange={(checked) =>
                          setNotificationSettings({ ...notificationSettings, smsReminders: checked })
                        }
                      />
                    </div>

                    <Button onClick={handleSaveNotifications} disabled={saving}>
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Salvar Preferências
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
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
