import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, AlertTriangle, CheckCircle, XCircle, Clock, Send, Paperclip, Scale, MessageCircle } from "lucide-react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { getMockSupplierDisputes, MOCK_ORDERS } from "../../data/supplier-mocks"
import type { DisputeStatus } from "../../types/supplier"
import { formatXOF } from "../../utils/format"

const STATUS_LABELS: Record<DisputeStatus, string> = {
  opened: "Ouvert",
  under_review: "En cours d'examen",
  resolved_supplier: "Résolu (fournisseur)",
  resolved_client: "Résolu (client)",
  rejected: "Rejeté",
}

const STATUS_DETAILS: Record<DisputeStatus, { icon: typeof AlertTriangle; color: string; bg: string }> = {
  opened: { icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
  under_review: { icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
  resolved_supplier: { icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
  resolved_client: { icon: CheckCircle, color: "text-blue-600", bg: "bg-blue-50" },
  rejected: { icon: XCircle, color: "text-gray-600", bg: "bg-gray-50" },
}

const ROLE_LABELS: Record<string, string> = {
  supplier: "Vous",
  client: "Client",
  admin: "Ça Match",
}

const ROLE_COLORS: Record<string, string> = {
  supplier: "bg-cm-green text-white",
  client: "bg-gray-100 text-gray-900",
  admin: "bg-blue-100 text-blue-900",
}

export default function SupplierDisputeDetailScreen() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [newMessage, setNewMessage] = useState("")
  const userId = "supplier-1"

  const { data: disputes = [] } = useQuery({
    queryKey: ["supplier-disputes", userId],
    queryFn: () => getMockSupplierDisputes(userId),
  })

  const dispute = disputes.find((d) => d.id === id)
  if (!dispute) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <AlertTriangle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p className="text-[14px] text-gray-500">Litige introuvable</p>
        <button onClick={() => navigate("/supplier/disputes")}
          className="mt-4 h-9 px-4 bg-gray-900 text-white text-[12px] font-medium rounded-xl cursor-pointer">
          Retour aux litiges
        </button>
      </div>
    )
  }

  const order = MOCK_ORDERS.find((o) => o.id === dispute.orderId)
  const detail = STATUS_DETAILS[dispute.status]
  const StatusIcon = detail.icon

  const handleSendMessage = () => {
    if (!newMessage.trim()) return
    queryClient.setQueryData(["supplier-disputes", userId], (old: any) =>
      old?.map((d: any) =>
        d.id === dispute.id
          ? {
              ...d,
              messages: [
                ...d.messages,
                {
                  id: `dmsg-${Date.now()}`,
                  disputeId: dispute.id,
                  senderId: userId,
                  senderRole: "supplier",
                  senderName: "Mamadou Diallo",
                  content: newMessage,
                  attachments: [],
                  createdAt: new Date().toISOString(),
                },
              ],
              updatedAt: new Date().toISOString(),
            }
          : d
      ) ?? []
    )
    setNewMessage("")
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/supplier/disputes")}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer">
          <ArrowLeft className="w-4 h-4 text-gray-700" />
        </button>
        <div>
          <h1 className="text-[18px] font-bold text-gray-900">Litige {dispute.orderId}</h1>
          <p className="text-[12px] text-gray-500">{dispute.reason}</p>
        </div>
      </div>

      {/* Status banner */}
      <div className={`${detail.bg} ${detail.color} rounded-xl p-4 flex items-center gap-3`}>
        <StatusIcon className="w-8 h-8 shrink-0" />
        <div>
          <p className="text-[14px] font-bold">{STATUS_LABELS[dispute.status]}</p>
          <p className="text-[12px] opacity-80">{dispute.description}</p>
        </div>
      </div>

      {/* Resolution info */}
      {dispute.resolution && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-xl">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
            <p className="text-[12px] text-green-800">{dispute.resolution}</p>
          </div>
        </div>
      )}

      {/* Order info */}
      {order && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-[13px] font-semibold text-gray-900">Commande {order.id}</h2>
            <button onClick={() => navigate(`/supplier/orders/${order.id}`)}
              className="text-[11px] text-cm-green font-medium underline cursor-pointer">
              Voir la commande
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[12px]">
            <div className="bg-gray-50 rounded-lg p-2">
              <p className="text-gray-500">Client</p>
              <p className="font-medium mt-0.5">{order.clientName}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-2">
              <p className="text-gray-500">Montant</p>
              <p className="font-medium mt-0.5">{formatXOF(order.total)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
        <h2 className="text-[13px] font-semibold text-gray-900 flex items-center gap-1.5">
          <MessageCircle className="w-4 h-4" /> Discussion ({dispute.messages.length})
        </h2>
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {dispute.messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.senderRole === "supplier" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] ${ROLE_COLORS[msg.senderRole]} rounded-xl p-3 space-y-1`}>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-medium opacity-70">{ROLE_LABELS[msg.senderRole]}</span>
                  <span className="text-[9px] opacity-50">
                    {new Date(msg.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <p className="text-[12px]">{msg.content}</p>
                {msg.attachments.length > 0 && (
                  <div className="flex gap-1 mt-1">
                    {msg.attachments.map((att, i) => (
                      <span key={i} className="text-[10px] underline opacity-70 flex items-center gap-1">
                        <Paperclip className="w-3 h-3" /> {att.split("/").pop()}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Attachments */}
      {dispute.attachments.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h2 className="text-[13px] font-semibold text-gray-900 mb-2">Pièces jointes</h2>
          <div className="flex flex-wrap gap-2">
            {dispute.attachments.map((att, i) => (
              <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg text-[11px] text-gray-700">
                <Paperclip className="w-3 h-3" />
                {att.split("/").pop()}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reply input — only if open */}
      {(dispute.status === "opened" || dispute.status === "under_review") && (
        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <div className="flex gap-2">
            <input value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              className="flex-1 h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-[12px] focus:outline-none focus:ring-2 focus:ring-cm-green/20"
              placeholder="Votre réponse..." />
            <button onClick={handleSendMessage} disabled={!newMessage.trim()}
              className="h-10 w-10 flex items-center justify-center bg-cm-green text-white rounded-xl disabled:opacity-50 cursor-pointer hover:opacity-90 transition-all">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
