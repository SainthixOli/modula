import { NavLink } from "react-router-dom";
import { Home, Calendar, Users, FileText, Settings, ClipboardList, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import logomodula from '@/components/assets/logo.png'; 

interface SidebarProps {
  userType: "admin" | "professional";
  userName?: string;
}

export const Sidebar = ({ userType, userName }: SidebarProps) => {
  const professionalLinks = [
    { to: "/professional/dashboard", icon: Home, label: "Home" },
    { to: "/professional/calendar", icon: Calendar, label: "Calendário" },
    { to: "/professional/patients", icon: Users, label: "Pacientes" },
    { to: "/professional/reports", icon: FileText, label: "Relatórios" },
    { to: "/professional/settings", icon: Settings, label: "Ajustes" },
  ];

  const adminLinks = [
    { to: "/admin/dashboard", icon: Home, label: "Home" },
    { to: "/admin/professionals", icon: Users, label: "Profissionais" },
    { to: "/admin/reports", icon: FileText, label: "Relatórios" },
    { to: "/admin/settings", icon: Settings, label: "Ajustes" },
  ];

  const links = userType === "admin" ? adminLinks : professionalLinks;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userType");
    window.location.href = "/";
  };

  return (
    <aside className="w-20 h-screen bg-background border-r border-border flex flex-col items-center py-6">
      {/* Logo */}
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

      {/* Logout Button */}
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
