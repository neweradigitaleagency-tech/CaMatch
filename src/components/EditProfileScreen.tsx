import { useState, useRef } from "react";
import { ArrowLeft, User, Mail, Phone, Camera, Save } from "lucide-react";
import { useAuthStore } from "../stores/authStore";

interface EditProfileScreenProps { onBack: () => void; }

export default function EditProfileScreen({ onBack }: EditProfileScreenProps) {
  const user = useAuthStore((s) => s.user);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const [firstName, setFirstName] = useState(user?.user_metadata?.firstName || "Jean");
  const [lastName, setLastName] = useState(user?.user_metadata?.lastName || "Kouassi");
  const [email, setEmail] = useState(user?.email || "jean.kouassi@email.com");
  const [phone, setPhone] = useState(user?.phone || "+225 07 12 34 567");
  const [avatarUrl, setAvatarUrl] = useState(user?.user_metadata?.avatarUrl || "");
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    setSaving(true);
    updateProfile({ firstName, lastName, email, phone, avatarUrl });
    setTimeout(() => {
      setSaving(false);
      onBack();
    }, 300);
  };

  const handlePhotoPick = () => {
    fileRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatarUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const inputBase = "w-full h-11 px-4 text-[14px] bg-cm-surface border border-cm-border rounded-xl text-cm-text outline-none focus:border-cm-text-muted focus:ring-1 focus:ring-cm-text-muted/30 transition-all";

  return (
    <div className="flex flex-col w-full min-h-dynamic bg-cm-bg pb-8">
      <header className="flex items-center justify-between px-4 py-3 sticky top-0 z-10 bg-cm-bg border-b border-cm-border-soft">
        <button onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-xl border border-cm-border bg-cm-elevated cursor-pointer active:scale-90 transition-all">
          <ArrowLeft className="w-4 h-4 text-cm-text" />
        </button>
        <h1 className="text-[15px] font-bold text-cm-text">Mon profil</h1>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-1.5 text-[12px] font-semibold bg-cm-text text-cm-elevated px-4 py-2 rounded-full cursor-pointer hover:opacity-90 transition-all active:scale-[0.97] disabled:opacity-50">
          {saving ? (
            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save className="w-3.5 h-3.5" />
          )}
          Enregistrer
        </button>
      </header>

      <div className="px-4 pt-6 flex flex-col items-center mb-6">
        <button onClick={handlePhotoPick} className="relative group cursor-pointer mb-3">
          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-cm-border bg-cm-surface">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[32px] font-bold text-cm-text-muted">
                {firstName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="w-6 h-6 text-white" />
          </div>
        </button>
        <p className="text-[11px] text-cm-text-muted font-medium">Appuyez pour changer la photo</p>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      </div>

      <div className="px-4 space-y-3">
        <div>
          <label className="text-[10px] font-semibold text-cm-text-muted uppercase tracking-wider mb-1.5 block">Prénom</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cm-text-muted" />
            <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)}
              className={`${inputBase} pl-10`} placeholder="Votre prénom" />
          </div>
        </div>

        <div>
          <label className="text-[10px] font-semibold text-cm-text-muted uppercase tracking-wider mb-1.5 block">Nom</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cm-text-muted" />
            <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)}
              className={`${inputBase} pl-10`} placeholder="Votre nom" />
          </div>
        </div>

        <div>
          <label className="text-[10px] font-semibold text-cm-text-muted uppercase tracking-wider mb-1.5 block">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cm-text-muted" />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className={`${inputBase} pl-10`} placeholder="Votre email" />
          </div>
        </div>

        <div>
          <label className="text-[10px] font-semibold text-cm-text-muted uppercase tracking-wider mb-1.5 block">Téléphone</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cm-text-muted" />
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
              className={`${inputBase} pl-10`} placeholder="Votre téléphone" />
          </div>
        </div>
      </div>
    </div>
  );
}
