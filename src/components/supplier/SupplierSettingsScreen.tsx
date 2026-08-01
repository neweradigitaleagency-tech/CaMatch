import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Bell, Shield, LogOut, ChevronRight, Building2, Users, Clock, Smartphone, Globe, Monitor, CircleUser, Mail, Phone, MapPin, ToggleLeft } from "lucide-react"
import { useAuthStore } from "../../stores/authStore"
import { useTeamMembers, useSessions } from "../../hooks/supplier/useSupplierSettings"
import { ROLE_LABELS } from "../../types/supplier"
import type { SupplierUserRole } from "../../types/supplier"

type SettingsTab = "entreprise" | "notifications" | "securite" | "equipe"

const TABS: { key: SettingsTab; icon: typeof Building2; label: string }[] = [
  { key: "entreprise", icon: Building2, label: "Entreprise" },
  { key: "notifications", icon: Bell, label: "Notifications" },
  { key: "securite", icon: Shield, label: "Sécurité" },
  { key: "equipe", icon: Users, label: "Équipe" },
]

export default function SupplierSettingsScreen() {
  const navigate = useNavigate()
  const logout = useAuthStore((s) => s.logout)
  const user = useAuthStore((s) => s.user)
  const [tab, setTab] = useState<SettingsTab>("entreprise")
  const [notifEmailOrder, setNotifEmailOrder] = useState(true)
  const [notifEmailPayment, setNotifEmailPayment] = useState(true)
  const [notifEmailDispute, setNotifEmailDispute] = useState(false)
  const [notifSmsOrder, setNotifSmsOrder] = useState(true)
  const [notifSmsDelivery, setNotifSmsDelivery] = useState(true)
  const [notifPushOrder, setNotifPushOrder] = useState(true)
  const [notifPushPayment, setNotifPushPayment] = useState(true)
  const [notifPushStock, setNotifPushStock] = useState(false)
  const [twoFactor, setTwoFactor] = useState(false)

  const { data: team = [] } = useTeamMembers()
  const { data: sessions = [] } = useSessions()

  const company = {
    name: "ABC Quincaillerie",
    owner: "Mamadou Diallo",
    email: "contact@abc-quincaillerie.ci",
    phone: "+225 07 12 34 56 78",
    address: "Zone Industrielle de Yopougon",
    city: "Abidjan, Côte d'Ivoire",
    hours: "Lun–Ven 7h30–18h00, Sam 8h00–13h00",
  }

  function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
    return (
      <div onClick={() => onChange(!on)}
        className={`relative w-9 h-[18px] rounded-full transition-colors cursor-pointer shrink-0 ${on ? "bg-cm-green" : "bg-cm-border-soft"}`}>
        <div className={`absolute top-[1px] w-4 h-4 bg-cm-elevated rounded-full shadow-sm transition-transform ${on ? "translate-x-[18px]" : "translate-x-[1px]"}`} />
      </div>
    )
  }

  function TabBtn({ t, active }: { t: typeof TABS[number]; active: boolean }) {
    return (
      <button onClick={() => setTab(t.key)}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
          active ? "bg-cm-green text-white" : "text-cm-text-muted hover:bg-cm-surface"
        }`}>
        <t.icon className="w-3.5 h-3.5" />
        {t.label}
      </button>
    )
  }

  function SectionCard({ title, icon: Icon, children }: { title: string; icon: typeof Bell; children: React.ReactNode }) {
    return (
      <div className="bg-cm-elevated rounded-xl border border-cm-border overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-cm-border/40">
          <Icon className="w-4 h-4 text-cm-text-muted" />
          <h2 className="text-[13px] font-semibold text-cm-text">{title}</h2>
        </div>
        <div className="divide-y divide-cm-border/40">
          {children}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div>
        <h1 className="text-[20px] font-bold text-cm-text">Paramètres</h1>
        <p className="text-[12px] text-cm-text-muted mt-1">Gérez votre entreprise et vos préférences</p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {TABS.map((t) => <TabBtn key={t.key} t={t} active={tab === t.key} />)}
      </div>

      {tab === "entreprise" && (
        <SectionCard title="Informations de l'entreprise" icon={Building2}>
          {[
            { label: "Raison sociale", value: company.name, icon: Building2 },
            { label: "Propriétaire", value: company.owner, icon: CircleUser },
            { label: "Email", value: company.email, icon: Mail },
            { label: "Téléphone", value: company.phone, icon: Phone },
            { label: "Adresse", value: company.address, icon: MapPin },
            { label: "Ville", value: company.city, icon: Globe },
            { label: "Horaires", value: company.hours, icon: Clock },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3 px-4 py-3">
              <item.icon className="w-4 h-4 text-cm-border-soft shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] text-cm-text-muted">{item.label}</p>
                <p className="text-[13px] text-cm-text font-medium truncate">{item.value}</p>
              </div>
              <button className="text-[11px] text-cm-green font-semibold hover:underline cursor-pointer shrink-0">
                Modifier
              </button>
            </div>
          ))}
        </SectionCard>
      )}

      {tab === "notifications" && (
        <>
          <SectionCard title="Email" icon={Mail}>
            {[
              { label: "Nouvelles commandes", value: notifEmailOrder, set: setNotifEmailOrder },
              { label: "Paiements reçus", value: notifEmailPayment, set: setNotifEmailPayment },
              { label: "Litiges", value: notifEmailDispute, set: setNotifEmailDispute },
            ].map((item) => (
              <label key={item.label} className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-cm-surface transition-colors">
                <span className="text-[13px] text-cm-text-soft">{item.label}</span>
                <Toggle on={item.value} onChange={item.set} />
              </label>
            ))}
          </SectionCard>
          <SectionCard title="SMS" icon={Smartphone}>
            {[
              { label: "Nouvelles commandes", value: notifSmsOrder, set: setNotifSmsOrder },
              { label: "Livraisons", value: notifSmsDelivery, set: setNotifSmsDelivery },
            ].map((item) => (
              <label key={item.label} className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-cm-surface transition-colors">
                <span className="text-[13px] text-cm-text-soft">{item.label}</span>
                <Toggle on={item.value} onChange={item.set} />
              </label>
            ))}
          </SectionCard>
          <SectionCard title="Push (application)" icon={Bell}>
            {[
              { label: "Nouvelles commandes", value: notifPushOrder, set: setNotifPushOrder },
              { label: "Paiements reçus", value: notifPushPayment, set: setNotifPushPayment },
              { label: "Stock faible", value: notifPushStock, set: setNotifPushStock },
            ].map((item) => (
              <label key={item.label} className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-cm-surface transition-colors">
                <span className="text-[13px] text-cm-text-soft">{item.label}</span>
                <Toggle on={item.value} onChange={item.set} />
              </label>
            ))}
          </SectionCard>
        </>
      )}

      {tab === "securite" && (
        <>
          <SectionCard title="Authentification" icon={Shield}>
            <label className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-cm-surface transition-colors">
              <div>
                <p className="text-[13px] text-cm-text-soft">Authentification à deux facteurs (2FA)</p>
                <p className="text-[11px] text-cm-text-muted mt-0.5">Code de vérification à chaque connexion</p>
              </div>
              <Toggle on={twoFactor} onChange={setTwoFactor} />
            </label>
            <button className="w-full flex items-center justify-between px-4 py-3 text-[13px] text-cm-text-soft hover:bg-cm-surface transition-colors cursor-pointer">
              <span>Changer le mot de passe</span>
              <ChevronRight className="w-4 h-4 text-cm-border-soft" />
            </button>
          </SectionCard>
          <SectionCard title="Sessions actives" icon={Monitor}>
            {sessions.length === 0 ? (
              <div className="px-4 py-6 text-center text-[12px] text-cm-text-muted">
                Aucune session active
              </div>
            ) : sessions.map((s) => (
              <div key={s.id} className="flex items-center gap-3 px-4 py-3">
                <Monitor className="w-4 h-4 text-cm-border-soft shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] text-cm-text font-medium truncate">
                    {s.device}
                    {s.isCurrent && <span className="ml-2 text-[10px] text-cm-green font-semibold">(cette session)</span>}
                  </p>
                  <p className="text-[11px] text-cm-text-muted">{s.browser} · {s.ip}</p>
                </div>
                {!s.isCurrent && (
                  <button className="text-[11px] text-red-500 font-medium hover:underline cursor-pointer shrink-0">
                    Déconnecter
                  </button>
                )}
              </div>
            ))}
          </SectionCard>
          <SectionCard title="Session" icon={LogOut}>
            <button onClick={() => { logout(); navigate("/") }}
              className="w-full flex items-center justify-between px-4 py-3 text-[13px] text-red-600 hover:bg-red-50 transition-colors cursor-pointer">
              <span className="flex items-center gap-2"><LogOut className="w-4 h-4" /> Déconnexion</span>
              <ChevronRight className="w-4 h-4 text-red-300" />
            </button>
          </SectionCard>
        </>
      )}

      {tab === "equipe" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[12px] text-cm-text-muted">{team.length} membre{team.length > 1 ? "s" : ""}</p>
            <button className="text-[12px] text-cm-green font-semibold hover:underline cursor-pointer">
              + Inviter
            </button>
          </div>
          {team.length === 0 ? (
            <div className="bg-cm-elevated rounded-xl border border-cm-border p-8 text-center">
              <Users className="w-8 h-8 text-cm-border-soft mx-auto mb-2" />
              <p className="text-[13px] text-cm-text-muted">Aucun membre dans votre équipe</p>
            </div>
          ) : team.map((member) => {
            const roleColors: Record<SupplierUserRole, string> = {
              admin: "bg-purple-100 text-purple-700",
              manager: "bg-blue-100 text-blue-700",
              storekeeper: "bg-amber-100 text-amber-700",
              preparer: "bg-green-100 text-green-700",
              accountant: "bg-cyan-100 text-cyan-700",
            }
            return (
              <div key={member.id} className="bg-cm-elevated rounded-xl border border-cm-border px-4 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-cm-surface flex items-center justify-center text-[13px] font-bold text-cm-text-muted shrink-0">
                  {member.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-[13px] text-cm-text font-medium truncate">{member.name}</p>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${roleColors[member.role]}`}>
                      {ROLE_LABELS[member.role]}
                    </span>
                    {!member.isActive && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-red-100 text-red-600">Inactif</span>
                    )}
                  </div>
                  <p className="text-[11px] text-cm-text-muted">{member.email}</p>
                  {member.lastActiveAt && (
                    <p className="text-[10px] text-cm-border-soft mt-0.5">Actif·ve {new Date(member.lastActiveAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
                  )}
                </div>
                <button className="text-[11px] text-cm-text-muted hover:text-cm-text-soft cursor-pointer shrink-0">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )
          })}
        </div>
      )}

      <p className="text-[11px] text-cm-text-muted text-center pb-4">
        Ça Match Fournisseur v1.0.0
      </p>
    </div>
  )
}
