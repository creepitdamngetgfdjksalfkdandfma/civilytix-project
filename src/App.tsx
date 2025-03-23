
import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import AuthPage from "./pages/auth/AuthPage";
import NotFound from "./pages/NotFound";
import NewTenderPage from "./pages/tenders/NewTenderPage";
import BrowseTendersPage from "./pages/tenders/BrowseTendersPage";
import TenderDetailPage from "./pages/tenders/TenderDetailPage";
import AuditMaintenancePage from "./pages/audit/AuditMaintenancePage";
import NewAuditPage from "./pages/audit/NewAuditPage";
import ProjectsPage from "./pages/projects/ProjectsPage";
import ProjectDetailPage from "./pages/projects/ProjectDetailPage";
import NewProjectPage from "./pages/projects/NewProjectPage";
import AuditDetailPage from "./pages/audit/AuditDetailPage";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/auth";


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const AppContent = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:id" element={<ProjectDetailPage />} />
          <Route
            path="/projects/new"
            element={
              <ProtectedRoute allowedRoles={["government"]}>
                <NewProjectPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tenders/new"
            element={
              <ProtectedRoute allowedRoles={["government"]}>
                <NewTenderPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tenders/browse"
            element={<BrowseTendersPage />}
          />
          <Route
            path="/tenders/:id"
            element={<TenderDetailPage />}
          />
          <Route
            path="/audit"
            element={
              <ProtectedRoute allowedRoles={["government"]}>
                <AuditMaintenancePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/audit/new"
            element={
              <ProtectedRoute allowedRoles={["government"]}>
                <NewAuditPage />
              </ProtectedRoute>
            }
          />
          <Route path="/audit/:id" element={<AuditDetailPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <Toaster />
            <Sonner />
            <AppContent />
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

export default App;
