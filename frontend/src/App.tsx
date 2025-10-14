import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import ProfessionalDashboard from "./pages/professional/ProfessionalDashboard";
import PatientsPage from "./pages/professional/PatientsPage";
import PatientDetailPage from "./pages/professional/PatientDetailPage";
import NewPatientPage from "./pages/professional/NewPatientPage";
import CalendarPage from "./pages/professional/CalendarPage";
import ReportsPage from "./pages/professional/ReportsPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ProfessionalsPage from "./pages/admin/ProfessionalsPage";
import ProfessionalDetailPage from "./pages/admin/ProfessionalDetailPage";
import EditProfessionalPage from "./pages/admin/EditProfessionalPage";
import AdminSettingsPage from "./pages/admin/SettingsPage";
import AnamnesiTemplatesPage from "./pages/professional/AnamnesiTemplatesPage";
import FillAnamnesiPage from "./pages/professional/FillAnamnesiPage";
import EditPatientPage from "./pages/professional/EditPatientPage";
import SettingsPage from "./pages/professional/SettingsPage";
import AddProfessionalPage from "./pages/admin/AddProfessionalPage"; 

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Professional Routes */}
          <Route path="/professional/dashboard" element={<ProfessionalDashboard />} />
          <Route path="/professional/patients" element={<PatientsPage />} />
          <Route path="/professional/patients/:id" element={<PatientDetailPage />} />
          <Route path="/professional/patients/:id/edit" element={<EditPatientPage />} />
          <Route path="/professional/patients/:patientId/anamnesi/fill" element={<FillAnamnesiPage />} />
          <Route path="/professional/patients/new" element={<NewPatientPage />} />
          <Route path="/professional/calendar" element={<CalendarPage />} />
          <Route path="/professional/reports" element={<ReportsPage />} />
          <Route path="/professional/anamnesi-templates" element={<AnamnesiTemplatesPage />} />
          <Route path="/professional/settings" element={<SettingsPage />} />
          
          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/professionals" element={<ProfessionalsPage />} />

          {/* ADICIONA A NOVA ROTA AQUI */}
          <Route path="/admin/professionals/new" element={<AddProfessionalPage />} />
          
          <Route path="/admin/professionals/:id" element={<ProfessionalDetailPage />} />
          <Route path="/admin/professionals/:id/edit" element={<EditProfessionalPage />} />
          <Route path="/admin/reports" element={<AdminDashboard />} />
          <Route path="/admin/settings" element={<AdminSettingsPage />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;