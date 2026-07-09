import { useState, useEffect, useCallback } from "react"
import { Plus, Save, Tag, ToggleLeft, ToggleRight, Trash2 } from "lucide-react"
import AdminTable from "../../components/admin/ui/AdminTable"
import type { Column } from "../../components/admin/ui/AdminTable"
import StatusBadge from "../../components/admin/ui/StatusBadge"
import ErrorState from "../../components/admin/ui/ErrorState"
import Modal from "../../components/admin/ui/Modal"
import ConfirmDialog from "../../components/admin/ui/ConfirmDialog"
import { formatXOF } from "../../utils/admin/formatCurrency"
import type { Plan, PlanType } from "../../types/subscription"

const PLAN_TYPES: PlanType[] = ["CLIENT", "PRO"]

const MOCK_PLANS_WITH_INACTIVE: Plan[] = [
  { id: "plan_client_free", name: "Free", type: "CLIENT", description: "Accès de base à la plateforme", price_monthly: 0, price_yearly: 0, currency: "XOF", active: true, display_order: 1, badge: null, recommended: false, trial_days: 0, created_at: new Date().toISOString() },
  { id: "plan_client_plus", name: "Plus", type: "CLIENT", description: "Pour les clients réguliers", price_monthly: 4900, price_yearly: 49000, currency: "XOF", active: true, display_order: 2, badge: "POPULAIRE", recommended: true, trial_days: 7, created_at: new Date().toISOString() },
  { id: "plan_client_premium", name: "Premium", type: "CLIENT", description: "Expérience VIP complète", price_monthly: 14900, price_yearly: 149000, currency: "XOF", active: true, display_order: 3, badge: "PREMIUM", recommended: false, trial_days: 7, created_at: new Date().toISOString() },
  { id: "plan_client_ancien", name: "Ancien", type: "CLIENT", description: "Ancien plan plus utilisé", price_monthly: 3900, price_yearly: 39000, currency: "XOF", active: false, display_order: 4, badge: null, recommended: false, trial_days: 0, created_at: new Date(Date.now() - 180 * 86400000).toISOString() },
  { id: "plan_pro_free", name: "Free", type: "PRO", description: "Pour démarrer", price_monthly: 0, price_yearly: 0, currency: "XOF", active: true, display_order: 1, badge: null, recommended: false, trial_days: 0, created_at: new Date().toISOString() },
  { id: "plan_pro_starter", name: "Starter", type: "PRO", description: "Pour les pros en croissance", price_monthly: 9900, price_yearly: 99000, currency: "XOF", active: true, display_order: 2, badge: "POPULAIRE", recommended: true, trial_days: 14, created_at: new Date().toISOString() },
  { id: "plan_pro_business", name: "Business", type: "PRO", description: "Pour les pros établis", price_monthly: 24900, price_yearly: 249000, currency: "XOF", active: true, display_order: 3, badge: "RECOMMANDÉ", recommended: false, trial_days: 14, created_at: new Date().toISOString() },
  { id: "plan_pro_premium", name: "Premium", type: "PRO", description: "Pour les pros au top", price_monthly: 49900, price_yearly: 499000, currency: "XOF", active: true, display_order: 4, badge: "PREMIUM", recommended: false, trial_days: 14, created_at: new Date().toISOString() },
  { id: "plan_pro_legacy", name: "Legacy", type: "PRO", description: "Ancien plan pro", price_monthly: 14900, price_yearly: 149000, currency: "XOF", active: false, display_order: 5, badge: null, recommended: false, trial_days: 0, created_at: new Date(Date.now() - 365 * 86400000).toISOString() },
]

interface PlanForm {
  name: string
  type: PlanType
  price_monthly: number
  price_yearly: number
  description: string
  badge: string
  display_order: number
  recommended: boolean
  trial_days: number
  active: boolean
}

const EMPTY_FORM: PlanForm = {
  name: "", type: "CLIENT", price_monthly: 0, price_yearly: 0, description: "", badge: "",
  display_order: 1, recommended: false, trial_days: 0, active: true,
}

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<PlanForm>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<Plan | null>(null)
  const [filterType, setFilterType] = useState<string>("all")

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      await new Promise((r) => setTimeout(r, 300))
      setPlans(MOCK_PLANS_WITH_INACTIVE)
    } catch {
      setPlans(MOCK_PLANS_WITH_INACTIVE)
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

  const openEdit = (plan: Plan) => {
    setEditId(plan.id)
    setForm({
      name: plan.name,
      type: plan.type,
      price_monthly: plan.price_monthly,
      price_yearly: plan.price_yearly,
      description: plan.description ?? "",
      badge: plan.badge ?? "",
      display_order: plan.display_order,
      recommended: plan.recommended,
      trial_days: plan.trial_days,
      active: plan.active,
    })
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.name) return
    setSaving(true)
    await new Promise((r) => setTimeout(r, 300))
    if (editId) {
      setPlans((prev) =>
        prev.map((p) =>
          p.id === editId
            ? { ...p, ...form, description: form.description || null, badge: form.badge || null, updated_at: new Date().toISOString() }
            : p
        )
      )
    } else {
      const newPlan: Plan = {
        id: `plan_${Date.now()}`,
        ...form,
        description: form.description || null,
        badge: form.badge || null,
        currency: "XOF",
        created_at: new Date().toISOString(),
      }
      setPlans((prev) => [...prev, newPlan])
    }
    setSaving(false)
    setModalOpen(false)
    setEditId(null)
    setForm(EMPTY_FORM)
  }

  const handleDelete = () => {
    if (!confirmDelete) return
    setPlans((prev) => prev.filter((p) => p.id !== confirmDelete.id))
    setConfirmDelete(null)
  }

  const handleToggleActive = (plan: Plan) => {
    setPlans((prev) =>
      prev.map((p) => (p.id === plan.id ? { ...p, active: !p.active } : p))
    )
  }

  const filtered = filterType === "all" ? plans : plans.filter((p) => p.type === filterType)

  if (error) return <ErrorState message={error} onRetry={fetchData} />

  const columns: Column<Plan>[] = [
    {
      key: "name", label: "Plan", sortable: true, width: "180px",
      render: (p) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
            <Tag className="w-4 h-4 text-gray-500" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-medium text-gray-900">{p.name}</span>
              {p.badge && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">{p.badge}</span>}
            </div>
            <p className="text-[11px] text-gray-400">{p.description ?? "—"}</p>
          </div>
        </div>
      ),
    },
    {
      key: "type", label: "Type", sortable: true, width: "80px",
      render: (p) => (
        <span className="text-[12px] font-medium text-gray-600">{p.type === "CLIENT" ? "Client" : "Pro"}</span>
      ),
    },
    {
      key: "price_monthly", label: "Prix mensuel", sortable: true, width: "110px",
      render: (p) => (
        <span className="text-[13px] font-medium text-gray-900">{p.price_monthly === 0 ? "Gratuit" : formatXOF(p.price_monthly)}</span>
      ),
    },
    {
      key: "price_yearly", label: "Prix annuel", sortable: true, width: "110px",
      render: (p) => (
        <span className="text-[13px] font-medium text-gray-900">{p.price_yearly === 0 ? "Gratuit" : formatXOF(p.price_yearly)}</span>
      ),
    },
    {
      key: "order", label: "Ordre", width: "60px",
      render: (p) => <span className="text-[12px] text-gray-500">{p.display_order}</span>,
    },
    {
      key: "trial_days", label: "Essai", width: "60px",
      render: (p) => <span className="text-[12px] text-gray-500">{p.trial_days > 0 ? `${p.trial_days}j` : "—"}</span>,
    },
    {
      key: "recommended", label: "Recommandé", width: "90px",
      render: (p) => p.recommended ? <StatusBadge status="active" label="Oui" /> : <span className="text-[12px] text-gray-400">Non</span>,
    },
    {
      key: "active", label: "Actif", width: "80px",
      render: (p) => (
        <button onClick={(e) => { e.stopPropagation(); handleToggleActive(p) }}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium cursor-pointer transition-colors ${p.active ? "bg-[var(--admin-accent-soft)] text-[var(--admin-accent)]" : "bg-gray-100 text-gray-500"}`}>
          {p.active ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
          {p.active ? "Actif" : "Inactif"}
        </button>
      ),
    },
    {
      key: "actions", label: "", width: "100px",
      render: (p) => (
        <div className="flex items-center gap-1">
          <button onClick={() => openEdit(p)}
            className="px-2 h-7 text-[11px] font-medium text-[var(--admin-accent)] hover:underline cursor-pointer">Modifier</button>
          <button onClick={() => setConfirmDelete(p)}
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
          <h1 className="text-[20px] font-bold text-gray-900">Plans</h1>
          <p className="text-[13px] text-gray-500 mt-0.5">{plans.length} plans ({plans.filter((p) => p.active).length} actifs)</p>
        </div>
        <button onClick={openCreate}
          className="h-9 px-4 bg-gray-900 text-white text-[12px] font-medium rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-1.5 cursor-pointer">
          <Plus className="w-3.5 h-3.5" /> Nouveau plan
        </button>
      </div>

      <div className="flex items-center gap-2">
        {[{ key: "all", label: "Tous" }, { key: "CLIENT", label: "Client" }, { key: "PRO", label: "Pro" }].map((f) => (
          <button key={f.key} onClick={() => setFilterType(f.key)}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-medium whitespace-nowrap cursor-pointer transition-colors ${filterType === f.key ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
            {f.label}
          </button>
        ))}
      </div>

      <AdminTable
        columns={columns}
        data={filtered}
        keyExtractor={(p) => p.id}
        searchable
        searchKeys={["name", "description", "badge"]}
        loading={loading}
        emptyMessage="Aucun plan trouvé"
      />

      <Modal isOpen={modalOpen} onClose={() => !saving && setModalOpen(false)}
        title={editId ? "Modifier le plan" : "Nouveau plan"} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-gray-700 mb-1">Nom</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full h-9 px-3 text-[13px] bg-gray-50 border border-gray-200 rounded-lg outline-none text-gray-900 focus:border-gray-300" />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-gray-700 mb-1">Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as PlanType })}
                className="w-full h-9 px-3 text-[13px] bg-gray-50 border border-gray-200 rounded-lg outline-none text-gray-900 focus:border-gray-300">
                {PLAN_TYPES.map((t) => <option key={t} value={t}>{t === "CLIENT" ? "Client" : "Pro"}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-gray-700 mb-1">Prix mensuel (F CFA)</label>
              <input type="number" value={form.price_monthly} onChange={(e) => setForm({ ...form, price_monthly: Number(e.target.value) })}
                className="w-full h-9 px-3 text-[13px] bg-gray-50 border border-gray-200 rounded-lg outline-none text-gray-900 focus:border-gray-300" />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-gray-700 mb-1">Prix annuel (F CFA)</label>
              <input type="number" value={form.price_yearly} onChange={(e) => setForm({ ...form, price_yearly: Number(e.target.value) })}
                className="w-full h-9 px-3 text-[13px] bg-gray-50 border border-gray-200 rounded-lg outline-none text-gray-900 focus:border-gray-300" />
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full h-20 px-3 py-2 text-[13px] bg-gray-50 border border-gray-200 rounded-lg outline-none text-gray-900 focus:border-gray-300 resize-none" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-gray-700 mb-1">Badge</label>
              <input type="text" value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })}
                placeholder="POPULAIRE"
                className="w-full h-9 px-3 text-[13px] bg-gray-50 border border-gray-200 rounded-lg outline-none text-gray-900 focus:border-gray-300" />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-gray-700 mb-1">Ordre d'affichage</label>
              <input type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })}
                className="w-full h-9 px-3 text-[13px] bg-gray-50 border border-gray-200 rounded-lg outline-none text-gray-900 focus:border-gray-300" />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-gray-700 mb-1">Jours d'essai</label>
              <input type="number" value={form.trial_days} onChange={(e) => setForm({ ...form, trial_days: Number(e.target.value) })}
                className="w-full h-9 px-3 text-[13px] bg-gray-50 border border-gray-200 rounded-lg outline-none text-gray-900 focus:border-gray-300" />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.recommended} onChange={(e) => setForm({ ...form, recommended: e.target.checked })}
                className="w-3.5 h-3.5 rounded border-gray-300 text-gray-900 accent-gray-900" />
              <span className="text-[12px] text-gray-700">Recommandé</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })}
                className="w-3.5 h-3.5 rounded border-gray-300 text-gray-900 accent-gray-900" />
              <span className="text-[12px] text-gray-700">Actif</span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button onClick={() => setModalOpen(false)} disabled={saving}
              className="h-9 px-4 text-[12px] font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer disabled:opacity-50">Annuler</button>
            <button onClick={handleSave} disabled={saving || !form.name}
              className="h-9 px-4 bg-gray-900 text-white text-[12px] font-medium rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50">
              <Save className="w-3.5 h-3.5" /> {saving ? "Enregistrement…" : editId ? "Enregistrer" : "Créer"}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!confirmDelete}
        onCancel={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        title="Supprimer le plan"
        message={`Êtes-vous sûr de vouloir supprimer le plan "${confirmDelete?.name}" ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        variant="danger"
      />
    </div>
  )
}
