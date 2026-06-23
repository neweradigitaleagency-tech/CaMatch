import { ArrowLeft, User, Mail, Phone, Camera } from "lucide-react";

interface EditProfileScreenProps { onBack: () => void; }

export default function EditProfileScreen({ onBack }: EditProfileScreenProps) {
  return (
    <div className="flex flex-col w-full min-h-screen bg-cm-bg pb-32">
      <header className="flex items-center justify-between px-4 py-3 sticky top-0 z-10 bg-cm-elevated border-b border-cm-border">
        <button onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-[12px] border border-cm-border bg-cm-elevated cursor-pointer active:scale-90 transition-all">
          <ArrowLeft className="w-4 h-4 text-cm-text" />
        </button>
        <h1 className="text-[15px] font-bold text-cm-text">Modifier le profil</h1>
        <button className="text-[12px] font-semibold text-cm-accent cursor-pointer">Enregistrer</button>
      </header>

      <div className="px-4 pt-6 flex flex-col items-center mb-6">
        <div className="relative group cursor-pointer mb-3">
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-cm-border-soft">
            <img alt="Photo" className="w-full h-full object-cover" referrerPolicy="no-referrer" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face" />
          </div>
          <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>

      <div className="mx-4 space-y-3">
        <div className="bg-cm-elevated border border-cm-border rounded-[16px] p-4 flex items-center gap-3 shadow-cm-sm">
          <User className="w-4 h-4 text-cm-text-muted shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-medium text-cm-text-muted uppercase tracking-wider">Nom</p>
            <p className="text-[14px] font-bold text-cm-text">Jean Kouassi</p>
          </div>
        </div>
        <div className="bg-cm-elevated border border-cm-border rounded-[16px] p-4 flex items-center gap-3 shadow-cm-sm">
          <Mail className="w-4 h-4 text-cm-text-muted shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-medium text-cm-text-muted uppercase tracking-wider">Email</p>
            <p className="text-[14px] font-bold text-cm-text">jean.kouassi@email.com</p>
          </div>
        </div>
        <div className="bg-cm-elevated border border-cm-border rounded-[16px] p-4 flex items-center gap-3 shadow-cm-sm">
          <Phone className="w-4 h-4 text-cm-text-muted shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-medium text-cm-text-muted uppercase tracking-wider">Téléphone</p>
            <p className="text-[14px] font-bold text-cm-text">+225 07 12 34 567</p>
          </div>
        </div>
      </div>
    </div>
  );
}
