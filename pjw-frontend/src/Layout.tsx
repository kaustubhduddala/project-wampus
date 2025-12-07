import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Home, Info, ShoppingBag, MapPin, Award, Menu, X, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import Chatbot from "./components/Chatbot";

const navigationItems = [
  { title: "Home", url: createPageUrl("Home"), icon: Home },
  { title: "About", url: createPageUrl("About"), icon: Info },
  { title: "Shop", url: createPageUrl("Shop"), icon: ShoppingBag },
  { title: "Deliveries", url: createPageUrl("Deliveries"), icon: MapPin },
  { title: "Sponsors", url: createPageUrl("Sponsors"), icon: Award },
];

export default function Layout({ children }) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleLogin = () => {
    base44.auth.redirectToLogin();
  };

  return (
    <div className="min-h-screen bg-white">
      <style>{`
        * {
          font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        
        .neo-brutal-shadow {
          box-shadow: 6px 6px 0px #000;
        }
        
        .neo-brutal-shadow-sm {
          box-shadow: 3px 3px 0px #000;
        }
        
        .neo-brutal-border {
          border: 3px solid #000;
        }
        
        .neo-brutal-border-thin {
          border: 2px solid #000;
        }
        
        .neo-button {
          border: 3px solid #000;
          box-shadow: 4px 4px 0px #000;
          transition: all 0.1s;
        }
        
        .neo-button:hover {
          transform: translate(2px, 2px);
          box-shadow: 2px 2px 0px #000;
        }
        
        .neo-button:active {
          transform: translate(4px, 4px);
          box-shadow: 0px 0px 0px #000;
        }
      `}</style>

      {/* Header */}
      <header className="bg-[#22C55E] neo-brutal-border border-b-4 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link to={createPageUrl("Home")} className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white neo-brutal-border flex items-center justify-center neo-brutal-shadow-sm">
                <span className="text-2xl font-black">PJW</span>
              </div>
              <div className="hidden md:block">
                <h1 className="text-xl font-black text-white leading-tight">PROJECT WAMPUS</h1>
                <p className="text-xs font-bold text-black">Fighting Homelessness in Austin</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-2">
              {navigationItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <Link key={item.title} to={item.url}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      size="sm"
                      className={`neo-button font-bold ${
                        isActive
                          ? "bg-white text-black hover:bg-white"
                          : "bg-transparent text-white hover:bg-white hover:text-black border-0 shadow-none"
                      }`}
                    >
                      <item.icon className="w-4 h-4 mr-1" />
                      {item.title}
                    </Button>
                  </Link>
                );
              })}
              <Button 
                onClick={handleLogin}
                size="sm"
                className="neo-button bg-transparent text-white hover:bg-white hover:text-black font-bold ml-1"
              >
                <LogIn className="w-4 h-4 mr-1" />
                Login
              </Button>
              <Button 
                size="sm"
                className="neo-button bg-black text-white hover:bg-gray-900 font-bold ml-1"
              >
                DONATE
              </Button>
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden neo-button bg-white p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="lg:hidden mt-4 pb-4 space-y-2">
              {navigationItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <Link
                    key={item.title}
                    to={item.url}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className={`w-full neo-button font-bold ${
                        isActive
                          ? "bg-white text-black"
                          : "bg-transparent text-white border-0 shadow-none"
                      }`}
                    >
                      <item.icon className="w-4 h-4 mr-2" />
                      {item.title}
                    </Button>
                  </Link>
                );
              })}
              <Button 
                onClick={handleLogin}
                className="neo-button bg-transparent text-white border-white font-bold w-full"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Login
              </Button>
              <Button className="neo-button bg-black text-white font-bold w-full">
                DONATE NOW
              </Button>
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-black text-white neo-brutal-border border-t-4 py-12 mt-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-black mb-4">PROJECT WAMPUS</h3>
              <p className="text-sm">Fighting homelessness one meal at a time in Austin, TX</p>
            </div>
            <div>
              <h4 className="font-black mb-4">QUICK LINKS</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to={createPageUrl("About")} className="hover:text-[#22C55E]">About Us</Link></li>
                <li><Link to={createPageUrl("Shop")} className="hover:text-[#22C55E]">Shop</Link></li>
                <li><Link to={createPageUrl("Sponsors")} className="hover:text-[#22C55E]">Sponsors</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-black mb-4">GET INVOLVED</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#volunteer" className="hover:text-[#22C55E]">Volunteer</a></li>
                <li><a href="#donate" className="hover:text-[#22C55E]">Donate</a></li>
                <li><a href="#partner" className="hover:text-[#22C55E]">Partner With Us</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-black mb-4">CONTACT</h4>
              <p className="text-sm">Email: info@projectwampus.org</p>
              <p className="text-sm">Austin, TX</p>
            </div>
          </div>
          <div className="border-t-2 border-white mt-8 pt-8 text-center text-sm">
            <p>&copy; 2024 Project Wampus. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Floating Chatbot */}
      <Chatbot />
    </div>
  );
}
