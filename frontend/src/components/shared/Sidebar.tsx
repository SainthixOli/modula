import { NavLink, useNavigate } from "react-router-dom"; 
import { 
  Home, 
  Calendar, 
  Users, 
  FileText, 
  Settings, 
  LogOut,
  ClipboardList,
  Bell,
  BarChart3,
  ArrowLeftRight,
  Shield,
  Database
} from "lucide-react";
import { Button } from "@/components/ui/button";
import logomodula from '@/components/assets/logo.png'; 
import { logout } from "@/services/auth.service"; 

interface SidebarProps {
  userType: "admin" | "professional";
  userName?: string;
}

export const Sidebar = ({ userType, userName }: SidebarProps) => {
  const professionalLinks = [
    { to: "/professional/dashboard", icon: Home, label: "Dashboard" },
    { to: "/professional/calendar", icon: Calendar, label: "Calendário" },
    { to: "/professional/patients", icon: Users, label: "Pacientes" },
    { to: "/professional/sessions", icon: ClipboardList, label: "Sessões" },
    { to: "/professional/anamnesi-templates", icon: FileText, label: "Anamneses" },
    { to: "/professional/notifications", icon: Bell, label: "Notificações" },
    { to: "/professional/reports", icon: BarChart3, label: "Relatórios" },
    { to: "/professional/settings", icon: Settings, label: "Configurações" },
  ];

  const adminLinks = [
    { to: "/admin/dashboard", icon: Home, label: "Dashboard" },
    { to: "/admin/professionals", icon: Users, label: "Profissionais" },
    { to: "/admin/transfers", icon: ArrowLeftRight, label: "Transferências" },
    { to: "/admin/notifications", icon: Bell, label: "Notificações" },
    { to: "/admin/monitoring", icon: BarChart3, label: "Monitoramento" },
    { to: "/admin/audit-logs", icon: Shield, label: "Auditoria" },
    { to: "/admin/backup", icon: Database, label: "Backup" },
    { to: "/admin/settings", icon: Settings, label: "Configurações" },
  ];

  const links = userType === "admin" ? adminLinks : professionalLinks;

  const navigate = useNavigate();
  const handleLogout = () => {
    logout(); 
    navigate("/"); 
  };

  return (
    <aside className="w-20 h-screen bg-background border-r border-border flex flex-col items-center py-6">
      {/* Logo */}
      <div className="flex items-center justify-center mb-8">
        <img 
          src={logomodula} 
          alt="Logo MÓDULA" 
          className="w-10 h-10 object-contain"
        />
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 flex flex-col gap-4 w-full items-center">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`
            }
            title={link.label}
          >
            <link.icon className="h-5 w-5" />
          </NavLink>
        ))}
      </nav>

      {/* Logout Button (agora 100% funcional) */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleLogout}
        className="w-12 h-12 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        title="Sair"
      >
        <LogOut className="h-5 w-5" />
      </Button>
    </aside>
  );
};