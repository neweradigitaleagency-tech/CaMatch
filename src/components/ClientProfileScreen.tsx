import { useState, type ComponentType } from "react";
import { ChevronRight, User, CreditCard, MapPin, Settings, Bell, HelpCircle, Camera } from "lucide-react";
import ImageViewer from "./ImageViewer";
import { Toggle } from "./ui";
import GlassCard from "./ui/GlassCard";

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
    <div className="flex flex-col w-full min-h-screen pb-32" style={{ background: "linear-gradient(180deg, #D8F3DC 0%, #F5F0E8 100%)" }}>
      <div className="px-4 pt-5 pb-3">
        <h1 className="text-[18px] font-bold text-ca-text-primary">Paramètres du compte</h1>
      </div>

      <div className="mx-4 mb-6">
        <GlassCard className="p-4 flex items-center gap-3">
          <div className="relative group cursor-pointer shrink-0" onClick={handleAvatarClick}>
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-ca-green-light">
              <img alt={clientName} className="w-full h-full object-cover" referrerPolicy="no-referrer" src={currentAvatar} />
            </div>
            {onChangeAvatar && (
              <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-5 h-5 text-white" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-[16px] font-bold text-ca-text-primary">{clientName}</h2>
            <p className="text-[12px] text-ca-text-muted">{clientTag}</p>
          </div>
        </GlassCard>
      </div>

      <div className="mx-4 mb-6">
        <p className="text-[11px] font-medium text-ca-text-muted uppercase tracking-wider mb-2 px-1">Général</p>
        <GlassCard className="!p-0 overflow-hidden">
          {generalItems.map((item, i) => (
            <div key={item.id} onClick={() => openNavigateTo(item.id)}
              className={`flex items-center gap-3 px-4 py-3.5 cursor-pointer active:bg-[rgba(255,255,255,0.50)] transition-colors ${
                i < generalItems.length - 1 ? "border-b border-[rgba(232,224,208,0.30)]" : ""
              }`}>
              <div className="w-9 h-9 rounded-[12px] bg-[rgba(255,255,255,0.50)] flex items-center justify-center shrink-0">
                <item.icon className="w-4 h-4 text-ca-text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-ca-text-primary">{item.label}</p>
                <p className="text-[11px] text-ca-text-muted mt-0.5">{item.desc}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-ca-text-muted shrink-0" />
            </div>
          ))}
        </GlassCard>
      </div>

      <div className="mx-4 mb-6">
        <p className="text-[11px] font-medium text-ca-text-muted uppercase tracking-wider mb-2 px-1">Préférences</p>
        <GlassCard className="!p-0 overflow-hidden">
          {prefItems.map((item, i) => (
            <div key={item.id} onClick={() => { if (!item.toggle) { item.id === "settings" ? onOpenSettings() : openNavigateTo(item.id); } }}
              className={`flex items-center gap-3 px-4 py-3.5 cursor-pointer active:bg-[rgba(255,255,255,0.50)] transition-colors ${
                i < prefItems.length - 1 ? "border-b border-[rgba(232,224,208,0.30)]" : ""
              }`}>
              <div className="w-9 h-9 rounded-[12px] bg-[rgba(255,255,255,0.50)] flex items-center justify-center shrink-0">
                <item.icon className="w-4 h-4 text-ca-text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-ca-text-primary">{item.label}</p>
                <p className="text-[11px] text-ca-text-muted mt-0.5">{item.desc}</p>
              </div>
              {item.toggle ? <Toggle enabled={notifEnabled} onChange={setNotifEnabled} /> : <ChevronRight className="w-4 h-4 text-ca-text-muted shrink-0" />}
            </div>
          ))}
        </GlassCard>
      </div>

      <ImageViewer images={[{ url: currentAvatar, title: clientName }]} initialIndex={0} open={avatarViewOpen} onClose={() => setAvatarViewOpen(false)} />
    </div>
  );
}
