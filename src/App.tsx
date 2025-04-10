
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/AdminDashboard";
import StudentPortal from "./pages/StudentPortal";
import VerifierPortal from "./pages/VerifierPortal";
import { WalletProvider } from "./context/WalletContext";
import { ThirdwebProvider } from "@thirdweb-dev/react";
import { BaseSepoliaTestnet } from "@thirdweb-dev/chains";

const queryClient = new QueryClient();

const App = () => (
  <ThirdwebProvider 
    activeChain={BaseSepoliaTestnet} 
    clientId={import.meta.env.VITE_THIRDWEB_CLIENT_ID || ""}
  >
    <QueryClientProvider client={queryClient}>
      <WalletProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/student" element={<StudentPortal />} />
              <Route path="/verify" element={<VerifierPortal />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </WalletProvider>
    </QueryClientProvider>
  </ThirdwebProvider>
);

export default App;
