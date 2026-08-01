import { useState, useEffect, useCallback, useMemo } from "react"
import { usePermissions } from "../../hooks/usePermissions"
import { Save, RefreshCw } from "lucide-react"
import { getSettings, updateSettings } from "../../services/admin/settings.service"
import ErrorState from "../../components/admin/ui/ErrorState"

type Tab = "general" | "payments" | "notifications" | "maintenance"

const TABS: { key: Tab; label: string }[] = [
  { key: "general", label: "Général" },
  { key: "payments", label: "Paiements" },
  { key: "notifications", label: "Notifications" },
  { key: "maintenance", label: "Maintenance" },
]

const DEFAULT_VALUES: Record<string, string> = {
  platform_name: "Ça Match",
  platform_email: "contact@camatch.ci",
  platform_phone: "+225 07 59 66 509",
  platform_address: "Abidjan, Côte d'Ivoire",
  platform_timezone: "Africa/Abidjan",
  platform_language: "fr",
  platform_currency: "XOF",
  commission_rate: "15",
  commission_fixed: "0",
  commission_premium: "10",
  tva_rate: "18",
  payment_min_amount: "5000",
  payment_max_amount: "500000",
  payment_payout_delay: "48",
  notification_email_enabled: "true",
  notification_sms_enabled: "true",
  notification_push_enabled: "false",
  notification_new_mission: "true",
  notification_payment_received: "true",
  notification_account_updates: "true",
  maintenance_mode: "false",
  session_timeout: "1440",
  login_max_attempts: "5",
  mission_max_distance: "50",
  mission_max_duration: "8",
  mission_cancel_timeout: "2",
  mission_max_requests: "5",
  mission_expire_hours: "24",
}

export default function AdminSettingsPage() {
  const { hasPermission } = usePermissions()
  const canUpdate = hasPermission("settings.update")
  const [tab, setTab] = useState<Tab>("general")
  const [values, setValues] = useState<Record<string, string>>({ ...DEFAULT_VALUES })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const fetchSettings = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const rows = await getSettings()
      if (rows.length > 0) {
        const map: Record<string, string> = { ...DEFAULT_VALUES }
        for (const r of rows) map[r.key] = r.value
        setValues(map)
      }
    } catch {
      setError("Impossible de charger les paramètres.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchSettings() }, [fetchSettings])

  const handleSave = async () => {
    if (!canUpdate) return
    setSaving(true)
    const entries = Object.entries(values).map(([key, value]) => ({ key, value }))
    const ok = await updateSettings(entries)
    setSaving(false)
    if (ok) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  const setValue = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  if (error) return <ErrorState message={error} onRetry={fetchSettings} />

  const content = useMemo(() => {
    if (loading) return null

    switch (tab) {
      case "general":
        return <GeneralTab values={values} setValue={setValue} canUpdate={canUpdate} />
      case "payments":
        return <PaymentsTab values={values} setValue={setValue} canUpdate={canUpdate} />
      case "notifications":
        return <NotificationsTab values={values} setValue={setValue} canUpdate={canUpdate} />
      case "maintenance":
        return <MaintenanceTab values={values} setValue={setValue} canUpdate={canUpdate} />
    }
  }, [tab, values, canUpdate, loading])

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-bold text-cm-text">Paramètres</h1>
          <p className="text-[13px] text-cm-text-muted mt-0.5">Configuration de la plateforme</p>
        </div>
        <div className="flex items-center gap-2">
          {!loading && (
            <button onClick={handleSave} disabled={!canUpdate || saving}
              className="flex items-center gap-1.5 h-9 px-4 bg-cm-text text-white text-[12px] font-medium rounded-lg hover:bg-cm-text/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
              {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              {saving ? "Enregistrement…" : saved ? "Enregistré" : "Enregistrer"}
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-1 border-b border-cm-border">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-[12px] font-medium border-b-2 transition-colors cursor-pointer ${tab === t.key ? "border-cm-text text-cm-text" : "border-transparent text-cm-text-muted hover:text-cm-text-soft"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-cm-elevated border border-cm-border rounded-xl p-5 space-y-4">
              <div className="h-4 w-24 bg-cm-border-soft rounded animate-pulse" />
              <div className="h-9 bg-cm-surface rounded-lg animate-pulse" />
              <div className="h-9 bg-cm-surface rounded-lg animate-pulse" />
              <div className="h-9 bg-cm-surface rounded-lg animate-pulse" />
            </div>
          ))}
        </div>
      ) : content}
    </div>
  )
}

function InputField({ label, sub, value, onChange, disabled, type = "text", min, max, suffix }: {
  label: string; sub?: string; value: string | undefined; onChange: (v: string) => void; disabled?: boolean
  type?: string; min?: number; max?: number; suffix?: string
}) {
  return (
    <div>
      <label className="block text-[12px] font-medium text-cm-text-soft mb-1">{label}</label>
      {sub && <p className="text-[11px] text-cm-text-muted mb-1.5 -mt-0.5">{sub}</p>}
      <div className="relative">
        <input type={type} value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          min={min} max={max}
          className={`w-full h-9 px-3 text-[13px] bg-cm-surface border border-cm-border rounded-lg outline-none text-cm-text focus:border-cm-border disabled:opacity-50 disabled:cursor-not-allowed ${suffix ? "pr-8" : ""}`} />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-cm-text-muted">{suffix}</span>}
      </div>
    </div>
  )
}

function SelectField({ label, sub, value, onChange, disabled, options }: {
  label: string; sub?: string; value: string | undefined; onChange: (v: string) => void; disabled?: boolean
  options: { value: string; label: string }[]
}) {
  return (
    <div>
      <label className="block text-[12px] font-medium text-cm-text-soft mb-1">{label}</label>
      {sub && <p className="text-[11px] text-cm-text-muted mb-1.5 -mt-0.5">{sub}</p>}
      <select value={value ?? ""} onChange={(e) => onChange(e.target.value)} disabled={disabled}
        className="w-full h-9 px-3 text-[13px] bg-cm-surface border border-cm-border rounded-lg outline-none text-cm-text focus:border-cm-border disabled:opacity-50 disabled:cursor-not-allowed">
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}

function ToggleField({ label, sub, value, onChange, disabled, danger }: {
  label: string; sub?: string; value: boolean; onChange: (v: boolean) => void; disabled?: boolean; danger?: boolean
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="text-[13px] font-medium text-cm-text">{label}</p>
        {sub && <p className="text-[11px] text-cm-text-muted">{sub}</p>}
      </div>
      <button type="button" onClick={() => !disabled && onChange(!value)} disabled={disabled}
        className={`relative w-10 h-5 rounded-full transition-colors shrink-0 ${value ? (danger ? "bg-red-500" : "bg-[var(--admin-accent)]") : "bg-cm-border-soft"} ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}>
        <span className={`absolute top-0.5 w-4 h-4 bg-cm-elevated rounded-full shadow transition-transform ${value ? "translate-x-5" : "translate-x-0.5"}`} />
      </button>
    </div>
  )
}

function Card({ title, children, className }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-cm-elevated border border-cm-border rounded-xl p-5 space-y-4 ${className ?? ""}`}>
      {title && <h3 className="text-[13px] font-semibold text-cm-text">{title}</h3>}
      {children}
    </div>
  )
}

function GeneralTab({ values, setValue, canUpdate }: { values: Record<string, string>; setValue: (k: string, v: string) => void; canUpdate: boolean }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Card title="Général">
        <InputField label="Nom de la plateforme" value={values.platform_name} onChange={(v) => setValue("platform_name", v)} disabled={!canUpdate} />
        <InputField label="Email de contact" type="email" value={values.platform_email} onChange={(v) => setValue("platform_email", v)} disabled={!canUpdate} />
        <InputField label="Téléphone support" value={values.platform_phone} onChange={(v) => setValue("platform_phone", v)} disabled={!canUpdate} />
        <InputField label="Adresse" value={values.platform_address} onChange={(v) => setValue("platform_address", v)} disabled={!canUpdate} />
      </Card>
      <Card title="Configuration régionale">
        <SelectField label="Fuseau horaire" value={values.platform_timezone} onChange={(v) => setValue("platform_timezone", v)} disabled={!canUpdate}
          options={[
            { value: "Africa/Abidjan", label: "Abidjan (UTC+0)" },
            { value: "Africa/Dakar", label: "Dakar (UTC+0)" },
            { value: "Africa/Douala", label: "Douala (UTC+1)" },
            { value: "Europe/Paris", label: "Paris (UTC+1/+2)" },
          ]} />
        <SelectField label="Langue par défaut" value={values.platform_language} onChange={(v) => setValue("platform_language", v)} disabled={!canUpdate}
          options={[
            { value: "fr", label: "Français" },
            { value: "en", label: "English" },
          ]} />
        <SelectField label="Devise" value={values.platform_currency} onChange={(v) => setValue("platform_currency", v)} disabled={!canUpdate}
          options={[
            { value: "XOF", label: "F CFA (XOF)" },
            { value: "EUR", label: "Euro (EUR)" },
            { value: "USD", label: "Dollar (USD)" },
          ]} />
      </Card>
    </div>
  )
}

function PaymentsTab({ values, setValue, canUpdate }: { values: Record<string, string>; setValue: (k: string, v: string) => void; canUpdate: boolean }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Card title="Commissions">
        <InputField label="Commission plateforme" sub="Pourcentage prélevé sur chaque mission" type="number" min={0} max={100}
          value={values.commission_rate} onChange={(v) => setValue("commission_rate", v)} disabled={!canUpdate} suffix="%" />
        <InputField label="Commission fixe" sub="Montant fixe par transaction" type="number" min={0}
          value={values.commission_fixed} onChange={(v) => setValue("commission_fixed", v)} disabled={!canUpdate} suffix="F" />
        <InputField label="Commission Premium" sub="Commission réduite pour les pros Premium" type="number" min={0} max={100}
          value={values.commission_premium} onChange={(v) => setValue("commission_premium", v)} disabled={!canUpdate} suffix="%" />
        <InputField label="TVA" type="number" min={0} max={100}
          value={values.tva_rate} onChange={(v) => setValue("tva_rate", v)} disabled={!canUpdate} suffix="%" />
      </Card>
      <Card title="Transactions">
        <InputField label="Montant minimum" sub="Montant minimum par transaction" type="number" min={0}
          value={values.payment_min_amount} onChange={(v) => setValue("payment_min_amount", v)} disabled={!canUpdate} suffix="F" />
        <InputField label="Montant maximum" sub="Montant maximum par transaction" type="number" min={0}
          value={values.payment_max_amount} onChange={(v) => setValue("payment_max_amount", v)} disabled={!canUpdate} suffix="F" />
        <InputField label="Délai de reversement" sub="Temps avant mise à disposition des fonds" type="number" min={0}
          value={values.payment_payout_delay} onChange={(v) => setValue("payment_payout_delay", v)} disabled={!canUpdate} suffix="h" />
      </Card>
    </div>
  )
}

function NotificationsTab({ values, setValue, canUpdate }: { values: Record<string, string>; setValue: (k: string, v: string) => void; canUpdate: boolean }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Card title="Canaux d'envoi">
        <ToggleField label="Notifications email" sub="Envoyer les notifications par email"
          value={values.notification_email_enabled === "true"}
          onChange={(v) => setValue("notification_email_enabled", String(v))} disabled={!canUpdate} />
        <ToggleField label="Notifications SMS" sub="Envoyer les notifications par SMS"
          value={values.notification_sms_enabled === "true"}
          onChange={(v) => setValue("notification_sms_enabled", String(v))} disabled={!canUpdate} />
        <ToggleField label="Notifications push" sub="Envoyer les notifications push mobile"
          value={values.notification_push_enabled === "true"}
          onChange={(v) => setValue("notification_push_enabled", String(v))} disabled={!canUpdate} />
      </Card>
      <Card title="Événements">
        <ToggleField label="Nouvelle mission" sub="Notification lors du dépôt d'une mission"
          value={values.notification_new_mission === "true"}
          onChange={(v) => setValue("notification_new_mission", String(v))} disabled={!canUpdate} />
        <ToggleField label="Paiement reçu" sub="Notification lors d'un paiement"
          value={values.notification_payment_received === "true"}
          onChange={(v) => setValue("notification_payment_received", String(v))} disabled={!canUpdate} />
        <ToggleField label="Mise à jour compte" sub="Notification pour les changements de statut"
          value={values.notification_account_updates === "true"}
          onChange={(v) => setValue("notification_account_updates", String(v))} disabled={!canUpdate} />
      </Card>
    </div>
  )
}

function MaintenanceTab({ values, setValue, canUpdate }: { values: Record<string, string>; setValue: (k: string, v: string) => void; canUpdate: boolean }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Card title="Mode maintenance">
        <ToggleField label="Mode maintenance" sub="Désactiver l'accès à toute la plateforme"
          value={values.maintenance_mode === "true"}
          onChange={(v) => setValue("maintenance_mode", String(v))} disabled={!canUpdate} danger />
      </Card>
      <Card title="Sécurité">
        <InputField label="Timeout session" sub="Durée max d'une session admin" type="number" min={1}
          value={values.session_timeout} onChange={(v) => setValue("session_timeout", v)} disabled={!canUpdate} suffix="min" />
        <InputField label="Tentatives max" sub="Tentatives de connexion avant blocage" type="number" min={1}
          value={values.login_max_attempts} onChange={(v) => setValue("login_max_attempts", v)} disabled={!canUpdate} />
      </Card>
      <Card title="Missions" className="col-span-2">
        <div className="grid grid-cols-2 gap-4">
          <InputField label="Distance max." sub="Rayon de recherche des missions" type="number" min={0}
            value={values.mission_max_distance} onChange={(v) => setValue("mission_max_distance", v)} disabled={!canUpdate} suffix="km" />
          <InputField label="Durée max." sub="Durée maximale d'une mission" type="number" min={0}
            value={values.mission_max_duration} onChange={(v) => setValue("mission_max_duration", v)} disabled={!canUpdate} suffix="h" />
          <InputField label="Délai d'annulation" sub="Période de rétractation" type="number" min={0}
            value={values.mission_cancel_timeout} onChange={(v) => setValue("mission_cancel_timeout", v)} disabled={!canUpdate} suffix="h" />
          <InputField label="Demandes simultanées" sub="Nombre max de demandes actives par client" type="number" min={1}
            value={values.mission_max_requests} onChange={(v) => setValue("mission_max_requests", v)} disabled={!canUpdate} />
          <InputField label="Expiration" sub="Expiration des demandes non traitées" type="number" min={1}
            value={values.mission_expire_hours} onChange={(v) => setValue("mission_expire_hours", v)} disabled={!canUpdate} suffix="h" />
        </div>
      </Card>
    </div>
  )
}
