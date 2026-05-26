"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Phone, Search, User, LogOut, LayoutDashboard } from "lucide-react";
import { supabase } from "../../lib/supabase";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  useEffect(() => {
    checkUser();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
    window.location.href = "/";
  }

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Businesses", href: "/listings" },
    { name: "Pricing", href: "/pricing" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <nav className="fixed w-full z-50 bg-white/95 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <img 
              src="https://assets.cdn.filesafe.space/Y75D8z0j5aPHXtDyWr3y/media/6a15d683ecd67a415b8e9625.png"
              alt="STL Business Guide"
              className="h-10 w-auto"
            />
            <div>
              <span className="text-2xl font-bold text-[#371a5b]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                STL Business
              </span>
              <span className="text-2xl font-bold text-[#54afe6]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {" "}Guide
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-gray-700 hover:text-[#54afe6] font-medium transition-colors duration-200"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/search"
              className="flex items-center space-x-2 text-gray-600 hover:text-[#54afe6] transition-colors"
            >
              <Search className="w-4 h-4" />
              <span className="font-medium">Search</span>
            </Link>
            <a
              href="tel:314-886-8084"
              className="flex items-center space-x-2 text-gray-600 hover:text-[#54afe6] transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span className="font-medium">314-886-8084</span>
            </a>
            
            {user ? (
              /* Account Menu */
              <div className="relative">
                <button
                  onClick={() => setShowAccountMenu(!showAccountMenu)}
                  className="flex items-center space-x-2 bg-gradient-to-r from-[#371a5b] to-[#bb7ce4] text-white px-4 py-2 rounded-full font-medium hover:opacity-90 transition"
                >
                  <User className="w-4 h-4" />
                  <span>My Account</span>
                </button>
                
                {showAccountMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                    <Link
                      href="/dashboard"
                      className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50"
                      onClick={() => setShowAccountMenu(false)}
                    >
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      Dashboard
                    </Link>
                    <Link
                      href="/dashboard/settings"
                      className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50"
                      onClick={() => setShowAccountMenu(false)}
                    >
                      <User className="w-4 h-4 mr-2" />
                      Settings
                    </Link>
                    <hr className="my-2" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Login Button */
              <Link
                href="/auth/login"
                className="bg-gradient-to-r from-[#54afe6] to-[#bb7ce4] px-6 py-2.5 rounded-full text-white font-semibold shadow-lg hover:shadow-xl transition"
              >
                List Your Business
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-4 pt-2 pb-6 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 text-gray-700 hover:text-[#54afe6] font-medium rounded-lg hover:bg-gray-50"
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-4 space-y-3">
              <Link
                href="/search"
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600"
              >
                <Search className="w-4 h-4" />
                <span>Search</span>
              </Link>
              <a
                href="tel:314-886-8084"
                className="flex items-center space-x-2 px-3 py-2 text-gray-600"
              >
                <Phone className="w-4 h-4" />
                <span>314-886-8084</span>
              </a>
              
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-2 px-3 py-2 text-[#371a5b] font-medium"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Dashboard</span>
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="flex items-center space-x-2 w-full px-3 py-2 text-red-600"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <Link
                  href="/auth/login"
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center bg-gradient-to-r from-[#54afe6] to-[#bb7ce4] px-6 py-3 rounded-full text-white font-semibold"
                >
                  List Your Business
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
