import { useState } from "react"
import { Package, ClipboardList, CheckCircle2, Clock, Play, ChevronDown, ChevronUp, Search, Box, MapPin, Scale } from "lucide-react"
import { usePickingLists, useUpdatePickingStatus } from "../../hooks/supplier/useSupplierPicking"
import type { PickingStatus, PickingList } from "../../types/supplier"

const STATUS_COLORS: Record<PickingStatus, string> = {
  pending: "text-amber-600 bg-amber-50",
  in_progress: "text-blue-600 bg-blue-50",
  completed: "text-green-700 bg-green-50",
  cancelled: "text-gray-500 bg-gray-100",
}

const STATUS_LABELS: Record<PickingStatus, string> = {
  pending: "En attente",
  in_progress: "En cours",
  completed: "Terminée",
  cancelled: "Annulée",
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
}

function PickingCard({ list }: { list: PickingList }) {
  const updateStatus = useUpdatePickingStatus()
  const [expanded, setExpanded] = useState(false)

  const totalQty = list.items.reduce((s, i) => s + i.quantity, 0)
  const pickedQty = list.items.reduce((s, i) => s + i.pickedQuantity, 0)
  const progress = totalQty > 0 ? Math.round((pickedQty / totalQty) * 100) : 0
  const statusColor = STATUS_COLORS[list.status]

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 flex items-center gap-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${statusColor}`}>
          {list.status === "completed" ? <CheckCircle2 className="w-4.5 h-4.5" /> :
           list.status === "in_progress" ? <Play className="w-4.5 h-4.5 ml-0.5" /> :
           <ClipboardList className="w-4.5 h-4.5" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-[13px] text-gray-800 font-medium">Commande #{list.orderId.replace("order-", "")}</p>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${statusColor}`}>
              {STATUS_LABELS[list.status]}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-[11px] text-gray-400">{totalQty} article{totalQty > 1 ? "s" : ""}</span>
            {list.createdAt && <span className="text-[11px] text-gray-400">{formatDate(list.createdAt)}</span>}
            {list.preparedBy && <span className="text-[11px] text-gray-400">Préparé par {list.preparedBy}</span>}
          </div>
          {list.status !== "completed" && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-cm-green rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
              <span className="text-[10px] text-gray-400 font-medium">{pickedQty}/{totalQty}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {list.status === "pending" && (
            <button onClick={() => updateStatus.mutate({ listId: list.id, status: "in_progress" })}
              className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-white bg-cm-green rounded-lg hover:bg-cm-green/90 transition-colors cursor-pointer">
              <Play className="w-3 h-3" /> Commencer
            </button>
          )}
          <button onClick={() => setExpanded(!expanded)}
            className="p-1.5 text-gray-300 hover:text-gray-500 cursor-pointer">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-100">
          {list.notes && (
            <div className="px-4 py-2 bg-amber-50 text-[11px] text-amber-700 border-b border-amber-100">
              📌 {list.notes}
            </div>
          )}
          <div className="divide-y divide-gray-50">
            {list.items.map((item) => {
              const done = item.pickedQuantity >= item.quantity
              return (
                <div key={item.id} className="px-4 py-2.5 flex items-center gap-3">
                  <div className={`w-6 h-6 rounded border-2 flex items-center justify-center shrink-0 ${
                    done ? "bg-cm-green border-cm-green" : "border-gray-200"
                  }`}>
                    {done && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] text-gray-800 font-medium truncate">{item.productName}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-[10px] text-gray-400">{item.productReference}</span>
                      {item.storageLocation && (
                        <span className="flex items-center gap-0.5 text-[10px] text-gray-400">
                          <MapPin className="w-2.5 h-2.5" />{item.storageLocation}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[12px] text-gray-500">
                      {item.pickedQuantity}/{item.quantity}
                    </span>
                    {item.unit && <span className="text-[10px] text-gray-400">{item.unit}</span>}
                  </div>
                </div>
              )
            })}
          </div>
          {list.status === "in_progress" && (
            <div className="border-t border-gray-100 px-4 py-2 flex justify-end">
              <button onClick={() => updateStatus.mutate({ listId: list.id, status: "completed" })}
                className="flex items-center gap-1 px-3 py-1.5 text-[11px] font-semibold text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors cursor-pointer">
                <CheckCircle2 className="w-3 h-3" /> Marquer terminée
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function SupplierPickingScreen() {
  const { data: lists = [], isLoading } = usePickingLists()
  const [filter, setFilter] = useState<PickingStatus | "all">("all")

  const filtered = filter === "all" ? lists : lists.filter((l) => l.status === filter)
  const pendingCount = lists.filter((l) => l.status === "pending").length
  const inProgressCount = lists.filter((l) => l.status === "in_progress").length

  const filters: { key: PickingStatus | "all"; label: string }[] = [
    { key: "all", label: "Toutes" },
    { key: "pending", label: `En attente (${pendingCount})` },
    { key: "in_progress", label: `En cours (${inProgressCount})` },
    { key: "completed", label: "Terminées" },
  ]

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-[20px] font-bold text-gray-900">Préparation de commandes</h1>
        <p className="text-[12px] text-gray-500 mt-1">Listes de picking — préparez et emballez les commandes</p>
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {filters.map((f) => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
              filter === f.key ? "bg-cm-green text-white" : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-6 h-6 border-2 border-cm-green border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Package className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-[13px] text-gray-500">Aucune liste de préparation</p>
          <p className="text-[11px] text-gray-400 mt-1">Les commandes validées apparaîtront ici</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((list) => (
            <PickingCard key={list.id} list={list} />
          ))}
        </div>
      )}
    </div>
  )
}
