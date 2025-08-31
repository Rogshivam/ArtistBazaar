import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SellerPage from "./pages/SellerPage";
import AdminPanel from "./pages/AdminPanel";
import Login from "@/components/Login";
import ChangePassword from "./components/ChangePassword";
import Signup from "./components/Signup";
import AlertState from "./context/alert/AlertState";
// import LoadingState from "./context/loading/LoadingState"; // if you also use loading context

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AlertState>
      {/* <LoadingState>  ✅ if you also need loading context */}
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/seller" element={<SellerPage />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/login" element={<Login />} />
            <Route path="/changePassword" element={<ChangePassword />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
      {/* </LoadingState> */}
    </AlertState>
  </QueryClientProvider>
);

export default App;
