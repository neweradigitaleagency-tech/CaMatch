import { ArrowLeft, User, Mail, Phone, Camera } from "lucide-react";

interface EditProfileScreenProps { onBack: () => void; }

export default function EditProfileScreen({ onBack }: EditProfileScreenProps) {
  return (
    <div className="flex flex-col w-full min-h-screen pb-32" style={{ background: "linear-gradient(180deg, #D8F3DC 0%, #F5F0E8 100%)" }}>
      <header className="flex items-center justify-between px-4 py-3 sticky top-0 z-10" style={{ background: "linear-gradient(180deg, #D8F3DC 0%, rgba(216,243,220,0.90) 100%)" }}>
        <button onClick={onBack} className="w-9 h-9 flex items-center justify-center rounded-[12px] bg-[rgba(255,255,255,0.60)] backdrop-blur-[8px] border border-[rgba(255,255,255,0.35)] cursor-pointer active:scale-90 transition-all">
          <ArrowLeft className="w-4 h-4 text-ca-text-primary" />
        </button>
        <h1 className="text-[15px] font-bold text-ca-text-primary">Modifier le profil</h1>
        <button className="text-[12px] font-semibold text-ca-green-primary cursor-pointer">Enregistrer</button>
      </header>

      <div className="px-4 pt-6 flex flex-col items-center mb-6">
        <div className="relative group cursor-pointer mb-3">
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-ca-green-light">
            <img alt="Photo" className="w-full h-full object-cover" referrerPolicy="no-referrer" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face" />
          </div>
          <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>

      <div className="mx-4 space-y-3">
        <div className="bg-[rgba(255,255,255,0.60)] backdrop-blur-[16px] rounded-[16px] border border-[rgba(255,255,255,0.50)] p-4 flex items-center gap-3">
          <User className="w-4 h-4 text-ca-text-muted shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-medium text-ca-text-muted uppercase tracking-wider">Nom</p>
            <p className="text-[14px] font-bold text-ca-text-primary">Jean Kouassi</p>
          </div>
        </div>
        <div className="bg-[rgba(255,255,255,0.60)] backdrop-blur-[16px] rounded-[16px] border border-[rgba(255,255,255,0.50)] p-4 flex items-center gap-3">
          <Mail className="w-4 h-4 text-ca-text-muted shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-medium text-ca-text-muted uppercase tracking-wider">Email</p>
            <p className="text-[14px] font-bold text-ca-text-primary">jean.kouassi@email.com</p>
          </div>
        </div>
        <div className="bg-[rgba(255,255,255,0.60)] backdrop-blur-[16px] rounded-[16px] border border-[rgba(255,255,255,0.50)] p-4 flex items-center gap-3">
          <Phone className="w-4 h-4 text-ca-text-muted shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-medium text-ca-text-muted uppercase tracking-wider">Téléphone</p>
            <p className="text-[14px] font-bold text-ca-text-primary">+225 07 12 34 567</p>
          </div>
        </div>
      </div>
    </div>
  );
}
