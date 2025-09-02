import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import { Menu, X, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Avatar from "boring-avatars";
import logo from "../assets/logo-temp.png";

// Types
interface User {
  name?: string;
  avatarUrl?: string;
}

interface Cart {
  [productId: string]: number; // productId -> quantity
}

interface NavbarProps {
  cart?: Cart;
  onCartClick?: () => void;
  user?: User;
}

export default function Navbar({ cart = {}, onCartClick, user }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const currentHash = location.hash || "#home"; // default to home

  // ✅ Cart logic function
  const getCartItemCount = (): number =>
    Object.values(cart).reduce((sum, qty) => sum + qty, 0);

  const cartItemsCount = getCartItemCount();

  const navLinks = [
    { name: "Home", path: "#home" },
    { name: "Chat", path: "#chat" },
    { name: "Products", path: "/products" },
    { name: "About", path: "#about" },
  ];

  return (
    <header className="sticky top-0 left-0 right-0 z-50 backdrop-blur-md shadow-lg bg-foreground/70">
      <nav className="max-w-screen-xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center text-white font-bold text-lg">
          <img src={logo} alt="Logo" className="h-10 w-10 mr-2" />
          <span>Artist Bazaar</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex space-x-6">
          {navLinks.map((link) => (
            link.path.startsWith('#') ? (
              <HashLink
                smooth
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors ${
                  currentHash === link.path ? "text-sand" : "text-white hover:text-primary"
                }`}
              >
                {link.name}
              </HashLink>
            ) : (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors ${
                  location.pathname === link.path ? "text-sand" : "text-white hover:text-primary"
                }`}
              >
                {link.name}
              </Link>
            )
          ))}
        </div>

        {/* Right side: Cart + User */}
        <div className="flex items-center space-x-3">
          {/* Cart */}
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={onCartClick}
          >
            <ShoppingCart className="h-5 w-5" />
            {cartItemsCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {cartItemsCount}
              </Badge>
            )}
          </Button>

          {/* User */}
          <Button variant="ghost" size="icon" className="rounded-full overflow-hidden">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <Avatar size={32} name={user?.name || "Guest"} variant="beam" />
            )}
          </Button>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-foreground/90 px-4 pb-4 pt-2 space-y-2">
          {navLinks.map((link) => (
            <HashLink
              smooth
              key={link.path}
              to={link.path}
              onClick={() => setIsMenuOpen(false)}
              className={`block text-sm py-1 font-medium transition-colors ${
                currentHash === link.path ? "text-orange-600" : "text-white hover:text-primary"
              }`}
            >
              {link.name}
            </HashLink>
          ))}
        </div>
      )}
    </header>
  );
}
