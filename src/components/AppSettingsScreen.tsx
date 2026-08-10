import { useState, useCallback, useEffect } from "react";
import { ArrowLeft, Camera, ExternalLink, Trash2 } from "lucide-react";
import Toggle from "./ui/Toggle";
import BottomSheet from "./BottomSheet";
import SettingsSection from "./settings/SettingsSection";
import SettingsRow from "./settings/SettingsRow";
import VerificationBadge from "./settings/VerificationBadge";
import { SETTINGS_SECTIONS } from "../data/settingsConfig";
import type { SettingsRowConfig } from "../data/settingsConfig";

interface AppSettingsScreenProps {
  onBack: () => void;
  onNavigate: (path: string) => void;
  onSignOutAllDevices?: () => Promise<void>;
  onClearCache?: () => Promise<void>;
}

function ConfirmDialog({ open, title, message, confirmLabel, dangerous, onConfirm, onCancel }: {
  open: boolean; title: string; message: string; confirmLabel: string; dangerous?: boolean;
  onConfirm: () => void; onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-cm-elevated rounded-2xl w-full max-w-sm p-6 shadow-xl">
        <h3 className="text-[16px] font-bold text-cm-text">{title}</h3>
        <p className="text-[13px] text-cm-text-muted mt-2 leading-relaxed">{message}</p>
        <div className="flex gap-3 mt-6">
          <button onClick={onCancel} className="flex-1 h-11 rounded-xl bg-cm-surface text-cm-text text-[14px] font-semibold active:scale-[0.98] transition-transform">Annuler</button>
          <button onClick={onConfirm} className={`flex-1 h-11 rounded-xl text-white text-[14px] font-semibold active:scale-[0.98] transition-transform ${dangerous ? "bg-red-600" : "bg-[#2B2B2B]"}`}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

function PhotoSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <BottomSheet open={open} onClose={onClose} title="Photo de profil">
      <div className="space-y-2 pb-4">
        <button className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl hover:bg-cm-surface cursor-pointer active:scale-[0.98] transition-transform text-left">
          <div className="w-9 h-9 rounded-xl bg-cm-surface flex items-center justify-center"><Camera className="w-4 h-4 text-cm-text" /></div>
          <span className="text-[14px] font-semibold text-cm-text">Prendre une photo</span>
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl hover:bg-cm-surface cursor-pointer active:scale-[0.98] transition-transform text-left">
          <div className="w-9 h-9 rounded-xl bg-cm-surface flex items-center justify-center"><ExternalLink className="w-4 h-4 text-cm-text" /></div>
          <span className="text-[14px] font-semibold text-cm-text">Choisir depuis la galerie</span>
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl hover:bg-red-50 cursor-pointer active:scale-[0.98] transition-transform text-left text-red-600">
          <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center"><Trash2 className="w-4 h-4 text-red-600" /></div>
          <span className="text-[14px] font-semibold">Supprimer la photo</span>
        </button>
      </div>
    </BottomSheet>
  );
}

function NameSheet({ open, onClose, firstName, lastName, onSave }: {
  open: boolean; onClose: () => void; firstName: string; lastName: string; onSave: (first: string, last: string) => void;
}) {
  const [f, setF] = useState(firstName);
  const [l, setL] = useState(lastName);
  useEffect(() => { setF(firstName); setL(lastName); }, [firstName, lastName]);
  return (
    <BottomSheet open={open} onClose={onClose} title="Nom complet">
      <div className="space-y-4 pb-6">
        <div>
          <label className="text-[11px] font-semibold text-cm-text-soft uppercase tracking-wider mb-1.5 block">Prénom</label>
          <input value={f} onChange={(e) => setF(e.target.value)} className="w-full h-11 px-4 rounded-xl bg-cm-surface text-[14px] text-cm-text outline-none focus:ring-2 focus:ring-cm-accent/30" placeholder="Votre prénom" />
        </div>
        <div>
          <label className="text-[11px] font-semibold text-cm-text-soft uppercase tracking-wider mb-1.5 block">Nom</label>
          <input value={l} onChange={(e) => setL(e.target.value)} className="w-full h-11 px-4 rounded-xl bg-cm-surface text-[14px] text-cm-text outline-none focus:ring-2 focus:ring-cm-accent/30" placeholder="Votre nom" />
        </div>
        <button onClick={() => { onSave(f, l); onClose(); }} className="w-full h-11 rounded-xl bg-[#2B2B2B] text-white text-[14px] font-semibold active:scale-[0.98] transition-transform">Enregistrer</button>
      </div>
    </BottomSheet>
  );
}

function UsernameSheet({ open, onClose, username, onSave }: {
  open: boolean; onClose: () => void; username: string; onSave: (val: string) => void;
}) {
  const [val, setVal] = useState(username);
  useEffect(() => { setVal(username); }, [username]);
  return (
    <BottomSheet open={open} onClose={onClose} title="Nom d'utilisateur">
      <div className="space-y-4 pb-6">
        <div>
          <label className="text-[11px] font-semibold text-cm-text-soft uppercase tracking-wider mb-1.5 block">Nom d'utilisateur</label>
          <input value={val} onChange={(e) => setVal(e.target.value)} className="w-full h-11 px-4 rounded-xl bg-cm-surface text-[14px] text-cm-text outline-none focus:ring-2 focus:ring-cm-accent/30" placeholder="@utilisateur" />
        </div>
        <button onClick={() => { onSave(val); onClose(); }} className="w-full h-11 rounded-xl bg-[#2B2B2B] text-white text-[14px] font-semibold active:scale-[0.98] transition-transform">Enregistrer</button>
      </div>
    </BottomSheet>
  );
}

function PhoneSheet({ open, onClose, phone, onSave }: {
  open: boolean; onClose: () => void; phone: string; onSave: (val: string) => void;
}) {
  const [val, setVal] = useState(phone);
  useEffect(() => { setVal(phone); }, [phone]);
  return (
    <BottomSheet open={open} onClose={onClose} title="Numéro de téléphone">
      <div className="space-y-4 pb-6">
        <div>
          <label className="text-[11px] font-semibold text-cm-text-soft uppercase tracking-wider mb-1.5 block">Téléphone</label>
          <input value={val} onChange={(e) => setVal(e.target.value)} type="tel" className="w-full h-11 px-4 rounded-xl bg-cm-surface text-[14px] text-cm-text outline-none focus:ring-2 focus:ring-cm-accent/30" placeholder="+225 XX XX XX XX" />
        </div>
        <button className="w-full h-11 rounded-xl bg-cm-surface text-cm-text text-[14px] font-semibold active:scale-[0.98] transition-transform">Envoyer le code de vérification</button>
        <button onClick={() => { onSave(val); onClose(); }} className="w-full h-11 rounded-xl bg-[#2B2B2B] text-white text-[14px] font-semibold active:scale-[0.98] transition-transform">Enregistrer</button>
      </div>
    </BottomSheet>
  );
}

function EmailSheet({ open, onClose, email, onSave }: {
  open: boolean; onClose: () => void; email: string; onSave: (val: string) => void;
}) {
  const [val, setVal] = useState(email);
  useEffect(() => { setVal(email); }, [email]);
  return (
    <BottomSheet open={open} onClose={onClose} title="Adresse email">
      <div className="space-y-4 pb-6">
        <div>
          <label className="text-[11px] font-semibold text-cm-text-soft uppercase tracking-wider mb-1.5 block">Email</label>
          <input value={val} onChange={(e) => setVal(e.target.value)} type="email" className="w-full h-11 px-4 rounded-xl bg-cm-surface text-[14px] text-cm-text outline-none focus:ring-2 focus:ring-cm-accent/30" placeholder="email@example.com" />
        </div>
        <button className="w-full h-11 rounded-xl bg-cm-surface text-cm-text text-[14px] font-semibold active:scale-[0.98] transition-transform">Vérifier l'adresse email</button>
        <button onClick={() => { onSave(val); onClose(); }} className="w-full h-11 rounded-xl bg-[#2B2B2B] text-white text-[14px] font-semibold active:scale-[0.98] transition-transform">Enregistrer</button>
      </div>
    </BottomSheet>
  );
}

function DOBSheet({ open, onClose, dob, onSave }: {
  open: boolean; onClose: () => void; dob: string; onSave: (val: string) => void;
}) {
  const [val, setVal] = useState(dob);
  useEffect(() => { setVal(dob); }, [dob]);
  return (
    <BottomSheet open={open} onClose={onClose} title="Date de naissance">
      <div className="space-y-4 pb-6">
        <div>
          <label className="text-[11px] font-semibold text-cm-text-soft uppercase tracking-wider mb-1.5 block">Date de naissance</label>
          <input value={val} onChange={(e) => setVal(e.target.value)} type="date" className="w-full h-11 px-4 rounded-xl bg-cm-surface text-[14px] text-cm-text outline-none focus:ring-2 focus:ring-cm-accent/30" />
        </div>
        <button onClick={() => { onSave(val); onClose(); }} className="w-full h-11 rounded-xl bg-[#2B2B2B] text-white text-[14px] font-semibold active:scale-[0.98] transition-transform">Enregistrer</button>
      </div>
    </BottomSheet>
  );
}

export default function AppSettingsScreen({ onBack, onNavigate, onSignOutAllDevices, onClearCache }: AppSettingsScreenProps) {
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    "2fa": false, "allow-calls": true, "allow-messages": true,
    "location-sharing": false, "marketing": false, "updates": true, "reminders": true,
  });
  const [confirmItem, setConfirmItem] = useState<SettingsRowConfig | null>(null);
  const [storageSubtitle, setStorageSubtitle] = useState("Calcul…");
  const [sheet, setSheet] = useState<string | null>(null);

  const [userData, setUserData] = useState({
    firstName: "Jean", lastName: "Dupont", username: "@jeandupont",
    phone: "+225 01 02 03 04", email: "jean@example.com", dob: "1990-06-15",
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let total = 0;
      if ("caches" in window) {
        for (const name of await caches.keys()) {
          const cache = await caches.open(name);
          for (const req of await cache.keys()) {
            const resp = await cache.match(req);
            if (resp) total += (await resp.clone().blob()).size;
          }
        }
      }
      if (cancelled) return;
      setStorageSubtitle(`${(total / 1024).toFixed(0)} Ko en cache`);
    })();
    return () => { cancelled = true; };
  }, []);

  const handleToggle = useCallback((id: string) => {
    setToggles((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const handleConfirmAction = useCallback(async () => {
    if (!confirmItem) return;
    const id = confirmItem.id;
    if (id === "signout-all" && onSignOutAllDevices) await onSignOutAllDevices();
    else if (id === "clear-cache" && onClearCache) await onClearCache();
    setConfirmItem(null);
  }, [confirmItem, onSignOutAllDevices, onClearCache]);

  const handleRowClick = useCallback((item: SettingsRowConfig) => {
    if (item.disabled) return;

    if (item.kind === "navigation" && item.route) {
      onNavigate(item.route);
    } else if (item.kind === "status" && item.route) {
      onNavigate(item.route);
    } else if (item.kind === "action") {
      if (["photo", "name", "username", "phone", "email", "dob"].includes(item.id)) {
        setSheet(item.id);
      } else if (item.requiresConfirmation) {
        setConfirmItem(item);
      } else {
        if (item.id === "download-data") alert("Le téléchargement de vos données sera bientôt disponible.");
        else if (item.id === "export-activity") alert("L'export de votre activité sera bientôt disponible.");
      }
    }
  }, [onNavigate]);

  const renderTrailing = (item: SettingsRowConfig) => {
    if (item.kind === "toggle") {
      return <Toggle enabled={toggles[item.id] ?? false} onChange={() => handleToggle(item.id)} />;
    }
    if (item.kind === "status" && item.statusValue) {
      return <VerificationBadge status={item.statusValue} />;
    }
    if (item.kind === "info" && item.id.startsWith("perm-")) {
      return (
        <button onClick={(e) => { e.stopPropagation(); alert("Gérez cette autorisation depuis les paramètres de votre navigateur."); }}
          className="text-[11px] font-medium text-cm-accent flex items-center gap-1 hover:underline">
          Ouvrir <ExternalLink className="w-3 h-3" />
        </button>
      );
    }
    return undefined;
  };

  return (
    <div className="flex flex-col w-full min-h-dynamic bg-cm-bg pb-12">
      <header className="flex items-center justify-between px-4 py-3 sticky top-0 z-10 bg-cm-bg">
        <button onClick={onBack} className="p-1 cursor-pointer active:scale-[0.97] transition-transform touch-min">
          <ArrowLeft className="w-5 h-5 text-cm-text" />
        </button>
        <h1 className="text-[15px] font-bold text-cm-text">Paramètres du compte</h1>
        <div className="w-9 h-9" />
      </header>

      <div className="pt-2">
        {SETTINGS_SECTIONS.map((section) => (
          <SettingsSection key={section.id} label={section.label} description={section.description} dangerous={section.dangerous}>
            {section.items.map((item, idx) => {
              const isLast = idx === section.items.length - 1;
              const capturedItem = item;
              return (
                <div key={item.id}>
                  <SettingsRow
                    icon={item.icon}
                    label={item.label}
                    subtitle={
                      item.id === "name" ? `${userData.firstName} ${userData.lastName}`
                      : item.id === "username" ? userData.username
                      : item.id === "phone" ? userData.phone
                      : item.id === "email" ? userData.email
                      : item.id === "dob" ? userData.dob
                      : item.id === "storage-usage" ? storageSubtitle
                      : item.subtitle
                    }
                    trailing={renderTrailing(item)}
                    onClick={() => handleRowClick(capturedItem)}
                    dangerous={item.dangerous}
                    disabled={item.disabled}
                  />
                  {!isLast && <div className="mx-4 h-px bg-cm-border/40" />}
                </div>
              );
            })}
          </SettingsSection>
        ))}
      </div>

      <ConfirmDialog open={!!confirmItem} title={confirmItem?.confirmationTitle || "Confirmer"}
        message={confirmItem?.confirmationMessage || "Êtes-vous sûr ?"}
        confirmLabel={confirmItem?.id === "delete" ? "Supprimer" : confirmItem?.id === "deactivate" ? "Désactiver" : confirmItem?.id === "signout-all" ? "Déconnecter" : confirmItem?.id === "clear-cache" ? "Vider" : "Confirmer"}
        dangerous={confirmItem?.dangerous} onConfirm={handleConfirmAction} onCancel={() => setConfirmItem(null)} />

      <PhotoSheet open={sheet === "photo"} onClose={() => setSheet(null)} />
      <NameSheet open={sheet === "name"} onClose={() => setSheet(null)}
        firstName={userData.firstName} lastName={userData.lastName}
        onSave={(f, l) => setUserData((p) => ({ ...p, firstName: f, lastName: l }))} />
      <UsernameSheet open={sheet === "username"} onClose={() => setSheet(null)}
        username={userData.username}
        onSave={(v) => setUserData((p) => ({ ...p, username: v }))} />
      <PhoneSheet open={sheet === "phone"} onClose={() => setSheet(null)}
        phone={userData.phone}
        onSave={(v) => setUserData((p) => ({ ...p, phone: v }))} />
      <EmailSheet open={sheet === "email"} onClose={() => setSheet(null)}
        email={userData.email}
        onSave={(v) => setUserData((p) => ({ ...p, email: v }))} />
      <DOBSheet open={sheet === "dob"} onClose={() => setSheet(null)}
        dob={userData.dob}
        onSave={(v) => setUserData((p) => ({ ...p, dob: v }))} />
    </div>
  );
}
