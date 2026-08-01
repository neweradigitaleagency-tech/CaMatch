import { useState } from "react"
import { createAdminNotification } from "../../services/admin/notifications.service"
import { useAdminAuthStore } from "../../stores/adminAuthStore"
import { useAppNavigation } from "../../navigation/useAppNavigation"
import PageHeader from "../../components/admin/ui/PageHeader"
import { ArrowLeft, Send, Image, Link, Calendar } from "lucide-react"

type TargetType = "all" | "clients" | "professionals"
type NotifType = "info" | "warning" | "promotion" | "system"
type ChannelType = "push" | "email" | "sms"

const TYPE_OPTIONS: { key: NotifType; label: string }[] = [
  { key: "info", label: "Information" },
  { key: "warning", label: "Alerte" },
  { key: "promotion", label: "Promotion" },
  { key: "system", label: "Système" },
]

const CHANNEL_OPTIONS: { key: ChannelType; label: string }[] = [
  { key: "push", label: "Push" },
  { key: "email", label: "Email" },
  { key: "sms", label: "SMS" },
]

export default function AdminNotificationCreatePage() {
  const { goBack, complete } = useAppNavigation()
  const admin = useAdminAuthStore.admin
  const [type, setType] = useState<NotifType>("info")
  const [channel, setChannel] = useState<ChannelType>("push")
  const [target, setTarget] = useState<TargetType>("all")
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [linkUrl, setLinkUrl] = useState("")
  const [scheduleDate, setScheduleDate] = useState("")
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) return
    setSending(true)
    setError(null)
    try {
      await createAdminNotification({
        type,
        channel,
        title: title.trim(),
        content: message.trim(),
        target,
        image_url: imageUrl || undefined,
        link_url: linkUrl || undefined,
        scheduled_at: scheduleDate ? new Date(scheduleDate).toISOString() : undefined,
        created_by: admin?.firstname ? `${admin.firstname} ${admin.lastname}` : undefined,
      })
      complete()
    } catch {
      setError("Erreur lors de l'envoi de la notification")
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div className="flex items-center gap-3">
        <button onClick={() => goBack()} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-cm-surface cursor-pointer">
          <ArrowLeft className="w-4 h-4 text-cm-text-soft" />
        </button>
        <PageHeader title="Nouvelle notification" description="Créer et envoyer une notification aux utilisateurs" />
      </div>

      <div className="bg-cm-elevated border border-cm-border rounded-xl p-5 space-y-5">
        <div>
          <label className="text-[12px] font-medium text-cm-text-soft mb-1.5 block">Type</label>
          <div className="flex items-center gap-2 flex-wrap">
            {TYPE_OPTIONS.map((o) => (
              <button key={o.key} onClick={() => setType(o.key)}
                className={`px-3.5 py-1.5 rounded-lg text-[12px] font-medium cursor-pointer transition-colors ${type === o.key ? "bg-cm-text text-white" : "bg-cm-elevated border border-cm-border text-cm-text-soft hover:bg-cm-surface"}`}>
                {o.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[12px] font-medium text-cm-text-soft mb-1.5 block">Canal</label>
          <div className="flex items-center gap-2 flex-wrap">
            {CHANNEL_OPTIONS.map((o) => (
              <button key={o.key} onClick={() => setChannel(o.key)}
                className={`px-3.5 py-1.5 rounded-lg text-[12px] font-medium cursor-pointer transition-colors ${channel === o.key ? "bg-cm-text text-white" : "bg-cm-elevated border border-cm-border text-cm-text-soft hover:bg-cm-surface"}`}>
                {o.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[12px] font-medium text-cm-text-soft mb-1.5 block">Cible</label>
          <div className="flex items-center gap-2 flex-wrap">
            {(["all", "clients", "professionals"] as TargetType[]).map((t) => (
              <button key={t} onClick={() => setTarget(t)}
                className={`px-3.5 py-1.5 rounded-lg text-[12px] font-medium cursor-pointer transition-colors ${target === t ? "bg-cm-text text-white" : "bg-cm-elevated border border-cm-border text-cm-text-soft hover:bg-cm-surface"}`}>
                {t === "all" ? "Tous" : t === "clients" ? "Clients" : "Professionnels"}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[12px] font-medium text-cm-text-soft mb-1.5 block">Titre *</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Nouvelle fonctionnalité disponible"
            className="w-full h-10 px-3 text-[13px] bg-cm-elevated border border-cm-border rounded-lg outline-none text-cm-text placeholder:text-cm-text-muted focus:border-cm-border" />
        </div>

        <div>
          <label className="text-[12px] font-medium text-cm-text-soft mb-1.5 block">Message *</label>
          <textarea rows={4} value={message} onChange={(e) => setMessage(e.target.value)}
            placeholder="Contenu de la notification..."
            className="w-full p-3 text-[13px] bg-cm-elevated border border-cm-border rounded-lg outline-none text-cm-text placeholder:text-cm-text-muted focus:border-cm-border resize-none" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[12px] font-medium text-cm-text-soft mb-1.5 block flex items-center gap-1.5">
              <Image className="w-3.5 h-3.5" /> URL de l'image
            </label>
            <input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..." className="w-full h-10 px-3 text-[13px] bg-cm-elevated border border-cm-border rounded-lg outline-none text-cm-text placeholder:text-cm-text-muted focus:border-cm-border" />
          </div>
          <div>
            <label className="text-[12px] font-medium text-cm-text-soft mb-1.5 block flex items-center gap-1.5">
              <Link className="w-3.5 h-3.5" /> URL du lien
            </label>
            <input type="text" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://..." className="w-full h-10 px-3 text-[13px] bg-cm-elevated border border-cm-border rounded-lg outline-none text-cm-text placeholder:text-cm-text-muted focus:border-cm-border" />
          </div>
        </div>

        <div>
          <label className="text-[12px] font-medium text-cm-text-soft mb-1.5 block flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" /> Planification (optionnel)
          </label>
          <input type="datetime-local" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)}
            className="w-full h-10 px-3 text-[13px] bg-cm-elevated border border-cm-border rounded-lg outline-none text-cm-text focus:border-cm-border" />
          <p className="text-[11px] text-cm-text-muted mt-1">Laissez vide pour envoyer immédiatement</p>
        </div>

        {error && <p className="text-[12px] text-red-600">{error}</p>}

        <div className="pt-3 border-t border-cm-border/40">
          <button onClick={handleSend}
            disabled={sending || !title.trim() || !message.trim()}
            className="h-10 px-5 bg-cm-text text-white text-[12px] font-medium rounded-lg hover:bg-cm-text/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer">
            {sending ? (
              <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Envoi en cours...</>
            ) : (
              <><Send className="w-3.5 h-3.5" /> {scheduleDate ? "Planifier" : "Envoyer"}</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
