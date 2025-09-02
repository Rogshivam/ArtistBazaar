import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';
import { Menu, X, ShoppingCart, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Avatar from 'boring-avatars';
import axios from 'axios';
import logo from '../assets/logo-temp.png';
import CartSidebar from '@/components/CartSidebar';
import { useCart } from '@/context/CartContext';

// Types for type safety
interface User {
  name?: string;
  avatarUrl?: string;
  role?: string; // e.g., 'artisan', 'admin'
}

interface NavLink {
  name: string;
  path: string;
  isHash?: boolean; // Whether the link uses hash navigation
}

// Navbar component
const Navbar: React.FC = () => {
  // State for mobile menu toggle
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  // State for cart sidebar visibility
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  // State for authenticated user
  const [user, setUser] = useState<User | null>(null);
  // Get cart context
  const { cart, updateCartQuantity, removeFromCart, getCartItemCount } = useCart();
  // Get current location for active link highlighting
  const location = useLocation();
  const currentHash = location.hash || '#home';

  // Fetch user data on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await axios.get('/api/artisans/me', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUser(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch user:', err);
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsMenuOpen(false);
  };

  // Navigation links for the artisan platform
  const navLinks: NavLink[] = [
    { name: 'Home', path: '#home', isHash: true },
    { name: 'Products', path: '/products' },
    { name: 'Chat', path: '#chat', isHash: true }, // Added Chat button
    { name: 'About', path: '#about', isHash: true },
  ];

  return (
    <header className="sticky top-0 left-0 right-0 z-50 backdrop-blur-md shadow-lg bg-dark-mud">
      <nav className="max-w-screen-xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo Section */}
        <Link to="/" className="flex items-center text-beige font-bold text-lg">
          <img src={logo} alt="Artist Bazaar Logo" className="h-10 w-10 mr-2" />
          <span>Artist Bazaar</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-6">
          {navLinks.map((link) =>
            link.isHash ? (
              // Hash links for in-page navigation
              <HashLink
                key={link.path}
                to={link.path}
                smooth
                className={`text-sm font-medium transition-colors ${
                  currentHash === link.path ? 'text-muted-green' : 'text-beige hover:text-muddy-brown'
                }`}
              >
                {link.name}
              </HashLink>
            ) : (
              // Regular links for page navigation
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors ${
                  location.pathname === link.path ? 'text-muted-green' : 'text-beige hover:text-muddy-brown'
                }`}
              >
                {link.name}
              </Link>
            )
          )}
          {/* Logout Button (Desktop) */}
          {user && (
            <Button
              variant="ghost"
              size="sm"
              className="text-beige hover:text-muddy-brown"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-1" />
              Logout
            </Button>
          )}
        </div>

        {/* Right Side: Cart and User */}
        <div className="flex items-center space-x-3">
          {/* Cart Button */}
          <Button
            variant="ghost"
            size="icon"
            className="relative text-beige hover:text-muddy-brown"
            onClick={() => setIsCartOpen(true)}
          >
            <ShoppingCart className="h-5 w-5" />
            {getCartItemCount() > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-600"
              >
                {getCartItemCount()}
              </Badge>
            )}
          </Button>

          {/* Cart Sidebar */}
          <CartSidebar
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            cart={cart}
            onUpdateQuantity={updateCartQuantity}
            onRemoveItem={removeFromCart}
          />

          {/* User Avatar */}
          <Button variant="ghost" size="icon" className="rounded-full overflow-hidden">
            <Avatar
              size={32}
              name={user?.name || 'Guest'}
              variant="beam"
              colors={['#5C4033', '#6B7280', '#F5F5DC', '#3F2F2A', '#8A9A5B']} // Muddy theme colors
            />
          </Button>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden text-beige hover:text-muddy-brown"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-dark-mud/90 px-4 pb-4 pt-2 space-y-2">
          {navLinks.map((link) =>
            link.isHash ? (
              <HashLink
                key={link.path}
                to={link.path}
                smooth
                onClick={() => setIsMenuOpen(false)}
                className={`block text-sm py-1 font-medium transition-colors ${
                  currentHash === link.path ? 'text-muted-green' : 'text-beige hover:text-muddy-brown'
                }`}
              >
                {link.name}
              </HashLink>
            ) : (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className={`block text-sm py-1 font-medium transition-colors ${
                  location.pathname === link.path ? 'text-muted-green' : 'text-beige hover:text-muddy-brown'
                }`}
              >
                {link.name}
              </Link>
            )
          )}
          {/* Logout Button (Mobile) */}
          {user && (
            <button
              className="block text-sm py-1 font-medium text-beige hover:text-muddy-brown"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 inline mr-1" />
              Logout
            </button>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;