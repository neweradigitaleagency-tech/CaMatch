import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { User, Building2, MapPin, Phone, Mail, Save, Edit2 } from "lucide-react"
import { useSupplierProfile, useUpdateSupplierProfile } from "../../hooks/supplier/useSupplierProfile"
import type { SupplierProfile } from "../../types/supplier"

export default function SupplierProfileScreen() {
  const navigate = useNavigate()
  const { data: profile, isLoading } = useSupplierProfile()
  const updateProfile = useUpdateSupplierProfile()
  const [editing, setEditing] = useState(false)

  const [form, setForm] = useState({
    companyName: "",
    ownerName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
  })

  const [saving, setSaving] = useState(false)

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-cm-surface/50 animate-pulse rounded-xl" />)}
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-[14px] text-cm-text-muted">Profil introuvable</p>
      </div>
    )
  }

  const startEditing = () => {
    setForm({
      companyName: profile.companyName,
      ownerName: profile.ownerName,
      phone: profile.phone,
      email: profile.email ?? "",
      address: profile.address ?? "",
      city: profile.city,
    })
    setEditing(true)
  }

  const handleSave = async () => {
    setSaving(true)
    const userId = profile.userId
    await updateProfile.mutateAsync({
      userId,
      updates: {
        companyName: form.companyName,
        ownerName: form.ownerName,
        phone: form.phone,
        email: form.email || undefined,
        address: form.address || undefined,
        city: form.city,
      } as Partial<SupplierProfile>,
    })
    setSaving(false)
    setEditing(false)
  }

  const StatusBadge = ({ status }: { status: string }) => {
    const styles: Record<string, string> = {
      EN_ATTENTE: "bg-yellow-50 text-yellow-700",
      VERIFIE: "bg-blue-50 text-blue-700",
      ACTIF: "bg-green-50 text-green-700",
      BLOQUE: "bg-red-50 text-red-700",
      REJETE: "bg-cm-surface text-cm-text-soft",
    }
    const labels: Record<string, string> = {
      EN_ATTENTE: "En attente",
      VERIFIE: "Vérifié",
      ACTIF: "Actif",
      BLOQUE: "Bloqué",
      REJETE: "Rejeté",
    }
    return (
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${styles[status] ?? "bg-cm-surface text-cm-text-soft"}`}>
        {labels[status] ?? status}
      </span>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-bold text-cm-text">Mon profil</h1>
          <p className="text-[12px] text-cm-text-muted">Gérez vos informations</p>
        </div>
        {!editing && (
          <button onClick={startEditing}
            className="h-9 px-4 bg-cm-text text-white text-[12px] font-bold rounded-xl hover:opacity-90 cursor-pointer transition-all flex items-center gap-1.5">
            <Edit2 className="w-3.5 h-3.5" /> Modifier
          </button>
        )}
      </div>

      <div className="bg-cm-elevated rounded-xl border border-cm-border p-4 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-cm-green/10 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-cm-green" />
          </div>
          <div>
            <h2 className="text-[16px] font-bold text-cm-text">{profile.companyName}</h2>
            <StatusBadge status={profile.status} />
          </div>
        </div>

        {!editing ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InfoField icon={User} label="Responsable" value={profile.ownerName} />
            <InfoField icon={Phone} label="Téléphone" value={profile.phone} />
            {profile.email && <InfoField icon={Mail} label="Email" value={profile.email} />}
            <InfoField icon={MapPin} label="Ville" value={profile.city} />
            {profile.address && <InfoField icon={MapPin} label="Adresse" value={profile.address} />}
            <InfoField icon={"💰" as any} label="Commission" value={`${profile.commissionRate}%`} />
            <InfoField icon={Building2} label="Statut" value={profile.isActive ? "Actif" : "Inactif"} />
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InputField label="Nom de l'entreprise" value={form.companyName} onChange={(v) => setForm((f) => ({ ...f, companyName: v }))} />
              <InputField label="Responsable" value={form.ownerName} onChange={(v) => setForm((f) => ({ ...f, ownerName: v }))} />
              <InputField label="Téléphone" value={form.phone} onChange={(v) => setForm((f) => ({ ...f, phone: v }))} />
              <InputField label="Email" value={form.email} onChange={(v) => setForm((f) => ({ ...f, email: v }))} />
              <InputField label="Adresse" value={form.address} onChange={(v) => setForm((f) => ({ ...f, address: v }))} />
              <InputField label="Ville" value={form.city} onChange={(v) => setForm((f) => ({ ...f, city: v }))} />
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setEditing(false)}
                className="h-9 px-4 border border-cm-border text-cm-text-soft text-[12px] font-medium rounded-lg cursor-pointer">
                Annuler
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-1.5 h-9 px-4 bg-cm-green text-white text-[12px] font-bold rounded-lg disabled:opacity-50 cursor-pointer">
                <Save className="w-3.5 h-3.5" /> {saving ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function InfoField({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="bg-cm-surface rounded-lg p-3 flex items-center gap-3">
      <Icon className="w-4 h-4 text-cm-text-muted shrink-0" />
      <div>
        <p className="text-[10px] text-cm-text-muted">{label}</p>
        <p className="text-[13px] font-medium text-cm-text">{value}</p>
      </div>
    </div>
  )
}

function InputField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-[11px] font-medium text-cm-text-soft block mb-1">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full h-9 px-3 border border-cm-border rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-cm-green/20 focus:border-cm-green" />
    </div>
  )
}
