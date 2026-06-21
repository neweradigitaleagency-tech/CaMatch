import { ArrowLeft, Sun, Moon, Sparkles, Bell, Globe, Info, ChevronRight, Shield, HelpCircle } from "lucide-react";
import { Toggle } from "./ui";

interface AppSettingsScreenProps {
  isDark: boolean;
  geminiApiKey: string;
  onToggleDarkMode: () => void;
  onUpdateApiKey: (key: string) => void;
  onBack: () => void;
  onNavigateToHelp?: () => void;
}

export default function AppSettingsScreen({
  isDark, geminiApiKey, onToggleDarkMode, onUpdateApiKey, onBack, onNavigateToHelp,
}: AppSettingsScreenProps) {
  return (
    <div className="flex flex-col w-full min-h-screen bg-brand-cream pb-8">
      <header className="flex items-center justify-between px-4 py-3 sticky top-0 z-10 bg-brand-cream/90 dark:bg-brand-forest/90 backdrop-blur-md">
        <button
          onClick={onBack}
          className="w-12 h-12 flex items-center justify-center rounded-full bg-white dark:bg-brand-forest text-brand-forest dark:text-brand-cream hover:bg-pale-mint dark:hover:bg-pale-mint/30 transition-colors shadow-sm cursor-pointer active:scale-95"
          aria-label="Retour"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-sans text-sm font-bold text-brand-forest dark:text-brand-cream">Paramètres</h1>
        <div className="w-9 h-9" />
      </header>

      <div className="px-4 space-y-3 mt-2">
        {/* Apparence */}
        <div className="bg-white dark:bg-brand-forest/10 p-4 rounded-2xl shadow-sm border border-pale-mint/15">
          <h3 className="text-caption font-medium text-secondary uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Sun className="w-3.5 h-3.5" /> Apparence
          </h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-pale-mint flex items-center justify-center">
                {isDark ? <Moon className="w-4 h-4 text-brand-forest" /> : <Sun className="w-4 h-4 text-brand-forest fill-amber-400" />}
              </div>
              <div>
                <p className="text-xs font-bold text-brand-forest">Mode sombre</p>
                <p className="text-caption text-secondary">{isDark ? "Palette Forêt active" : "Palette Crème active"}</p>
              </div>
            </div>
            <Toggle enabled={isDark} onChange={onToggleDarkMode} />
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white dark:bg-brand-forest/10 p-4 rounded-2xl shadow-sm border border-pale-mint/15 flex items-center justify-between cursor-pointer hover:bg-pale-mint/20 transition-colors" onClick={() => {}}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-pale-mint flex items-center justify-center">
              <Bell className="w-4 h-4 text-brand-forest" />
            </div>
            <div>
              <p className="text-xs font-bold text-brand-forest">Notifications</p>
              <p className="text-caption text-secondary">Push, SMS, WhatsApp, Email</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-secondary/40 shrink-0" />
        </div>

        {/* Langue */}
        <div className="bg-white dark:bg-brand-forest/10 p-4 rounded-2xl shadow-sm border border-pale-mint/15 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-pale-mint flex items-center justify-center">
              <Globe className="w-4 h-4 text-brand-forest" />
            </div>
            <div>
              <p className="text-xs font-bold text-brand-forest">Langue</p>
              <p className="text-caption text-secondary">Français</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-secondary/40 shrink-0" />
        </div>

        {/* Configuration IA */}
        <div className="bg-white dark:bg-brand-forest/10 p-4 rounded-2xl shadow-sm border border-pale-mint/15 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cm-green-light flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-cm-green" />
            </div>
            <div>
              <p className="text-xs font-bold text-brand-forest">Configuration IA</p>
              <p className="text-caption text-secondary">Clé API Gemini</p>
            </div>
          </div>
          <input
            type="password"
            value={geminiApiKey}
            onChange={(e) => onUpdateApiKey(e.target.value)}
            placeholder="Coller la clé API Gemini..."
            className="w-full h-10 px-3 text-xs bg-pale-mint/45 border-none rounded-xl text-brand-forest placeholder-secondary/50 outline-none focus:ring-1 focus:ring-cm-green font-mono"
          />
          <p className="text-caption text-secondary/70 italic">* Sauvegardée localement. Si vide, simulation locale.</p>
        </div>

        {/* Confidentialité */}
        <div className="bg-white dark:bg-brand-forest/10 p-4 rounded-2xl shadow-sm border border-pale-mint/15 flex items-center justify-between cursor-pointer hover:bg-pale-mint/20 transition-colors" onClick={() => {}}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-pale-mint flex items-center justify-center">
              <Shield className="w-4 h-4 text-brand-forest" />
            </div>
            <div>
              <p className="text-xs font-bold text-brand-forest">Confidentialité</p>
              <p className="text-caption text-secondary">Données et sécurité</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-secondary/40 shrink-0" />
        </div>

        {/* Aide */}
        {onNavigateToHelp && (
          <div className="bg-white dark:bg-brand-forest/10 p-4 rounded-2xl shadow-sm border border-pale-mint/15 flex items-center justify-between cursor-pointer hover:bg-pale-mint/20 transition-colors" onClick={onNavigateToHelp}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-pale-mint flex items-center justify-center">
                <HelpCircle className="w-4 h-4 text-brand-forest" />
              </div>
              <div>
                <p className="text-xs font-bold text-brand-forest">Aide & Support</p>
                <p className="text-caption text-secondary">FAQ, contact, assistance</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-secondary/40 shrink-0" />
          </div>
        )}

        {/* Version */}
        <div className="flex items-center justify-center gap-1.5 pt-4 pb-2">
          <Info className="w-3 h-3 text-secondary/50" />
          <span className="text-caption text-secondary/50 font-medium">Ça Match v2.0.0 • Abidjan, Côte d'Ivoire</span>
        </div>
      </div>
    </div>
  );
}
