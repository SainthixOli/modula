import { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Importações de Páginas Gerais
import Login from "./pages/Login";
import ResetSenhaPage from "./pages/ResetSenha";
import CriarSenha from "./pages/CriarSenha";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import FirstAccessPage from './pages/FirstAccessPage';
import ProtectedRoute from './components/shared/ProtectedRoute';

// Importações de Páginas do Profissional
import ProfessionalDashboard from "./pages/professional/ProfessionalDashboard";
import PatientsPage from "./pages/professional/PatientsPage";
import PatientDetailPage from "./pages/professional/PatientDetailPage";
import NewPatientPage from "./pages/professional/NewPatientPage";
import EditPatientPage from "./pages/professional/EditPatientPage";
import CalendarPage from "./pages/professional/CalendarPage";
import ReportsPage from "./pages/professional/ReportsPage";
import AnamnesiTemplatesPage from "./pages/professional/AnamnesiTemplatesPage";
import FillAnamnesiPage from "./pages/professional/FillAnamnesiPage";
import SettingsPage from "./pages/professional/SettingsPage";
import NotificationsPage from "./pages/professional/NotificationsPage";
import SessionsPage from "./pages/professional/SessionsPage";
import AuditLogsPage from "./pages/professional/AuditLogsPage";
import BackupPage from "./pages/professional/BackupPage";
import ViewAnamnesiPage from "./pages/professional/ViewAnamnesiPage";

// Importações de Páginas do Admin
import AdminDashboard from "./pages/admin/AdminDashboard";
import ProfessionalsPage from "./pages/admin/ProfessionalsPage";
import ProfessionalDetailPage from "./pages/admin/ProfessionalDetailPage";
import EditProfessionalPage from "./pages/admin/EditProfessionalPage";
import AdminSettingsPage from "./pages/admin/SettingsPage";
import AddProfessionalPage from "./pages/admin/AddProfessionalPage";
import TransfersPage from "./pages/admin/TransfersPage";
import MonitoringPage from "./pages/admin/MonitoringPage";
import NotificationsAdminPage from "./pages/admin/NotificationsAdminPage";

// Serviços
import { setupAuthHeader } from './services/auth.service';

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    setupAuthHeader();
    const handleAuthChange = () => setupAuthHeader();
    window.addEventListener('authChange', handleAuthChange);
    return () => {
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, []);

return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* --- Rotas Públicas (NÃO precisam de segurança) --- */}
            <Route path="/" element={<Login />} />
            <Route path="/first-access" element={<FirstAccessPage />} />
            <Route path="/redefinir-senha" element={<ResetSenhaPage />} />
            <Route path="/redefinir-senha/:token" element={<CriarSenha />} />
            
            {/* --- Rotas Protegidas (SÓ ENTRA QUEM TEM TOKEN) --- */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              
              {/* Rotas do Profissional */}
              <Route path="/professional/dashboard" element={<ProfessionalDashboard />} />
              <Route path="/professional/patients" element={<PatientsPage />} />
              <Route path="/professional/patients/new" element={<NewPatientPage />} />
              <Route path="/professional/patients/:id" element={<PatientDetailPage />} />
              <Route path="/professional/patients/:id/edit" element={<EditPatientPage />} />
              <Route path="/professional/patients/:patientId/anamnesi/fill" element={<FillAnamnesiPage />} />
              <Route path="/professional/calendar" element={<CalendarPage />} />
              <Route path="/professional/reports" element={<ReportsPage />} />
              <Route path="/professional/anamnesi-templates" element={<AnamnesiTemplatesPage />} />
              <Route path="/professional/settings" element={<SettingsPage />} />
              <Route path="/professional/notifications" element={<NotificationsPage />} />
              <Route path="/professional/sessions" element={<SessionsPage />} />
              <Route path="/professional/audit-logs" element={<AuditLogsPage />} />
              <Route path="/professional/backup" element={<BackupPage />} />
              <Route path="/professional/patients/:patientId/view-anamnesis/:anamnesisId" element={<ViewAnamnesiPage />} />
              
              {/* Rotas do Admin */}
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/professionals" element={<ProfessionalsPage />} />
              <Route path="/admin/professionals/new" element={<AddProfessionalPage />} />
              <Route path="/admin/professionals/:id" element={<ProfessionalDetailPage />} />
              <Route path="/admin/professionals/:id/edit" element={<EditProfessionalPage />} />
              <Route path="/admin/reports" element={<AdminDashboard />} />
              <Route path="/admin/settings" element={<AdminSettingsPage />} />
              <Route path="/admin/transfers" element={<TransfersPage />} />
              <Route path="/admin/monitoring" element={<MonitoringPage />} />
              <Route path="/admin/notifications" element={<NotificationsAdminPage />} />
            </Route>

            {/* Rota "Catch-all" para página não encontrada */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;