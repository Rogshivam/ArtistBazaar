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
import Chat from "./pages/Chat";
import ProtectedRoute from "@/components/ProtectedRoute";
import { CartProvider } from "./context/CartContext/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import { ProductProvider } from "./context/ProductContext/ProductContext";
import ProfileView from "./pages/ProfileView";
import DirectChat from "./pages/DirectChat";
import About from "@/components/PanelLout/About";
import Analytics from "@/components/PanelLout/Analytics";
import Settings from "@/components/PanelLout/Settings";
import Services from "@/components/PanelLout/Services";
import Dashboard from "@/components/PanelLout/Dashboard";

import { Layout } from "./components/PanelLout/Layout";
// import LoadingState from "./context/loading/LoadingState"; // if you also use loading context

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AlertState>
      <ProductProvider>
        <CartProvider>
          <WishlistProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/profile/:id" element={<ProfileView />} />
                  <Route path="/chat/:id" element={<DirectChat />} />
                  <Route path="/chat" element={<ProtectedRoute roles={["Customer", "Seller", "Services", "Admin"]}><Chat /></ProtectedRoute>} />
                  {/* <Route path="/seller/:id" element={<ProtectedRoute roles={["Seller"]}><SellerPage /></ProtectedRoute>}><Route path="about" element={<About />} /><Route path="/settings" element={<Settings />} /><Route path="/analytics" element={<Analytics />} /></Route> */}
                  {/* <Route path="/seller/:id" element={<ProtectedRoute roles={["Seller"]}><SellerPage /></ProtectedRoute>} /> */}
                  {/* Seller Dashboard with Nested Routes */}
                  <Route
                    path="/seller/:id"
                    element={
                      <ProtectedRoute roles={["Seller"]}>
                        <Layout />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<SellerPage />} />
                    {/* <Route path="" element={<Dashboard />} /> */}
                    <Route path="about" element={<About />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="analytics" element={<Analytics />} />
                    <Route path="analytics" element={<Analytics />} />
                    <Route path="services" element={<Services />} />
                  </Route>
                  <Route path="/Customer/:id" element={<ProtectedRoute roles={["Customer"]}><CustomerDashboard /></ProtectedRoute>} />
                  <Route path="/Customer/suppliers" element={<ProtectedRoute roles={["Customer"]}><FindSuppliers /></ProtectedRoute>} />
                  <Route path="/admin" element={<ProtectedRoute roles={["Admin"]}><AdminPanel /></ProtectedRoute>} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </WishlistProvider>
        </CartProvider>
      </ProductProvider>
    </AlertState>
  </QueryClientProvider>
);

export default App;
