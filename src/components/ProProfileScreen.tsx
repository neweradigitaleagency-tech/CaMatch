import { useRef, type ComponentType } from "react";
import {
  UserIcon, Star, MapPin, Phone, Mail, Shield, BadgeCheck,
  Settings, ChevronRight, Edit3, Clock, DollarSign,
  Plus, CheckCircle, ArrowLeftRight,
  Bell, HelpCircle, Image as ImageIcon, Trash2, Map,
} from "lucide-react";
import { ProfessionalDetails, Service, PortfolioItem, ProVerification, VerificationLevel } from "../types";

interface Props {
  pro: ProfessionalDetails;
  services: Service[];
  verification: ProVerification;
  portfolio: PortfolioItem[];
  onToggleRole: () => void;
  onNavigateToEdit: () => void;
  onNavigateToVerification: () => void;
  onNavigateToNotifications: () => void;
  onNavigateToHelp: () => void;
  onAddPortfolioItem: (item: Omit<PortfolioItem, "id" | "createdAt">) => void;
  onRemovePortfolioItem: (id: string) => void;
  onAddService: () => void;
}

const VERIFICATION_LABELS: Record<VerificationLevel, { label: string; color: string }> = {
  none: { label: "Non vérifié", color: "text-gray-500" },
  phone: { label: "Téléphone vérifié", color: "text-gray-600" },
  id: { label: "Identité vérifiée", color: "text-blue-600" },
  background: { label: "Confiance vérifiée", color: "text-purple-600" },
  certified: { label: "Expert certifié", color: "text-amber-600" },
  elite: { label: "Niveau Élite", color: "text-red-600" },
};

export default function ProProfileScreen({
  pro, services, verification, portfolio, onToggleRole, onNavigateToEdit,
  onNavigateToVerification, onNavigateToNotifications, onNavigateToHelp,
  onAddPortfolioItem, onRemovePortfolioItem, onAddService,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      onAddPortfolioItem({
        imageUrl: reader.result as string, caption: "",
        category: pro.category,
      });
    };
    reader.readAsDataURL(file);
  };

  const vLevel = verification.level;
  const vInfo = VERIFICATION_LABELS[vLevel];

  return (
    <div className="px-4 py-4 pb-32 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-sans text-base font-extrabold">Mon Profil Pro</h2>
        <button onClick={onNavigateToEdit} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all cursor-pointer bg-brand-lime text-brand-forest hover:bg-brand-lime/80">
          <Edit3 className="w-3.5 h-3.5" />Modifier
        </button>
      </div>

      {/* Avatar & Identity */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-pale-mint/15 flex items-center gap-3">
        <div className="relative">
          <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-brand-lime">
            <img alt={pro.name} className="w-full h-full object-cover" src={pro.avatarUrl} />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="font-sans text-sm font-extrabold flex items-center gap-1.5">
            {pro.name}{pro.isVerified && <BadgeCheck className="w-3.5 h-3.5 text-brand-lime" />}
          </h3>
          <p className="text-[11px] text-on-surface-variant font-medium">{pro.title}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="flex items-center gap-0.5 text-[10px]"><Star className="w-3 h-3 fill-amber-400 text-amber-400" />{pro.rating}/50</span>
            <span className="text-[10px] text-on-surface-variant">{pro.reviewCount} avis</span>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-pale-mint/15 space-y-2.5">
        <div className="flex items-center gap-2 border-b border-pale-mint/20 pb-2.5">
          <Shield className="w-3.5 h-3.5 text-brand-lime" /><span className="text-[10px] font-bold uppercase tracking-wider">Informations</span>
        </div>
        <InfoRow icon={MapPin} label="Localisation" value={pro.locationNeighborhood} />
        <InfoRow icon={Map} label="Zone d'intervention" value={`10 km autour de ${pro.locationNeighborhood}`} />
        <InfoRow icon={Phone} label="Téléphone" value={pro.phoneNumber} />
        <InfoRow icon={Mail} label="Email" value={pro.email} />
        <InfoRow icon={DollarSign} label="Taux horaire" value={`${pro.hourlyRateXOF.toLocaleString()} F/h`} />
        <InfoRow icon={DollarSign} label="Frais déplacement" value="5 000 F" />
        <InfoRow icon={Star} label="Expérience" value={`${pro.experienceYears} ans`} />
      </div>

      {/* Settings Menu */}
      <SettingsMenuRow icon={Shield} label="Vérification" subtitle={vInfo.label} color={vInfo.color} onClick={onNavigateToVerification} />
      <SettingsMenuRow icon={Bell} label="Notifications" subtitle="Push, SMS, WhatsApp, Email" onClick={onNavigateToNotifications} />
      <SettingsMenuRow icon={HelpCircle} label="Aide & Support" subtitle="FAQ, chat, assistance" onClick={onNavigateToHelp} />

      {/* Portfolio */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-pale-mint/15 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-sans text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5" /> Portfolio
          </h4>
          <button onClick={() => fileInputRef.current?.click()} className="w-7 h-7 rounded-full bg-brand-lime/20 flex items-center justify-center cursor-pointer">
            <Plus className="w-4 h-4 text-brand-forest" />
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </div>
        {portfolio.length === 0 ? (
          <p className="text-xs text-on-surface-variant py-3 text-center">Ajoutez des photos de vos réalisations</p>
        ) : (
          <div className="grid grid-cols-3 gap-1.5">
            {portfolio.map((item) => (
              <div key={item.id} className="relative rounded-xl overflow-hidden aspect-square">
                <img src={item.imageUrl} alt={item.caption || "Réalisation"} className="w-full h-full object-cover" />
                <button onClick={() => onRemovePortfolioItem(item.id)} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/50 flex items-center justify-center cursor-pointer">
                  <Trash2 className="w-2.5 h-2.5 text-white" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Services & Tarifs */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-pale-mint/15 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-sans text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1.5">
            <Settings className="w-3.5 h-3.5" /> Services & Tarifs
          </h4>
          <button onClick={onAddService} className="w-7 h-7 rounded-full bg-brand-lime/20 flex items-center justify-center cursor-pointer">
            <Plus className="w-4 h-4 text-brand-forest" />
          </button>
        </div>
        <div className="flex gap-2 text-[10px]">
          <span className="bg-pale-mint px-2.5 py-1 rounded-full font-medium">Taux horaire: {pro.hourlyRateXOF.toLocaleString()} F</span>
          <span className="bg-pale-mint px-2.5 py-1 rounded-full font-medium">Déplacement: 5 000 F</span>
        </div>
        {services.length === 0 ? (
          <p className="text-xs text-on-surface-variant py-2">Aucun service défini</p>
        ) : (
          services.map((s) => (
            <div key={s.id} className="flex items-center justify-between py-2 border-b border-pale-mint/10 last:border-0">
              <div>
                <p className="text-xs font-bold">{s.name}</p>
                <p className="text-[9px] text-on-surface-variant mt-0.5">{s.description}</p>
              </div>
              <span className="text-xs font-extrabold">{s.priceEstimateXOF.toLocaleString()} F</span>
            </div>
          ))
        )}
      </div>

      {/* Travel Fee Breakdown */}
      <div className="bg-brand-forest text-white p-4 rounded-2xl">
        <p className="text-[9px] text-white/50 uppercase tracking-wider font-bold mb-2">Exemple de tarification</p>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="text-[10px] text-white/60">Main d'œuvre (2h)</p>
            <p className="text-sm font-extrabold">{(pro.hourlyRateXOF * 2).toLocaleString()} F</p>
          </div>
          <div className="flex-1">
            <p className="text-[10px] text-white/60">Déplacement</p>
            <p className="text-sm font-extrabold">5 000 F</p>
          </div>
          <div className="border-l border-white/20 pl-3">
            <p className="text-[10px] text-white/60">Total</p>
            <p className="text-sm font-extrabold text-brand-lime">{(pro.hourlyRateXOF * 2 + 5000).toLocaleString()} F</p>
          </div>
        </div>
      </div>

      {/* Switch to Client */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-pale-mint/15 cursor-pointer" onClick={onToggleRole}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-pale-mint flex items-center justify-center"><ArrowLeftRight className="w-4 h-4 text-brand-forest" /></div>
            <div>
              <h4 className="font-sans text-[10px] font-extrabold uppercase tracking-wider">Mode Client</h4>
              <p className="text-[9px] text-on-surface-variant font-medium mt-0.5">Revenir à l'espace client</p>
            </div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-secondary" />
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="w-3.5 h-3.5 text-secondary shrink-0" />
      <div className="flex-1">
        <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">{label}</p>
        <p className="text-xs font-medium">{value}</p>
      </div>
    </div>
  );
}

function SettingsMenuRow({ icon: Icon, label, subtitle, color, onClick }: {
  icon: ComponentType<{ className?: string }>; label: string; subtitle: string; color?: string; onClick: () => void;
}) {
  return (
    <div onClick={onClick} className="bg-white p-3.5 rounded-2xl shadow-sm border border-pale-mint/15 flex items-center justify-between cursor-pointer hover:bg-pale-mint/30 transition-all active:scale-[0.98]">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-pale-mint flex items-center justify-center"><Icon className="w-4 h-4 text-brand-forest" /></div>
        <div>
          <h4 className="text-xs font-extrabold">{label}</h4>
          <p className={`text-[10px] font-medium mt-0.5 ${color || "text-on-surface-variant"}`}>{subtitle}</p>
        </div>
      </div>
      <ChevronRight className="w-3.5 h-3.5 text-secondary shrink-0" />
    </div>
  );
}

