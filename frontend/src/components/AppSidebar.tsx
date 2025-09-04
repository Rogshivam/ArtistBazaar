import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import logo from "../assets/logo-temp.png"; 
import {
  Building2,
  ShoppingCart,
  TrendingUp,
  Package,
  Users,
  FileText,
  BarChart3,
  Settings,
  Home,
  Store
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const CustomerItems = [
  { title: "Dashboard", url: "/customer", icon: Home },
  { title: "Browse Products", url: "/customer/browse", icon: Package },
  { title: "My Orders", url: "/customer/orders", icon: ShoppingCart },
  { title: "Suppliers", url: "/customer/suppliers", icon: Building2 },
  { title: "Analytics", url: "/customer/analytics", icon: BarChart3 },
];

const sellerItems = [
  { title: "Dashboard", url: "/seller", icon: Store },
  { title: "My Products", url: "/seller/products", icon: Package },
  { title: "Orders", url: "/seller/orders", icon: FileText },
  { title: "Customers", url: "/seller/customers", icon: Users },
  { title: "Analytics", url: "/seller/analytics", icon: TrendingUp },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isCustomer = currentPath.includes('/customer');
  const isSeller = currentPath.includes('/seller');
  const items = isCustomer ? CustomerItems : sellerItems;
  const isCollapsed = state === "collapsed";

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-primary text-primary-foreground font-medium shadow-md" 
      : "hover:bg-accent/10 transition-colors";

  return (
    <Sidebar className={isCollapsed ? "w-14" : "w-64"} collapsible="icon">
      <SidebarContent className="border-r border-border/50">
        {/* Logo */}
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <img src={logo} alt="Logo" className="h-5 w-5 " />
            </div>
            {!isCollapsed && (
              <div>
                <h2 className="font-bold text-foreground">Artist Bazaar</h2>
                <p className="text-xs text-muted-foreground capitalize">
                  {isCustomer ? "Customer" : "Seller"} Portal
                </p>
              </div>
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={({ isActive }) => getNavCls({ isActive })}>
                      <item.icon className="mr-3 h-5 w-5" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings at bottom */}
        <div className="mt-auto p-4">
          <SidebarMenuButton asChild>
            <NavLink to="/settings" className="hover:bg-accent/10 transition-colors">
              <Settings className="mr-3 h-5 w-5" />
              {!isCollapsed && <span>Settings</span>}
            </NavLink>
          </SidebarMenuButton>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}