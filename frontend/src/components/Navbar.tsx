import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';
import { Menu, X, ShoppingCart, LogOut, Heart, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import logo from '../assets/logo-temp.png';

import { useCart } from '@/context/CartContext/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAlert } from '@/context/alert/AlertContext';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useDrawer } from '@/context/DrawerContext/DrawerContext'; 

// Types
interface User {
  name?: string;
  role?: string;
}

interface NavLink {
  name: string;
  path: string;
  isHash?: boolean;
}

interface NavbarProps {
  onCartOpen?: () => void;
  onWishlistOpen?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onCartOpen, onWishlistOpen }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // ✅ Use global drawer context
  const { openCart, openWishlist } = useDrawer();

  const { getCartItemCount } = useCart();
  const { getWishlistCount } = useWishlist();
  const { showSuccess } = useAlert();
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const currentHash = location.hash || '#home';
  const sellerId = localStorage.getItem("sellerId");

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
    showSuccess('Logged out successfully');
    navigate('/');
  };

  const navLinks: NavLink[] = [
    { name: 'Home', path: '/', isHash: true },
    { name: 'Products', path: '/products' },
    { name: 'Artisans', path: '/artisans' },
    { name: 'About', path: '/about', isHash: true },
    ...(user ? [{ name: 'Chat', path: '/chat' }] : []),
  ];

  const renderNavLinks = (isMobile = false) =>
    navLinks.map((link) =>
      link.isHash ? (
        <HashLink
          key={link.path}
          to={link.path}
          smooth
          onClick={() => isMobile && setIsMenuOpen(false)}
          className={`block text-sm font-medium transition-colors ${
            currentHash === link.path ? 'text-muted-green' : 'text-beige hover:text-muddy-brown'
          }`}
        >
          {link.name}
        </HashLink>
      ) : (
        <Link
          key={link.path}
          to={link.path}
          onClick={() => isMobile && setIsMenuOpen(false)}
          className={`block text-sm font-medium transition-colors ${
            location.pathname === link.path ? 'text-muted-green' : 'text-beige hover:text-muddy-brown'
          }`}
        >
          {link.name}
        </Link>
      )
    );

  return (
    <header className="sticky top-0 inset-x-0 z-50 bg-foreground/80 backdrop-blur-md shadow-md overflow-x-hidden">
      <nav className="w-full max-w-screen-xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center text-beige font-bold text-lg">
          <img src={logo} alt="Artist Bazaar Logo" className="h-10 w-10 mr-2" />
          <span>Artist Bazaar</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-6">
          {renderNavLinks()}
        </div>

        {/* Right Side */}
        <div className="flex items-center space-x-3">
          {user && (
            <>
              {/* Wishlist ✅ UPDATED onClick */}
              <Button
                variant="ghost"
                size="icon"
                className="relative text-beige hover:text-muddy-brown"
                onClick={onWishlistOpen || openWishlist} // ✅ Uses prop OR context
                aria-label="Open wishlist"
              >
                <Heart className="h-5 w-5" />
                {getWishlistCount() > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-600">
                    {getWishlistCount()}
                  </Badge>
                )}
              </Button>

              {/* Cart ✅ UPDATED onClick */}
              <Button
                variant="ghost"
                size="icon"
                className="relative text-beige hover:text-muddy-brown"
                onClick={onCartOpen || openCart} // ✅ Uses prop OR context
                aria-label="Open cart"
              >
                <ShoppingCart className="h-5 w-5" />
                {getCartItemCount() > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-600">
                    {getCartItemCount()}
                  </Badge>
                )}
              </Button>

              {/* Avatar with Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full" aria-label="User menu">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="/placeholder.svg" alt={user?.name || "User"} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white">
                        {user?.name ? user.name.slice(0, 2).toUpperCase() : "JD"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48 bg-card/90 backdrop-blur-md text-foreground" align="end">
                  <DropdownMenuItem asChild>
                    <Link to="/" className="flex items-center w-full">
                      <User className="w-4 h-4 mr-2" />
                      Home
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      to={`/seller/${sellerId}`}
                      className="flex items-center w-full"
                    >
                      <User className="w-4 h-4 mr-2" />
                      {sellerId ? "Profile" : "Login"}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <button onClick={handleLogout} className="flex items-center w-full">
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
          {!user && (
            <Button className="bg-primary text-white hover:bg-primary/90" onClick={() => navigate('/login')}>
              Login
            </Button>
          )}
          {/* Mobile Toggle */}
          <button className="md:hidden text-beige hover:text-muddy-brown" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Nav */}
      {isMenuOpen && (
        <div className="md:hidden bg-dark-mud/90 px-4 pb-4 pt-2 space-y-2">
          {renderNavLinks(true)}
          {!user ? null : (
            <button
              onClick={handleLogout}
              className="block text-sm py-1 font-medium text-beige hover:text-muddy-brown"
            />
          )}
        </div>
      )}

      {/* ✅ Drawers REMOVED - handled globally in App.tsx */}
    </header>
  );
};

export default Navbar;
