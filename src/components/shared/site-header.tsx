"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Menu, X, Search, MessageCircle, User, LayoutDashboard, Home,
  FileText, Zap, LogIn,
} from "lucide-react";
import { useUser, type UserRole } from "@/lib/auth-context";

interface NavLink {
  href: string;
  label: string;
  icon?: typeof Home;
}

const visitorLinks: NavLink[] = [
  { href: "/", label: "Accueil" },
  { href: "/search", label: "Trouver un pro" },
  { href: "/login", label: "Connexion" },
];

const clientLinks: NavLink[] = [
  { href: "/", label: "Accueil" },
  { href: "/search", label: "Recherche" },
  { href: "/demandes", label: "Mes demandes" },
  { href: "/messages", label: "Messagerie" },
];

const proLinks: NavLink[] = [
  { href: "/", label: "Accueil" },
  { href: "/opportunites", label: "Opportunités" },
  { href: "/messages", label: "Messagerie" },
  { href: "/dashboard", label: "Tableau de bord" },
];

const linksByRole: Record<UserRole, NavLink[]> = {
  visitor: visitorLinks,
  client: clientLinks,
  pro: proLinks,
};

export function SiteHeader() {
  const pathname = usePathname();
  const { role, logout } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);

  if (pathname?.startsWith("/login")) return null;

  const navLinks = linksByRole[role];
  const isVisitor = role === "visitor";

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-orange to-orange-600 rounded-xl flex items-center justify-center shadow-soft">
              <span className="text-white font-extrabold text-sm">Ç</span>
            </div>
            <span className="font-extrabold text-lg text-text-primary hidden sm:block">
              Ça Match
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/" && pathname?.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-brand-orange/10 text-brand-orange"
                      : "text-text-secondary hover:text-text-primary hover:bg-gray-50"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            {isVisitor ? (
              <Link
                href="/login"
                className="hidden sm:inline-flex items-center gap-2 bg-brand-orange text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:brightness-110 active:scale-[0.97] transition-all duration-200 shadow-cta"
              >
                <User className="w-4 h-4" />
                Connexion
              </Link>
            ) : (
              <button
                onClick={logout}
                className="hidden sm:inline-flex items-center gap-2 text-text-secondary text-sm font-medium px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Déconnexion
              </button>
            )}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden btn-ghost p-2.5 -mr-2"
              aria-label="Menu"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white">
          <div className="max-w-6xl mx-auto px-4 py-3 space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/" && pathname?.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                    isActive
                      ? "bg-brand-orange/10 text-brand-orange"
                      : "text-text-secondary hover:bg-gray-50"
                  )}
                >
                  {link.href === "/" && <Home className="w-4 h-4" />}
                  {link.href === "/search" && <Search className="w-4 h-4" />}
                  {link.href === "/messages" && <MessageCircle className="w-4 h-4" />}
                  {link.href === "/dashboard" && <LayoutDashboard className="w-4 h-4" />}
                  {link.href === "/demandes" && <FileText className="w-4 h-4" />}
                  {link.href === "/opportunites" && <Zap className="w-4 h-4" />}
                  {link.label}
                </Link>
              );
            })}
            {isVisitor ? (
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium bg-brand-orange text-white mt-3"
              >
                <User className="w-4 h-4" />
                Connexion / Inscription
              </Link>
            ) : (
              <button
                onClick={() => { logout(); setMenuOpen(false); }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium bg-gray-100 text-text-secondary mt-3 w-full"
              >
                <LogIn className="w-4 h-4 rotate-180" />
                Déconnexion
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
