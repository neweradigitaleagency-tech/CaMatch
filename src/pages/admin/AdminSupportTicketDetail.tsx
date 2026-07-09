import { useState, useEffect, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getTicketMessages, addTicketMessage, updateTicketStatus, SUPPORT_STATUS_LABELS, SUPPORT_PRIORITY_LABELS, SUPPORT_CATEGORY_LABELS } from "../../services/admin/support.service"
import { usePermissions } from "../../hooks/usePermissions"
import { useAdminAuthStore } from "../../stores/adminAuthStore"
import StatusBadge from "../../components/admin/ui/StatusBadge"
import ErrorState from "../../components/admin/ui/ErrorState"
import { ArrowLeft, MessageSquare, Send, User, Calendar, Tag, Paperclip, ChevronDown, CheckCircle, XCircle } from "lucide-react"
import type { SupportTicket, SupportMessage } from "../../services/admin/support.service"

import { format } from "date-fns"
import { fr } from "date-fns/locale"

const PRIORITY_STYLES: Record<string, string> = {
  low: "text-gray-500 bg-gray-50 border-gray-200",
  medium: "text-amber-700 bg-amber-50 border-amber-200",
  high: "text-orange-700 bg-orange-50 border-orange-200",
  urgent: "text-red-700 bg-red-50 border-red-200 font-semibold",
}

const STATUS_STYLES: Record<string, string> = {
  pending: "pending",
  active: "in_progress",
  completed: "active",
  cancelled: "inactive",
}

export default function AdminSupportTicketDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { hasPermission } = usePermissions()
  const admin = useAdminAuthStore((s) => s.admin)
  const [ticket, setTicket] = useState<SupportTicket | null>(null)
  const [messages, setMessages] = useState<SupportMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [replyText, setReplyText] = useState("")
  const [sending, setSending] = useState(false)
  const [showInternalNotes, setShowInternalNotes] = useState(false)
  const [internalNote, setInternalNote] = useState("")
  const [sendingNote, setSendingNote] = useState(false)

  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchTicketData = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError(null)

    const { getSupportTickets } = await import("../../services/admin/support.service")

    try {
      const { tickets } = await getSupportTickets({ perPage: 1 })
      const found = tickets.find((t) => t.id === id) ?? null
      setTicket(found)
      if (!found) { setError("Ticket introuvable"); setLoading(false); return }

      const msgs = await getTicketMessages(id)
      setMessages(msgs)
    } catch {
      setError("Impossible de charger le ticket")
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { fetchTicketData() }, [fetchTicketData])

  const handleSendReply = async () => {
    if (!id || !replyText.trim() || !admin) return
    setSending(true)
    try {
      await addTicketMessage(id, admin.id, replyText.trim())
      setReplyText("")
      const msgs = await getTicketMessages(id)
      setMessages(msgs)
    } finally {
      setSending(false)
    }
  }

  const handleAddInternalNote = async () => {
    if (!id || !internalNote.trim() || !admin) return
    setSendingNote(true)
    try {
      await addTicketMessage(id, admin.id, internalNote.trim(), true)
      setInternalNote("")
      const msgs = await getTicketMessages(id)
      setMessages(msgs)
    } finally {
      setSendingNote(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!id) return
    setActionLoading(newStatus)
    try {
      await updateTicketStatus(id, newStatus)
      setTicket((prev) => prev ? { ...prev, status: newStatus } : null)
    } finally {
      setActionLoading(null)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendReply()
    }
  }

  if (error) return <ErrorState message={error} onRetry={fetchTicketData} />
  if (loading) return <DetailSkeleton />
  if (!ticket) return <ErrorState message="Ticket introuvable" onRetry={() => navigate("/admin/support")} />

  const isClosed = ticket.status === "cancelled" || ticket.status === "completed"
  const canReply = hasPermission("support.reply") && !isClosed
  const canClose = hasPermission("support.close")

  const regularMessages = messages.filter((m) => !m.is_internal_note)
  const internalMessages = messages.filter((m) => m.is_internal_note)

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/admin/support")} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer">
          <ArrowLeft className="w-4 h-4 text-gray-600" />
        </button>
        <div>
          <h1 className="text-[20px] font-bold text-gray-900">Ticket {ticket.id.slice(0, 8)}</h1>
          <p className="text-[13px] text-gray-500 mt-0.5">{ticket.subject}</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex items-start justify-between mb-3">
          <h2 className="text-[16px] font-bold text-gray-900">{ticket.subject}</h2>
          <StatusBadge status={STATUS_STYLES[ticket.status] ?? "inactive"} label={SUPPORT_STATUS_LABELS[ticket.status] ?? ticket.status} size="md" />
        </div>
        <p className="text-[13px] text-gray-700 leading-relaxed mb-4">{ticket.description}</p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] text-gray-500">
          <div className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> {ticket.client_name || "—"}</div>
          <div className="flex items-center gap-1.5"><Tag className="w-3.5 h-3.5" /> {SUPPORT_CATEGORY_LABELS[ticket.category] ?? ticket.category}</div>
          <div className="flex items-center gap-1.5">
            <span className={`px-2 py-0.5 text-[11px] rounded-md border ${PRIORITY_STYLES[ticket.priority]}`}>{SUPPORT_PRIORITY_LABELS[ticket.priority]}</span>
          </div>
          <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {format(new Date(ticket.created_at), "d MMM HH:mm", { locale: fr })}</div>
          {ticket.admin_name && <div className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Assigné à {ticket.admin_name}</div>}
        </div>

        {!isClosed && canClose && (
          <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
            {ticket.status !== "completed" && (
              <button
                onClick={() => handleStatusChange("completed")}
                disabled={actionLoading === "completed"}
                className="flex items-center gap-1.5 h-8 px-3.5 rounded-lg text-[12px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 cursor-pointer disabled:opacity-50"
              >
                {actionLoading === "completed" ? <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                Résoudre
              </button>
            )}
            <button
              onClick={() => handleStatusChange("cancelled")}
              disabled={actionLoading === "cancelled"}
              className="flex items-center gap-1.5 h-8 px-3.5 rounded-lg text-[12px] font-medium text-gray-600 bg-gray-50 border border-gray-200 hover:bg-gray-100 cursor-pointer disabled:opacity-50"
            >
              {actionLoading === "cancelled" ? <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
              Fermer
            </button>
          </div>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-[13px] font-semibold text-gray-900"><MessageSquare className="w-4 h-4" /> Messages</h3>
          <span className="text-[11px] text-gray-400">{regularMessages.length} message{regularMessages.length !== 1 ? "s" : ""}</span>
        </div>
        <div className="divide-y divide-gray-50 max-h-[500px] overflow-y-auto">
          {regularMessages.length === 0 ? (
            <div className="px-4 py-8 text-center text-[12px] text-gray-400">Aucun message pour le moment</div>
          ) : (
            regularMessages.map((msg) => (
              <div key={msg.id} className="px-4 py-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${msg.sender_id === ticket.client_id ? "bg-blue-500" : "bg-gray-900"}`}>
                      {msg.sender_name.charAt(0)}
                    </div>
                    <span className="text-[12px] font-medium text-gray-900">{msg.sender_name || "Système"}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${msg.sender_id === ticket.client_id ? "text-blue-600 bg-blue-50 border-blue-200" : "text-gray-600 bg-gray-100 border-gray-200"}`}>
                      {msg.sender_id === ticket.client_id ? "Client" : "Support"}
                    </span>
                  </div>
                  <span className="text-[11px] text-gray-400">{format(new Date(msg.created_at), "d MMM HH:mm", { locale: fr })}</span>
                </div>
                <p className="text-[12px] text-gray-600">{msg.content}</p>
                {msg.file_urls && msg.file_urls.length > 0 && (
                  <div className="mt-2 flex gap-2">
                    {msg.file_urls.map((url, i) => (
                      <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="text-[11px] text-blue-600 underline flex items-center gap-1">
                        <Paperclip className="w-3 h-3" /> Pièce jointe {i + 1}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
        {canReply && (
          <div className="px-4 py-3 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Écrire une réponse..."
                className="flex-1 h-9 px-3 text-[13px] bg-gray-50 border border-gray-200 rounded-lg outline-none text-gray-900 placeholder-gray-400 focus:border-gray-300"
              />
              <button
                onClick={handleSendReply}
                disabled={sending || !replyText.trim()}
                className="h-9 px-3 bg-gray-900 text-white text-[12px] font-medium rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {sending ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                Envoyer
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl">
        <button
          onClick={() => setShowInternalNotes(!showInternalNotes)}
          className="flex items-center justify-between w-full px-4 py-3 text-[13px] font-semibold text-gray-900 cursor-pointer"
        >
          <span>Notes internes ({internalMessages.length})</span>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showInternalNotes ? "rotate-180" : ""}`} />
        </button>
        {showInternalNotes && (
          <div className="px-4 pb-4 space-y-2">
            {internalMessages.length === 0 && (
              <p className="text-[12px] text-gray-400 py-2">Aucune note interne</p>
            )}
            {internalMessages.map((msg) => (
              <div key={msg.id} className="p-3 rounded-lg bg-amber-50 border border-amber-100">
                <p className="text-[11px] font-medium text-amber-800 mb-1">{msg.sender_name} — {format(new Date(msg.created_at), "d MMM HH:mm", { locale: fr })}</p>
                <p className="text-[12px] text-amber-700">{msg.content}</p>
              </div>
            ))}
            {canReply && (
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  value={internalNote}
                  onChange={(e) => setInternalNote(e.target.value)}
                  placeholder="Ajouter une note interne..."
                  className="flex-1 h-9 px-3 text-[13px] bg-gray-50 border border-gray-200 rounded-lg outline-none text-gray-900 placeholder-gray-400 focus:border-gray-300"
                />
                <button
                  onClick={handleAddInternalNote}
                  disabled={sendingNote || !internalNote.trim()}
                  className="h-9 px-3 bg-amber-600 text-white text-[12px] font-medium rounded-lg hover:bg-amber-700 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {sendingNote ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Ajouter"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {regularMessages.some((m) => m.file_urls && m.file_urls.length > 0) && (
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h3 className="flex items-center gap-2 text-[13px] font-semibold text-gray-900 mb-3"><Paperclip className="w-4 h-4" /> Pièces jointes</h3>
          <div className="space-y-2">
            {regularMessages.flatMap((m) => (m.file_urls ?? []).map((url, i) => (
              <div key={`${m.id}-${i}`} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <div className="flex items-center gap-2">
                  <Paperclip className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-[12px] text-gray-700">{url.split("/").pop() || url}</span>
                </div>
                <a href={url} target="_blank" rel="noopener noreferrer" className="text-[11px] font-medium text-[var(--admin-accent)] hover:underline cursor-pointer">Télécharger</a>
              </div>
            )))}
          </div>
        </div>
      )}
    </div>
  )
}

function DetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse max-w-4xl">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gray-200 rounded-lg" />
        <div className="space-y-1">
          <div className="h-5 bg-gray-200 rounded w-48" />
          <div className="h-3 bg-gray-200 rounded w-32" />
        </div>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
        <div className="h-5 bg-gray-200 rounded w-56" />
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-3/4" />
        <div className="flex gap-4">
          <div className="h-3 bg-gray-200 rounded w-24" />
          <div className="h-3 bg-gray-200 rounded w-24" />
        </div>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-24" />
        <div className="h-12 bg-gray-200 rounded w-full" />
        <div className="h-12 bg-gray-200 rounded w-full" />
      </div>
    </div>
  )
}
