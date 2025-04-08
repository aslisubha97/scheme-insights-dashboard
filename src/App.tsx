
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { DataProvider } from "./context/DataContext";
import Layout from "./components/Layout";
import DashboardPage from "./pages/DashboardPage";
import Upload from "./pages/Upload";
import FinancePage from "./pages/FinancePage";
import NotFound from "./pages/NotFound";
import BlockDetailPage from "./pages/BlockDetailPage";
import InvoiceDuePage from "./pages/InvoiceDuePage";
import { AuthProvider } from "./context/AuthContext";

// Create a new query client instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

// Optional: Set global API URL
if (!import.meta.env.VITE_API_URL) {
  // Define API_URL as a property on window instead of VITE_API_URL
  window.API_URL = window.location.origin;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <DataProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/dashboard" element={<Navigate to="/" replace />} />
                <Route path="/upload" element={<Upload />} />
                <Route path="/finance" element={<FinancePage />} />
                <Route path="/block/:blockName" element={<BlockDetailPage />} />
                <Route path="/invoice-due" element={<InvoiceDuePage />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </DataProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
