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
      input.type = "file"; input.accept = "image/*";
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) { const url = URL.createObjectURL(file); setCurrentAvatar(url); onChangeAvatar(url); }
      };
      input.click();
    } else { setAvatarViewOpen(true); }
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
    <div className="flex flex-col w-full min-h-screen bg-cm-bg pb-32">
      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <h1 className="text-[18px] font-display font-bold text-cm-text">Paramètres du compte</h1>
      </div>

      {/* Avatar card */}
      <div className="mx-4 mb-6">
        <div className="border border-cm-border rounded-[14px] bg-cm-elevated p-4 shadow-cm-sm flex items-center gap-3">
          <div className="relative group cursor-pointer shrink-0" onClick={handleAvatarClick}>
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-cm-border-soft">
              <img alt={clientName} className="w-full h-full object-cover" referrerPolicy="no-referrer" src={currentAvatar} />
            </div>
            {onChangeAvatar && (
              <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-5 h-5 text-white" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-[16px] font-bold text-cm-text">{clientName}</h2>
            <p className="text-[12px] text-cm-text-muted">{clientTag}</p>
          </div>
        </div>
      </div>

      {/* General section */}
      <div className="mx-4 mb-6">
        <p className="text-[11px] font-medium text-cm-text-muted uppercase tracking-wider mb-2 px-1">Général</p>
        <div className="border border-cm-border rounded-[14px] bg-cm-elevated overflow-hidden shadow-cm-sm">
          {generalItems.map((item, i) => (
            <div key={item.id} onClick={() => openNavigateTo(item.id)}
              className={`flex items-center gap-3 px-4 py-3.5 cursor-pointer active:bg-cm-accent-soft transition-colors ${
                i < generalItems.length - 1 ? "border-b border-cm-border" : ""
              }`}>
              <div className="w-9 h-9 rounded-[10px] bg-cm-accent-soft flex items-center justify-center shrink-0">
                <item.icon className="w-4 h-4 text-cm-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-cm-text">{item.label}</p>
                <p className="text-[11px] text-cm-text-muted mt-0.5">{item.desc}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-cm-text-muted shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* Preferences section */}
      <div className="mx-4 mb-6">
        <p className="text-[11px] font-medium text-cm-text-muted uppercase tracking-wider mb-2 px-1">Préférences</p>
        <div className="border border-cm-border rounded-[14px] bg-cm-elevated overflow-hidden shadow-cm-sm">
          {prefItems.map((item, i) => (
            <div key={item.id} onClick={() => { if (!item.toggle) { item.id === "settings" ? onOpenSettings() : openNavigateTo(item.id); } }}
              className={`flex items-center gap-3 px-4 py-3.5 cursor-pointer active:bg-cm-accent-soft transition-colors ${
                i < prefItems.length - 1 ? "border-b border-cm-border" : ""
              }`}>
              <div className="w-9 h-9 rounded-[10px] bg-cm-accent-soft flex items-center justify-center shrink-0">
                <item.icon className="w-4 h-4 text-cm-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-cm-text">{item.label}</p>
                <p className="text-[11px] text-cm-text-muted mt-0.5">{item.desc}</p>
              </div>
              {item.toggle ? <Toggle enabled={notifEnabled} onChange={setNotifEnabled} /> : <ChevronRight className="w-4 h-4 text-cm-text-muted shrink-0" />}
            </div>
          ))}
        </div>
      </div>

      <ImageViewer images={[{ url: currentAvatar, title: clientName }]} initialIndex={0} open={avatarViewOpen} onClose={() => setAvatarViewOpen(false)} />
    </div>
  );
}
