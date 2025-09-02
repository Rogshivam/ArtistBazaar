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
// import ChangePassword from "./components/ChangePassword";
import Signup from "./components/Signup";
import AlertState from "./context/alert/AlertState";
import CustomerDashboard from "./pages/CustomerDashboard";
import FindSuppliers from "./pages/FindSuppliers";
import Products from "./pages/Products";
import ProtectedRoute from "@/components/ProtectedRoute";
import { CartProvider } from "./context/CartContext";
// import LoadingState from "./context/loading/LoadingState"; // if you also use loading context

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AlertState>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/products" element={<Products />} />
              <Route path="/seller/:id" element={<ProtectedRoute roles={["Seller"]}><SellerPage /></ProtectedRoute>} />
              <Route path="/Customer" element={<ProtectedRoute roles={["Customer"]}><CustomerDashboard /></ProtectedRoute>} />
              <Route path="/Customer/suppliers" element={<ProtectedRoute roles={["Customer"]}><FindSuppliers /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute roles={["Admin"]}><AdminPanel /></ProtectedRoute>} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </AlertState>
  </QueryClientProvider>
);

export default App;
