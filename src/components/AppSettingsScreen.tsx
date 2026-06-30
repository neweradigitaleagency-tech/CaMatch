import { ArrowLeft, Sun, Moon, Globe, Bell, HelpCircle, Info, ChevronRight } from "lucide-react";

interface AppSettingsScreenProps {
  isDark: boolean;
  onToggleDarkMode: () => void;
  onBack: () => void;
  onNavigateToHelp?: () => void;
  onNavigateToNotifications?: () => void;
  onNavigateToLanguage?: () => void;
}

export default function AppSettingsScreen({
  isDark, onToggleDarkMode, onBack, onNavigateToHelp, onNavigateToNotifications, onNavigateToLanguage,
}: AppSettingsScreenProps) {
  return (
    <div className="flex flex-col w-full min-h-screen bg-gray-50 pb-8">
      <header className="flex items-center justify-between px-4 py-3 sticky top-0 z-10 bg-white border-b border-gray-100">
        <button onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 bg-white cursor-pointer active:scale-90 transition-all">
          <ArrowLeft className="w-4 h-4 text-gray-700" />
        </button>
        <h1 className="text-[15px] font-bold text-gray-900">Paramètres</h1>
        <div className="w-9 h-9" />
      </header>

      <div className="px-4 pt-4 space-y-3">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-1 mb-1">Général</p>

        {/* Mode sombre */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center">
              {isDark ? <Moon className="w-4 h-4 text-gray-900" /> : <Sun className="w-4 h-4 text-gray-900" />}
            </div>
            <div>
              <p className="text-[13px] font-semibold text-gray-900">Mode sombre</p>
              <p className="text-[11px] text-gray-400">{isDark ? "Activé" : "Désactivé"}</p>
            </div>
          </div>
          <button onClick={onToggleDarkMode}
            className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer shrink-0 ${isDark ? "bg-gray-900" : "bg-gray-200"}`}>
            <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${isDark ? "translate-x-5 left-0.5" : "translate-x-0.5 left-0"}`} />
          </button>
        </div>

        {/* Langue */}
        <button onClick={onNavigateToLanguage}
          className="w-full bg-white border border-gray-200 rounded-2xl p-4 flex items-center justify-between shadow-sm cursor-pointer hover:bg-gray-50 transition-colors text-left">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center">
              <Globe className="w-4 h-4 text-gray-900" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-gray-900">Langue</p>
              <p className="text-[11px] text-gray-400">Français</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
        </button>

        {/* Notifications */}
        {onNavigateToNotifications && (
          <button onClick={onNavigateToNotifications}
            className="w-full bg-white border border-gray-200 rounded-2xl p-4 flex items-center justify-between shadow-sm cursor-pointer hover:bg-gray-50 transition-colors text-left">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center">
                <Bell className="w-4 h-4 text-gray-900" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-gray-900">Notifications</p>
                <p className="text-[11px] text-gray-400">Push, SMS, email</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
          </button>
        )}

        {/* Aide */}
        {onNavigateToHelp && (
          <button onClick={onNavigateToHelp}
            className="w-full bg-white border border-gray-200 rounded-2xl p-4 flex items-center justify-between shadow-sm cursor-pointer hover:bg-gray-50 transition-colors text-left">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center">
                <HelpCircle className="w-4 h-4 text-gray-900" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-gray-900">Aide & Support</p>
                <p className="text-[11px] text-gray-400">FAQ, nous contacter</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
          </button>
        )}
      </div>

      {/* Version */}
      <div className="flex items-center justify-center gap-1.5 pt-8 pb-4 mt-auto">
        <Info className="w-3 h-3 text-gray-300" />
        <span className="text-[11px] text-gray-400 font-medium">Ça Match v2.0.0 • Abidjan</span>
      </div>
    </div>
  );
}
