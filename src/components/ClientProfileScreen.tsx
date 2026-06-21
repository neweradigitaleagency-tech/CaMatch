import { useState, type ComponentType } from "react";
import { ChevronRight, User, CreditCard, MapPin, Settings, Bell, HelpCircle, Camera } from "lucide-react";
import ImageViewer from "./ImageViewer";
import { Toggle } from "./ui";

interface ClientProfileScreenProps {
  clientName: string;
  clientAvatar: string;
  clientTag: string;
  onOpenSettings: () => void;
  openNavigateTo: (screen: string) => void;
  onChangeAvatar?: (url: string) => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  desc: string;
  toggle?: boolean;
}

export default function ClientProfileScreen({
  clientName, clientAvatar, clientTag, onOpenSettings, openNavigateTo, onChangeAvatar,
}: ClientProfileScreenProps) {
  const [avatarViewOpen, setAvatarViewOpen] = useState(false);
  const [currentAvatar, setCurrentAvatar] = useState(clientAvatar);
  const [notifEnabled, setNotifEnabled] = useState(true);

  const handleAvatarClick = () => {
    if (onChangeAvatar) {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          const url = URL.createObjectURL(file);
          setCurrentAvatar(url);
          onChangeAvatar(url);
        }
      };
      input.click();
    } else {
      setAvatarViewOpen(true);
    }
  };

  const generalItems: MenuItem[] = [
    { id: "edit-profile", label: "Modifier le profil", icon: User, desc: "Nom, email, photo" },
    { id: "payments", label: "Moyens de paiement", icon: CreditCard, desc: "Cartes, Mobile Money" },
    { id: "addresses", label: "Adresses enregistrées", icon: MapPin, desc: "Cocody, Plateau, Marcory" },
  ];

  const prefItems: MenuItem[] = [
    { id: "settings", label: "Paramètres", icon: Settings, desc: "Apparence, IA" },
    { id: "notifications", label: "Notifications", icon: Bell, desc: "Alertes, rappels", toggle: true },
    { id: "help", label: "Aide & support", icon: HelpCircle, desc: "FAQ, contact, signalement" },
  ];

  return (
    <div className="flex flex-col w-full min-h-screen bg-brand-cream pb-32">
      {/* Page title */}
      <div className="px-4 pt-5 pb-3">
        <h1 className="font-sans text-lg font-bold text-brand-forest">Paramètres du compte</h1>
      </div>

      {/* User header card */}
      <div className="mx-4 mb-6 bg-white dark:bg-brand-forest/10 rounded-2xl p-4 flex items-center gap-3 shadow-sm border border-pale-mint/10">
        <div className="relative group cursor-pointer shrink-0" onClick={handleAvatarClick}>
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-cm-green">
            <img alt={clientName} className="w-full h-full object-cover" referrerPolicy="no-referrer" src={currentAvatar} />
          </div>
          {onChangeAvatar && (
            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-5 h-5 text-white" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <h2 className="font-sans text-base font-bold text-brand-forest">{clientName}</h2>
          <p className="text-caption text-secondary font-medium">{clientTag}</p>
        </div>
      </div>

      {/* Section: Général */}
      <div className="mx-4 mb-6">
        <p className="text-caption font-medium text-secondary uppercase tracking-wider mb-2 px-1">Général</p>
        <div className="bg-white dark:bg-brand-forest/10 rounded-2xl overflow-hidden shadow-sm border border-pale-mint/10">
          {generalItems.map((item, i) => (
            <div
              key={item.id}
              onClick={() => openNavigateTo(item.id)}
              className={`flex items-center gap-3 px-4 py-3.5 cursor-pointer active:bg-pale-mint/30 transition-colors ${i < generalItems.length - 1 ? "border-b border-brand-cream" : ""}`}
            >
              <div className="w-9 h-9 rounded-xl bg-pale-mint flex items-center justify-center shrink-0">
                <item.icon className="w-4 h-4 text-brand-forest" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-brand-forest">{item.label}</p>
                <p className="text-caption text-secondary mt-0.5">{item.desc}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-secondary/40 shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* Section: Préférences */}
      <div className="mx-4 mb-6">
        <p className="text-caption font-medium text-secondary uppercase tracking-wider mb-2 px-1">Préférences</p>
        <div className="bg-white dark:bg-brand-forest/10 rounded-2xl overflow-hidden shadow-sm border border-pale-mint/10">
          {prefItems.map((item, i) => (
            <div
              key={item.id}
              onClick={() => { if (!item.toggle) { item.id === "settings" ? onOpenSettings() : openNavigateTo(item.id); } }}
              className={`flex items-center gap-3 px-4 py-3.5 cursor-pointer active:bg-pale-mint/30 transition-colors ${i < prefItems.length - 1 ? "border-b border-brand-cream" : ""}`}
            >
              <div className="w-9 h-9 rounded-xl bg-pale-mint flex items-center justify-center shrink-0">
                <item.icon className="w-4 h-4 text-brand-forest" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-brand-forest">{item.label}</p>
                <p className="text-caption text-secondary mt-0.5">{item.desc}</p>
              </div>
              {item.toggle ? (
                <Toggle
                  enabled={notifEnabled}
                  onChange={setNotifEnabled}
                />
              ) : (
                <ChevronRight className="w-4 h-4 text-secondary/40 shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>



      <ImageViewer
        images={[{ url: currentAvatar, title: clientName }]}
        initialIndex={0}
        open={avatarViewOpen}
        onClose={() => setAvatarViewOpen(false)}
      />
    </div>
  );
}
