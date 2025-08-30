import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import logo from "../assets/logo-temp.png";
import { HashLink } from "react-router-hash-link";

// ✅ Inbox Component (same as you wrote)
function Inbox({ notifications, setNotifications }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative ml-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm"
      >
        Inbox
        {notifications.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
            {notifications.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-slate-900 text-white rounded-md shadow-xl z-50">
          <div className="flex justify-between items-center p-3 border-b border-gray-200">
            <h6 className="font-semibold">Notifications</h6>
            <button onClick={() => setIsOpen(false)} className="text-lg">
              &times;
            </button>
          </div>
          <div className="max-h-60 overflow-y-auto">
            {notifications.length > 0 ? (
              <ul className="divide-y divide-gray-100">
                {notifications.map((n, index) => (
                  <li key={n._id} className="p-3 flex justify-between text-sm">
                    <span>{n.message}</span>
                    <button
                      onClick={() =>
                        setNotifications((prev) =>
                          prev.filter((_, i) => i !== index)
                        )
                      }
                      className="text-red-500"
                    >
                      &times;
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-gray-500 py-4">
                No new notifications
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { name: "Home", path: "#home" },
    { name: "Chat", path: "#chat" },
    { name: "Products", path: "#products" },
    { name: "About", path: "#about" },
  ];

  // ✅ Track active hash
  const currentHash = window.location.hash;

  return (
    <header className="sticky top-0 left-0 right-0 z-50 backdrop-blur-md shadow-lg bg-foreground/70">
      <nav className="max-w-screen-xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center text-white font-bold text-lg px-12"
        >
          <img src={logo} alt="Logo" className="h-10 w-10 mr-2" />
          <span className="">Artist Bazaar</span>
        </Link>

        <div className="flex">
          {/* Desktop Nav */}
          <div className="hidden md:flex space-x-6">
            {navLinks.map((link) => (
              <HashLink
                smooth
                key={link.path}
                to={link.path}
                className={`text-sm hover:text-primary transition ${
                  currentHash === link.path ? "text-sand" : "text-white"
                }`}
              >
                {link.name}
              </HashLink>
            ))}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden text-white flex space-x-0.75"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-foreground/60 px-4 pb-4 pt-2 space-y-2">
          {navLinks.map((link) => (
            <HashLink
              smooth
              key={link.path}
              to={link.path}
              onClick={() => setIsMenuOpen(false)}
              className={`block text-sm py-1 ${
                currentHash === link.path ? "text-primary" : "text-white"
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
