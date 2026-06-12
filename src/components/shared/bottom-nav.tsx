"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  Search,
  MessageCircle,
  User,
  LayoutDashboard,
  FileText,
  Zap,
  LogIn,
} from "lucide-react";
import { useUser, type UserRole } from "@/lib/auth-context";

interface NavItem {
  href: string;
  label: string;
  icon: typeof Home;
}

const visitorNav: NavItem[] = [
  { href: "/", label: "Accueil", icon: Home },
  { href: "/search", label: "Trouver un pro", icon: Search },
  { href: "/login", label: "Connexion", icon: LogIn },
];

const clientNav: NavItem[] = [
  { href: "/", label: "Accueil", icon: Home },
  { href: "/search", label: "Recherche", icon: Search },
  { href: "/demandes", label: "Mes demandes", icon: FileText },
  { href: "/messages", label: "Messagerie", icon: MessageCircle },
  { href: "/profile", label: "Mon Profil", icon: User },
];

const proNav: NavItem[] = [
  { href: "/", label: "Accueil", icon: Home },
  { href: "/opportunites", label: "Opportunités", icon: Zap },
  { href: "/messages", label: "Messagerie", icon: MessageCircle },
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/profile", label: "Profil Pro", icon: User },
];

const navByRole: Record<UserRole, NavItem[]> = {
  visitor: visitorNav,
  client: clientNav,
  pro: proNav,
};

export function BottomNav() {
  const pathname = usePathname();
  const { role } = useUser();

  if (!pathname || pathname.startsWith("/login") || pathname.startsWith("/messages/")) {
    return null;
  }

  const navItems = navByRole[role];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-t border-gray-100 safe-bottom lg:hidden">
      <div className="max-w-lg mx-auto flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 w-16 py-1 rounded-xl transition-colors duration-200",
                isActive
                  ? "text-brand-orange"
                  : "text-text-tertiary hover:text-text-secondary"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive && "fill-brand-orange/10")} />
              <span className="text-2xs font-medium text-center leading-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function DashboardNav() {
  return (
    <Link
      href="/dashboard"
      className="fixed bottom-20 right-4 z-50 w-12 h-12 bg-brand-orange rounded-2xl shadow-card flex items-center justify-center text-white active:scale-90 transition-transform duration-200"
    >
      <LayoutDashboard className="w-5 h-5" />
    </Link>
  );
}
