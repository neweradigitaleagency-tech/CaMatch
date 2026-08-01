import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { usePermissions } from "../../hooks/usePermissions"
import { getPromotions, createPromotion, updatePromotion, deletePromotion } from "../../services/admin/promotions.service"
import Modal from "../../components/admin/ui/Modal"
import ConfirmDialog from "../../components/admin/ui/ConfirmDialog"
import StatusBadge from "../../components/admin/ui/StatusBadge"
import ErrorState from "../../components/admin/ui/ErrorState"
import AdminTable from "../../components/admin/ui/AdminTable"
import type { Column } from "../../components/admin/ui/AdminTable"
import type { PromotionRow } from "../../services/admin/promotions.service"
import { Plus, Percent, Save } from "lucide-react"

import { format } from "date-fns"
import { fr } from "date-fns/locale"

const TYPE_LABELS: Record<string, string> = { percentage: "Pourcentage", fixed: "Montant fixe", free_shipping: "Livraison offerte", waiver: "Exonération" }
const TYPE_STYLES: Record<string, string> = {
  percentage: "text-blue-700 bg-blue-50 border-blue-200",
  fixed: "text-purple-700 bg-purple-50 border-purple-200",
  free_shipping: "text-green-700 bg-green-50 border-green-200",
  waiver: "text-orange-700 bg-orange-50 border-orange-200",
}
const TARGET_LABELS: Record<string, string> = { all: "Tous", clients: "Clients", professionals: "Pros", new: "Nouveaux", premium: "Premium" }

function getStatus(p: PromotionRow): { status: string; label: string } {
  if (!p.is_active) return { status: "inactive", label: "Inactif" }
  if (p.expires_at && new Date(p.expires_at) < new Date()) return { status: "expired", label: "Expiré" }
  return { status: "active", label: "Actif" }
}

interface PromotionForm {
  code: string
  type: string
  value: string
  min_order_amount: string
  max_uses: string
  target: string
  description: string
  starts_at: string
  expires_at: string
}

const emptyForm: PromotionForm = {
  code: "", type: "percentage", value: "", min_order_amount: "", max_uses: "",
  target: "all", description: "", starts_at: "", expires_at: "",
}

export default function AdminPromotionsPage() {
  const { hasPermission } = usePermissions()
  const canCreate = hasPermission("promotions.create")
  const canDelete = hasPermission("promotions.delete")

  const [promotions, setPromotions] = useState<PromotionRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<PromotionRow | null>(null)
  const [form, setForm] = useState<PromotionForm>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchPromotions = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getPromotions()
      setPromotions(data)
    } catch {
      setError("Impossible de charger les promotions.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchPromotions() }, [fetchPromotions])

  const handleCreate = async () => {
    if (!canCreate || !form.code || !form.value) return
    setSaving(true)
    const ok = await createPromotion({
      code: form.code,
      type: form.type,
      value: Number(form.value),
      min_order_amount: form.min_order_amount ? Number(form.min_order_amount) : undefined,
      max_uses: form.max_uses ? Number(form.max_uses) : undefined,
      target: form.target,
      description: form.description || undefined,
      starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : new Date().toISOString(),
      expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : undefined,
    })
    setSaving(false)
    if (ok) {
      setModalOpen(false)
      setForm(emptyForm)
      fetchPromotions()
    }
  }

  const handleDelete = async () => {
    if (!confirmDelete || !canDelete) return
    setActionLoading(confirmDelete.id)
    await deletePromotion(confirmDelete.id)
    setActionLoading(null)
    setConfirmDelete(null)
    fetchPromotions()
  }

  const columns: Column<PromotionRow>[] = [
    {
      key: "code", label: "Code", sortable: true, width: "150px",
      render: (p) => (
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-bold text-cm-text bg-cm-surface border border-cm-border px-2 py-0.5 rounded">{p.code}</span>
        </div>
      ),
    },
    {
      key: "type", label: "Type", sortable: true, width: "140px",
      render: (p) => (
        <span className={`text-[11px] px-2 py-0.5 rounded-md border ${TYPE_STYLES[p.type] ?? ""}`}>
          {TYPE_LABELS[p.type] ?? p.type}
        </span>
      ),
    },
    {
      key: "value", label: "Valeur", sortable: true, width: "100px",
      render: (p) => (
        <span className="text-[12px] font-medium text-cm-text">
          {p.type === "percentage" ? `${p.value}%` : p.type === "fixed" ? `${p.value.toLocaleString()} F` : "—"}
        </span>
      ),
    },
    {
      key: "uses", label: "Utilisations", width: "120px",
      render: (p) => (
        <div className="flex flex-col">
          <span className="text-[12px] text-cm-text-soft">{p.current_uses}{p.max_uses ? ` / ${p.max_uses}` : ""}</span>
          {p.max_uses && (
            <div className="w-24 h-1.5 bg-cm-surface rounded-full mt-1 overflow-hidden">
              <div className="h-full bg-cm-text rounded-full" style={{ width: `${Math.min(100, (p.current_uses / p.max_uses) * 100)}%` }} />
            </div>
          )}
        </div>
      ),
    },
    {
      key: "target", label: "Cible", sortable: true, width: "100px",
      render: (p) => <span className="text-[12px] text-cm-text-muted">{TARGET_LABELS[p.target] ?? p.target}</span>,
    },
    {
      key: "status", label: "Statut", sortable: true, width: "100px",
      render: (p) => {
        const s = getStatus(p)
        return <StatusBadge status={s.status} label={s.label} />
      },
    },
    {
      key: "dates", label: "Période", sortable: false, width: "160px",
      render: (p) => (
        <div className="flex flex-col text-[11px]">
          <span className="text-cm-text-soft">Du {format(new Date(p.starts_at), "d MMM", { locale: fr })}</span>
          <span className="text-cm-text-muted">{p.expires_at ? `au ${format(new Date(p.expires_at), "d MMM yyyy", { locale: fr })}` : "—"}</span>
        </div>
      ),
    },
    {
      key: "actions", label: "", width: "100px",
      render: (p) => (
        <div className="flex items-center gap-1">
          {canDelete && (
            <button onClick={() => setConfirmDelete(p)} disabled={actionLoading === p.id}
              className="text-[11px] font-medium text-red-500 hover:underline cursor-pointer px-1 disabled:opacity-50">
              Supprimer
            </button>
          )}
        </div>
      ),
    },
  ]

  if (error) return <ErrorState message={error} onRetry={fetchPromotions} />

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-bold text-cm-text">Promotions</h1>
          <p className="text-[13px] text-cm-text-muted mt-0.5">{promotions.length} codes promotionnels</p>
        </div>
        {canCreate && (
          <button onClick={() => setModalOpen(true)}
            className="h-9 px-4 bg-cm-text text-white text-[12px] font-medium rounded-lg hover:bg-cm-text/80 transition-colors flex items-center gap-1.5 cursor-pointer">
            <Plus className="w-3.5 h-3.5" /> Nouveau code
          </button>
        )}
      </div>

      <AdminTable
        columns={columns}
        data={promotions}
        keyExtractor={(p) => p.id}
        searchable
        searchKeys={["code"]}
        exportable
        loading={loading}
        emptyMessage="Aucune promotion trouvée"
      />

      <Modal isOpen={modalOpen} onClose={() => !saving && setModalOpen(false)} title="Nouveau code promotionnel" size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-cm-text-soft mb-1">Code</label>
              <input type="text" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                className="w-full h-9 px-3 text-[13px] bg-cm-surface border border-cm-border rounded-lg outline-none text-cm-text focus:border-cm-border" />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-cm-text-soft mb-1">Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full h-9 px-3 text-[13px] bg-cm-surface border border-cm-border rounded-lg outline-none text-cm-text focus:border-cm-border">
                <option value="percentage">Pourcentage</option>
                <option value="fixed">Montant fixe</option>
                <option value="free_shipping">Livraison offerte</option>
                <option value="waiver">Exonération</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-cm-text-soft mb-1">Valeur</label>
              <input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })}
                min={0} className="w-full h-9 px-3 text-[13px] bg-cm-surface border border-cm-border rounded-lg outline-none text-cm-text focus:border-cm-border" />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-cm-text-soft mb-1">Commande min. (F)</label>
              <input type="number" value={form.min_order_amount} onChange={(e) => setForm({ ...form, min_order_amount: e.target.value })}
                min={0} className="w-full h-9 px-3 text-[13px] bg-cm-surface border border-cm-border rounded-lg outline-none text-cm-text focus:border-cm-border" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-cm-text-soft mb-1">Utilisations max</label>
              <input type="number" value={form.max_uses} onChange={(e) => setForm({ ...form, max_uses: e.target.value })}
                min={0} className="w-full h-9 px-3 text-[13px] bg-cm-surface border border-cm-border rounded-lg outline-none text-cm-text focus:border-cm-border" />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-cm-text-soft mb-1">Cible</label>
              <select value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value })}
                className="w-full h-9 px-3 text-[13px] bg-cm-surface border border-cm-border rounded-lg outline-none text-cm-text focus:border-cm-border">
                <option value="all">Tous</option>
                <option value="clients">Clients</option>
                <option value="professionals">Professionnels</option>
                <option value="new">Nouveaux</option>
                <option value="premium">Premium</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[12px] font-medium text-cm-text-soft mb-1">Description</label>
            <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full h-9 px-3 text-[13px] bg-cm-surface border border-cm-border rounded-lg outline-none text-cm-text focus:border-cm-border" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-cm-text-soft mb-1">Date début</label>
              <input type="date" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
                className="w-full h-9 px-3 text-[13px] bg-cm-surface border border-cm-border rounded-lg outline-none text-cm-text focus:border-cm-border" />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-cm-text-soft mb-1">Date fin</label>
              <input type="date" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
                className="w-full h-9 px-3 text-[13px] bg-cm-surface border border-cm-border rounded-lg outline-none text-cm-text focus:border-cm-border" />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button onClick={() => setModalOpen(false)} disabled={saving}
              className="h-9 px-4 text-[12px] font-medium text-cm-text-soft bg-cm-elevated border border-cm-border rounded-lg hover:bg-cm-surface cursor-pointer disabled:opacity-50">
              Annuler
            </button>
            <button onClick={handleCreate} disabled={saving || !form.code || !form.value}
              className="h-9 px-4 bg-cm-text text-white text-[12px] font-medium rounded-lg hover:bg-cm-text/80 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50">
              <Save className="w-3.5 h-3.5" /> {saving ? "Création…" : "Créer"}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!confirmDelete}
        onCancel={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        title="Supprimer la promotion"
        message={`Êtes-vous sûr de vouloir supprimer le code "${confirmDelete?.code}" ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        variant="danger"
      />
    </div>
  )
}
