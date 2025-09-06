import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, ChangeEvent } from "react";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Bell, Search, User, LogOut } from "lucide-react";
import { useAlert } from '@/context/alert/AlertContext';
import { Input } from "@/components/ui/input";

// Types
interface User {
  name?: string;
  role?: string;
}



export function DashboardHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isUserSidebarOpen, setIsUserSidebarOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // const { getCartItemCount } = useCart();
  // const { getWishlistCount } = useWishlist();
  const { showSuccess } = useAlert();
  const location = useLocation();
  const navigate = useNavigate();
  const currentHash = location.hash || '#home';

  // Check auth
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('auth-token');
      const userData = localStorage.getItem('user-data');
      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser({ name: parsedUser.name || 'User', role: parsedUser.role || 'Customer' });
        } catch {
          setUser(null);
        }
      } else setUser(null);
    };
    checkAuth();
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    setIsMenuOpen(false);
    setIsUserSidebarOpen(false);
    showSuccess('Logged out successfully');
    navigate('/');
  };
  return (
    <header className="h-16 bg-card/50 backdrop-blur border-b border-border/50 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger />

        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products, orders, suppliers..."
            className="pl-10 bg-background/60"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full text-xs flex items-center justify-center text-white">
            3
          </span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white">
                  JD
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center text-beige hover:text-muddy-brown"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}