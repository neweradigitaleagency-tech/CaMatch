import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { User, Briefcase, Store, ChevronDown } from "lucide-react";
import { useAuthStore } from "../../stores/authStore";

const MODE_CONFIG: Record<string, { label: string; icon: React.ReactNode; route: string }> = {
  client: { label: "Client", icon: <User className="w-3.5 h-3.5" />, route: "/" },
  pro: { label: "Pro", icon: <Briefcase className="w-3.5 h-3.5" />, route: "/pro" },
  supplier: { label: "Vendeur", icon: <Store className="w-3.5 h-3.5" />, route: "/supplier" },
};

export default function RoleSwitcher() {
  const { activeMode, availableModes, setActiveMode } = useAuthStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const nav = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  if (availableModes.length <= 1) return null;

  const current = MODE_CONFIG[activeMode] ?? MODE_CONFIG.client;
  const others = availableModes.filter((m) => m !== activeMode);

  const handleSwitch = (mode: string) => {
    const cfg = MODE_CONFIG[mode];
    setActiveMode(mode as "client" | "pro" | "supplier");
    setOpen(false);
    nav(cfg.route);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-cm-elevated border border-cm-border rounded-[10px] text-[11px] font-semibold text-cm-text cursor-pointer hover:border-cm-accent/30 transition-colors"
      >
        {current.icon}
        {current.label}
        <ChevronDown className={`w-3 h-3 text-cm-text-muted transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-36 bg-white border border-gray-200 rounded-[12px] shadow-lg overflow-hidden z-20">
          {others.map((mode) => {
            const cfg = MODE_CONFIG[mode];
            const isActiveRoute = location.pathname.startsWith(cfg.route);
            return (
              <button
                key={mode}
                onClick={() => handleSwitch(mode)}
                className={`w-full flex items-center gap-2 px-3 py-2.5 text-[12px] text-left cursor-pointer transition-colors hover:bg-gray-50 ${
                  isActiveRoute ? "text-cm-accent font-semibold" : "text-gray-700"
                }`}
              >
                {cfg.icon}
                {cfg.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
