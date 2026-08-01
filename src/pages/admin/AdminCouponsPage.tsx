import { useState, useEffect, useCallback } from "react"
import { Plus, Save, Trash2, Ticket, ToggleRight, ToggleLeft } from "lucide-react"
import AdminTable from "../../components/admin/ui/AdminTable"
import type { Column } from "../../components/admin/ui/AdminTable"
import ErrorState from "../../components/admin/ui/ErrorState"
import Modal from "../../components/admin/ui/Modal"
import ConfirmDialog from "../../components/admin/ui/ConfirmDialog"
import { formatXOF } from "../../utils/admin/formatCurrency"
import { isSupabaseReady } from "../../services/supabase"
import { fetchCoupons, toggleCoupon as toggleCouponService } from "../../services/couponService"
import type { Coupon, CouponType, PlanType } from "../../types/subscription"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

const COUPON_TYPE_LABELS: Record<CouponType, string> = {
  percentage: "Pourcentage",
  fixed: "Montant fixe",
  free_month: "Mois gratuit",
}

const COUPON_TYPE_SYMBOLS: Record<CouponType, string> = {
  percentage: "%",
  fixed: "F",
  free_month: "M",
}

const COUPON_TYPE_COLORS: Record<CouponType, string> = {
  percentage: "text-blue-600 bg-blue-50",
  fixed: "text-emerald-600 bg-emerald-50",
  free_month: "text-amber-600 bg-amber-50",
}

const MOCK_COUPONS: Coupon[] = [
  { id: "c1", code: "WELCOME20", type: "percentage", value: 20, max_usage: 100, current_usage: 5, min_plan_type: null, expires_at: null, is_active: true, created_at: new Date().toISOString() },
  { id: "c2", code: "FREE100", type: "fixed", value: 10000, max_usage: 50, current_usage: 10, min_plan_type: null, expires_at: null, is_active: true, created_at: new Date().toISOString() },
  { id: "c3", code: "PROTRIAL", type: "free_month", value: 1, max_usage: 200, current_usage: 25, min_plan_type: "PRO", expires_at: null, is_active: true, created_at: new Date().toISOString() },
  { id: "c4", code: "SUMMER25", type: "percentage", value: 25, max_usage: 150, current_usage: 42, min_plan_type: null, expires_at: new Date(Date.now() + 90 * 86400000).toISOString(), is_active: true, created_at: new Date().toISOString() },
  { id: "c5", code: "PREMIUM50", type: "fixed", value: 5000, max_usage: 30, current_usage: 30, min_plan_type: "CLIENT", expires_at: new Date(Date.now() - 30 * 86400000).toISOString(), is_active: false, created_at: new Date(Date.now() - 120 * 86400000).toISOString() },
  { id: "c6", code: "FLASH30", type: "percentage", value: 30, max_usage: 80, current_usage: 55, min_plan_type: null, expires_at: new Date(Date.now() + 15 * 86400000).toISOString(), is_active: true, created_at: new Date(Date.now() - 10 * 86400000).toISOString() },
  { id: "c7", code: "PROPLUS", type: "free_month", value: 1, max_usage: 100, current_usage: 8, min_plan_type: "PRO", expires_at: null, is_active: true, created_at: new Date().toISOString() },
  { id: "c8", code: "LOYALTY", type: "fixed", value: 2000, max_usage: null, current_usage: 120, min_plan_type: null, expires_at: null, is_active: false, created_at: new Date(Date.now() - 200 * 86400000).toISOString() },
]

interface CouponForm {
  code: string
  type: CouponType
  value: number
  max_usage: number | null
  min_plan_type: PlanType | null
  expires_at: string
  is_active: boolean
}

const EMPTY_FORM: CouponForm = {
  code: "", type: "percentage", value: 0, max_usage: null,
  min_plan_type: null, expires_at: "", is_active: true,
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<CouponForm>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<Coupon | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchCoupons()
      setCoupons(data)
    } catch {
      setCoupons(MOCK_COUPONS)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const openCreate = () => {
    setEditId(null)
    setForm(EMPTY_FORM)
    setModalOpen(true)
  }

  const openEdit = (c: Coupon) => {
    setEditId(c.id)
    setForm({
      code: c.code,
      type: c.type,
      value: c.value,
      max_usage: c.max_usage,
      min_plan_type: c.min_plan_type,
      expires_at: c.expires_at ? c.expires_at.split("T")[0] ?? "" : "",
      is_active: c.is_active,
    })
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.code || form.value <= 0) return
    setSaving(true)
    if (editId) {
      setCoupons((prev) =>
        prev.map((c) =>
          c.id === editId
            ? { ...c, ...form, expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null, value: Number(form.value), max_usage: form.max_usage ? Number(form.max_usage) : null }
            : c
        )
      )
    } else {
      const newCoupon: Coupon = {
        id: `c_${Date.now()}`,
        code: form.code.toUpperCase(),
        type: form.type,
        value: Number(form.value),
        max_usage: form.max_usage ? Number(form.max_usage) : null,
        current_usage: 0,
        min_plan_type: form.min_plan_type,
        expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
        is_active: form.is_active,
        created_at: new Date().toISOString(),
      }
      setCoupons((prev) => [...prev, newCoupon])
    }
    setSaving(false)
    setModalOpen(false)
    setEditId(null)
    setForm(EMPTY_FORM)
  }

  const handleDelete = () => {
    if (!confirmDelete) return
    setCoupons((prev) => prev.filter((c) => c.id !== confirmDelete.id))
    setConfirmDelete(null)
  }

  const handleToggleActive = (coupon: Coupon) => {
    if (isSupabaseReady()) {
      toggleCouponService(coupon.id, !coupon.is_active)
    }
    setCoupons((prev) =>
      prev.map((c) => (c.id === coupon.id ? { ...c, is_active: !c.is_active } : c))
    )
  }

  if (error) return <ErrorState message={error} onRetry={fetchData} />

  const columns: Column<Coupon>[] = [
    {
      key: "code", label: "Code", sortable: true, width: "160px",
      render: (c) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cm-surface flex items-center justify-center">
            <Ticket className="w-4 h-4 text-cm-text-muted" />
          </div>
          <div className="min-w-0">
            <code className="text-[13px] font-bold text-cm-text">{c.code}</code>
            <span className={`ml-2 inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full font-medium ${COUPON_TYPE_COLORS[c.type]}`}>
              <span className="w-2.5 h-2.5 flex items-center justify-center text-[9px] font-bold">{COUPON_TYPE_SYMBOLS[c.type]}</span>
              {COUPON_TYPE_LABELS[c.type]}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "value", label: "Valeur", sortable: true, width: "100px",
      render: (c) => (
        <span className="text-[13px] font-medium text-cm-text">
          {c.type === "percentage" ? `${c.value}%` : c.type === "free_month" ? `${c.value} mois` : formatXOF(c.value)}
        </span>
      ),
    },
    {
      key: "usage", label: "Utilisations", sortable: true, width: "120px",
      render: (c) => (
        <div className="flex flex-col">
          <span className="text-[12px] text-cm-text-soft">{c.current_usage}{c.max_usage ? ` / ${c.max_usage}` : ""}</span>
          {c.max_usage && (
            <div className="mt-1 h-1.5 bg-cm-surface rounded-full overflow-hidden w-20">
              <div className="h-full bg-cm-text rounded-full" style={{ width: `${Math.min(100, (c.current_usage / c.max_usage) * 100)}%` }} />
            </div>
          )}
        </div>
      ),
    },
    {
      key: "min_plan_type", label: "Type plan", width: "100px",
      render: (c) => (
        <span className="text-[12px] text-cm-text-muted">{c.min_plan_type ? (c.min_plan_type === "CLIENT" ? "Client" : "Pro") : "Tous"}</span>
      ),
    },
    {
      key: "expires_at", label: "Expire le", sortable: true, width: "110px",
      render: (c) => {
        if (!c.expires_at) return <span className="text-[12px] text-cm-text-muted">Jamais</span>
        const expired = new Date(c.expires_at) < new Date()
        return <span className={`text-[12px] ${expired ? "text-red-500" : "text-cm-text-muted"}`}>{format(new Date(c.expires_at), "d MMM yyyy", { locale: fr })}</span>
      },
    },
    {
      key: "is_active", label: "Actif", width: "80px",
      render: (c) => (
        <button onClick={(e) => { e.stopPropagation(); handleToggleActive(c) }}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium cursor-pointer transition-colors ${c.is_active ? "bg-[var(--admin-accent-soft)] text-[var(--admin-accent)]" : "bg-cm-surface text-cm-text-muted"}`}>
          {c.is_active ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
          {c.is_active ? "Actif" : "Inactif"}
        </button>
      ),
    },
    {
      key: "created_at", label: "Création", sortable: true, width: "90px",
      render: (c) => (
        <span className="text-[11px] text-cm-text-muted">{format(new Date(c.created_at), "d MMM", { locale: fr })}</span>
      ),
    },
    {
      key: "actions", label: "", width: "100px",
      render: (c) => (
        <div className="flex items-center gap-1">
          <button onClick={() => openEdit(c)}
            className="px-2 h-7 text-[11px] font-medium text-[var(--admin-accent)] hover:underline cursor-pointer">Modifier</button>
          <button onClick={() => setConfirmDelete(c)}
            className="px-2 h-7 text-[11px] font-medium text-red-500 hover:underline cursor-pointer">
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-bold text-cm-text">Codes promo</h1>
          <p className="text-[13px] text-cm-text-muted mt-0.5">{coupons.length} codes ({coupons.filter((c) => c.is_active).length} actifs)</p>
        </div>
        <button onClick={openCreate}
          className="h-9 px-4 bg-cm-text text-white text-[12px] font-medium rounded-lg hover:bg-cm-text/80 transition-colors flex items-center gap-1.5 cursor-pointer">
          <Plus className="w-3.5 h-3.5" /> Nouveau code
        </button>
      </div>

      <AdminTable
        columns={columns}
        data={coupons}
        keyExtractor={(c) => c.id}
        searchable
        searchKeys={["code"]}
        loading={loading}
        emptyMessage="Aucun code promo trouvé"
      />

      <Modal isOpen={modalOpen} onClose={() => !saving && setModalOpen(false)}
        title={editId ? "Modifier le code promo" : "Nouveau code promo"} size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-[12px] font-medium text-cm-text-soft mb-1">Code</label>
            <input type="text" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              placeholder="CODE promo"
              className="w-full h-9 px-3 text-[13px] font-mono uppercase bg-cm-surface border border-cm-border rounded-lg outline-none text-cm-text focus:border-cm-border" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-cm-text-soft mb-1">Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as CouponType })}
                className="w-full h-9 px-3 text-[13px] bg-cm-surface border border-cm-border rounded-lg outline-none text-cm-text focus:border-cm-border">
                {Object.entries(COUPON_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-medium text-cm-text-soft mb-1">
                {form.type === "percentage" ? "Pourcentage" : form.type === "free_month" ? "Nombre de mois" : "Montant (F CFA)"}
              </label>
              <input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
                min={0}
                className="w-full h-9 px-3 text-[13px] bg-cm-surface border border-cm-border rounded-lg outline-none text-cm-text focus:border-cm-border" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-cm-text-soft mb-1">Utilisations max</label>
              <input type="number" value={form.max_usage ?? ""} onChange={(e) => setForm({ ...form, max_usage: e.target.value ? Number(e.target.value) : null })}
                placeholder="Illimité"
                min={1}
                className="w-full h-9 px-3 text-[13px] bg-cm-surface border border-cm-border rounded-lg outline-none text-cm-text focus:border-cm-border" />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-cm-text-soft mb-1">Type de plan minimum</label>
              <select value={form.min_plan_type ?? ""} onChange={(e) => setForm({ ...form, min_plan_type: (e.target.value || null) as PlanType | null })}
                className="w-full h-9 px-3 text-[13px] bg-cm-surface border border-cm-border rounded-lg outline-none text-cm-text focus:border-cm-border">
                <option value="">Tous les plans</option>
                <option value="CLIENT">Client</option>
                <option value="PRO">Pro</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-medium text-cm-text-soft mb-1">Expire le</label>
            <input type="date" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
              className="w-full h-9 px-3 text-[13px] bg-cm-surface border border-cm-border rounded-lg outline-none text-cm-text focus:border-cm-border" />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              className="w-3.5 h-3.5 rounded border-cm-border text-cm-text accent-cm-text" />
            <span className="text-[12px] text-cm-text-soft">Actif</span>
          </label>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button onClick={() => setModalOpen(false)} disabled={saving}
              className="h-9 px-4 text-[12px] font-medium text-cm-text-soft bg-cm-elevated border border-cm-border rounded-lg hover:bg-cm-surface cursor-pointer disabled:opacity-50">Annuler</button>
            <button onClick={handleSave} disabled={saving || !form.code || form.value <= 0}
              className="h-9 px-4 bg-cm-text text-white text-[12px] font-medium rounded-lg hover:bg-cm-text/80 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50">
              <Save className="w-3.5 h-3.5" /> {saving ? "Enregistrement…" : editId ? "Enregistrer" : "Créer"}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!confirmDelete}
        onCancel={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        title="Supprimer le code promo"
        message={`Êtes-vous sûr de vouloir supprimer le code "${confirmDelete?.code}" ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        variant="danger"
      />
    </div>
  )
}
