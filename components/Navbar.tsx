"use client";

import Link from "next/link";
import { SignedIn, SignedOut, SignOutButton } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { Menu, X, Home, DollarSign, LayoutDashboard, LucideIcon } from "lucide-react";

// Tipos para los componentes de navegación
interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  icon?: LucideIcon;
}

interface MobileNavLinkProps {
  href: string;
  children: React.ReactNode;
  icon?: LucideIcon;
}

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    // Aplicar modo oscuro por defecto al montar
    document.documentElement.classList.add('dark');

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const NavLink = ({ href, children, icon: Icon }: NavLinkProps) => (
    <Link
      href={href}
      className="group relative flex items-center gap-2 px-3 py-2 text-sm font-medium transition-all duration-200 ease-out text-neutral-400 hover:text-neutral-100 hover:scale-[1.02] active:scale-[0.98] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1px] after:bg-gradient-to-r after:from-white after:to-neutral-400 after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300"
    >
      {Icon && <Icon size={16} className="opacity-70 group-hover:opacity-100 transition-opacity duration-200" />}
      {children}
    </Link>
  );

  const MobileNavLink = ({ href, children, icon: Icon }: MobileNavLinkProps) => (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-3 text-base font-medium text-neutral-300 hover:text-white transition-colors duration-200 border-b border-neutral-800 last:border-b-0"
      onClick={() => setIsOpen(false)}
    >
      {Icon && <Icon size={18} />}
      {children}
    </Link>
  );

  return (
    <>
      <nav className={`
        fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out
        ${isScrolled 
          ? 'bg-neutral-950/80 backdrop-blur-xl border-b border-neutral-800/50' 
          : 'bg-neutral-950/90 backdrop-blur-sm'
        }
      `}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2 group">
                <div className="w-8 h-8 bg-gradient-to-br from-white to-neutral-300 rounded-md flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
                  <div className="w-3 h-3 bg-neutral-950 rounded-sm"></div>
                </div>
                <span className="text-lg font-semibold text-white tracking-tight">
                  PDF Analyzer
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              <NavLink href="/" icon={Home}>Home</NavLink>
              <NavLink href="/pricing" icon={DollarSign}>Pricing</NavLink>
              <NavLink href="/dashboard" icon={LayoutDashboard}>Dashboard</NavLink>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Clerk Auth Components */}
              <div className="flex items-center space-x-2">
                <SignedOut>
                  <Link
                    href="/sign-in"
                    className="px-4 py-2 text-sm font-medium text-neutral-400 hover:text-neutral-100 transition-colors duration-200"
                  >
                    Sign In
                  </Link>
                </SignedOut>
                
                <SignedIn>
                  <SignOutButton>
                    <button className="px-4 py-2 text-sm font-medium text-neutral-400 hover:text-neutral-100 transition-colors duration-200 hover:bg-neutral-800 rounded-lg">
                      Sign Out
                    </button>
                  </SignOutButton>
                </SignedIn>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-lg text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-all duration-200"
                aria-label="Toggle menu"
              >
                {isOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={`
          md:hidden transition-all duration-300 ease-out overflow-hidden
          ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
        `}>
          <div className="border-t border-neutral-800 bg-neutral-950/90 backdrop-blur-sm">
            <div className="py-2">
              <MobileNavLink href="/" icon={Home}>Home</MobileNavLink>
              <MobileNavLink href="/pricing" icon={DollarSign}>Pricing</MobileNavLink>
              <MobileNavLink href="/dashboard" icon={LayoutDashboard}>Dashboard</MobileNavLink>
              
              <div className="border-t border-neutral-800 mt-2 pt-2">
                <SignedOut>
                  <div className="px-4 py-2">
                    <Link
                      href="/sign-in"
                      className="block w-full px-4 py-2 text-center text-sm font-medium text-neutral-400 hover:text-neutral-100 border border-neutral-700 rounded-lg transition-colors duration-200"
                    >
                      Sign In
                    </Link>
                  </div>
                </SignedOut>
                
                <SignedIn>
                  <div className="px-4 py-2">
                    <SignOutButton>
                      <button className="block w-full px-4 py-2 text-center text-sm font-medium text-neutral-400 hover:text-neutral-100 border border-neutral-700 rounded-lg transition-colors duration-200">
                        Sign Out
                      </button>
                    </SignOutButton>
                  </div>
                </SignedIn>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Spacer for fixed navbar */}
      <div className="h-16"></div>
    </>
  );
};

export default Navbar;