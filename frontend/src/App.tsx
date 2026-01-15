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
import Signup from "./components/Signup";
import AlertState from "./context/alert/AlertState";
import FindSuppliers from "./pages/FindSuppliers";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Artisans from "./pages/Artisans";
import Chat from "./pages/Chat";
import ProtectedRoute from "@/components/ProtectedRoute";
import { CartProvider } from "./context/CartContext/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import { ProductProvider } from "./context/ProductContext/ProductContext";
import ProfileView from "./pages/ProfileView";
import DirectChat from "./pages/DirectChat";
import AboutCustom from "@/components/PanelLout/About";
import Analytics from "@/components/PanelLout/Analytics";
import Settings from "@/components/PanelLout/Settings";
import Services from "@/components/PanelLout/Services";
import Dashboard from "@/components/PanelLout/Dashboard";
import SellerDashboard from "@/components/PanelLout/SellerDashboard";
import CustomerDashboard from "@/components/PanelLout/CustomerDashboard";
import CustomerOrders from "@/pages/CustomerOrders";
import SellerAnalytics from "@/components/PanelLout/SellerAnalytics";
import SellerSettings from "@/components/PanelLout/SellerSettings";
import SellerAbout from "@/components/PanelLout/SellerAbout";
import SellerProducts from "./pages/SellerProducts";
import CustomerSettings from "@/components/PanelLout/CustomerSettings";
import SellerChats from "@/components/PanelLout/SellerChats";
import SellerChatThread from "@/components/PanelLout/SellerChatThread";
import AdminAnalytics from "@/components/Admin/AdminAnalytics";
import Overview from "@/components/Admin/Overview";
import DataEntity from "@/components/Admin/DataEntity";
import Logs from "@/components/Admin/Logs";
import Security from "@/components/Admin/Security";
import Users from "@/components/Admin/Users";
import { AdminLayout } from "@/components/Admin/Layout/AdminLayout";
import About from "./pages/About";
import { Layout } from "./components/PanelLout/Layout";
import { AuthProvider } from "@/context/auth/AuthContext";
import ChatThread from "@/pages/ChatThread";
import ServicePanel from "@/pages/ServicePanel";
import { DrawerProvider, useDrawer } from "./context/DrawerContext/DrawerContext"; 
import CartSidebar from "@/components/CartSidebar";
import WishlistDrawer from "@/components/WishlistDrawer";

const queryClient = new QueryClient();

// ✅ Separate component to use useDrawer hook inside DrawerProvider
const AppContent = () => {
  const { cartOpen, wishlistOpen, closeCart, closeWishlist } = useDrawer();

  return (
    <>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/artisans" element={<Artisans />} />
              <Route path="/profile/:id" element={<ProfileView />} />
              <Route path="/chat/:id" element={<ProtectedRoute roles={["Customer", "Seller", "Services", "Admin"]}><DirectChat /></ProtectedRoute>} />
              <Route path="/chat" element={<ProtectedRoute roles={["Customer", "Seller", "Services", "Admin"]}><Chat /></ProtectedRoute>} />
              
              <Route
                path="/services/:id"
                element={
                  <ProtectedRoute roles={["Services"]}>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<ServicePanel />} />
              </Route>

              <Route
                path="/seller/:id"
                element={
                  <ProtectedRoute roles={["Seller"]}>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<SellerDashboard />} />
                <Route path="home" element={<SellerDashboard />} />
                <Route path="about" element={<SellerAbout />} />
                <Route path="dashboard" element={<SellerDashboard />} />
                <Route path="settings" element={<SellerSettings />} />
                <Route path="analytics" element={<SellerAnalytics />} />
                <Route path="services" element={<Services />} />
                <Route path="products" element={<SellerProducts />} />
                <Route path="chats" element={<SellerChats />} />
                <Route path="chats/:conversationId" element={<SellerChatThread />} />
              </Route>

              <Route
                path="/customer/:id"
                element={
                  <ProtectedRoute roles={["Customer"]}>
                    <Layout />   
                  </ProtectedRoute>
                }
              >
                <Route index element={<CustomerDashboard />} />
                <Route path="home" element={<CustomerDashboard />} />
                <Route path="orders" element={<CustomerOrders />} />
                <Route path="about" element={<AboutCustom />} />
                <Route path="dashboard" element={<CustomerDashboard />} />
                <Route path="settings" element={<CustomerSettings />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="services" element={<Services />} />
                <Route path="suppliers" element={<FindSuppliers />} />
              </Route>

              <Route
                path="/admin"
                element={
                  <ProtectedRoute roles={["Admin"]}>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Overview />} />
                <Route path="overview" element={<Overview />} />
                <Route path="analytics" element={<AdminAnalytics />} />
                <Route path="data-entity" element={<DataEntity />} />
                <Route path="logs" element={<Logs />} />
                <Route path="security" element={<Security />} />
                <Route path="data/:entity" element={<DataEntity />} />
                <Route path="users" element={<Users />} />
                <Route path="domains" element={<div className="p-6">Domains management coming soon...</div>} />
                <Route path="code" element={<div className="p-6">Code management coming soon...</div>} />
                <Route path="settings" element={<div className="p-6">Settings coming soon...</div>} />
              </Route>

              <Route path="about" element={<About />} />
              <Route path="/chat/thread/:conversationId" element={<ProtectedRoute roles={["Customer", "Seller", "Services", "Admin"]}><ChatThread /></ProtectedRoute>} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>

        {/* ✅ GLOBAL DRAWERS - Rendered at root level */}
        <CartSidebar isOpen={cartOpen} onClose={closeCart} />
        <WishlistDrawer isOpen={wishlistOpen} onClose={closeWishlist} />
      </TooltipProvider>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AlertState>
      <ProductProvider>
        <CartProvider>
          <WishlistProvider>
            <DrawerProvider>
              <AppContent />
            </DrawerProvider>
          </WishlistProvider>
        </CartProvider>
      </ProductProvider>
    </AlertState>
  </QueryClientProvider>
);

export default App;
