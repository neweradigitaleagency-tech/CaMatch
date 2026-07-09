import { useState, useEffect, useCallback } from "react"
import { getFeatureFlags, updateFeatureFlag, createFeatureFlag, deleteFeatureFlag, CATEGORY_LABELS, CATEGORY_ORDER } from "../../services/admin/feature-flags.service"
import type { FeatureFlag } from "../../services/admin/feature-flags.service"
import PageHeader from "../../components/admin/ui/PageHeader"
import Modal from "../../components/admin/ui/Modal"
import ConfirmDialog from "../../components/admin/ui/ConfirmDialog"
import ErrorState from "../../components/admin/ui/ErrorState"
import { ToggleLeft, ToggleRight, Plus, Trash2, Save, Flag, CheckCircle, XCircle } from "lucide-react"

const CATEGORY_ICONS: Record<string, string> = {
  communication: "💬",
  payments: "💳",
  ai: "🤖",
  security: "🔒",
  engagement: "📈",
  premium: "⭐",
}

export default function AdminFeatureFlagsPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toggling, setToggling] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ key: "", label: "", description: "", category: "engagement" })
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<FeatureFlag | null>(null)

  const fetchFlags = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { flags } = await getFeatureFlags()
      setFlags(flags)
    } catch {
      setError("Impossible de charger les feature flags.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchFlags() }, [fetchFlags])

  const handleToggle = async (flag: FeatureFlag) => {
    setToggling(flag.id)
    const ok = await updateFeatureFlag(flag.id, { enabled: !flag.enabled })
    if (ok) setFlags((prev) => prev.map((f) => f.id === flag.id ? { ...f, enabled: !f.enabled } : f))
    setToggling(null)
  }

  const handleCreate = async () => {
    if (!form.key || !form.label) return
    setSaving(true)
    const id = await createFeatureFlag({ key: form.key, label: form.label, description: form.description || undefined, category: form.category })
    if (id) {
      const newFlag: FeatureFlag = { id, key: form.key, label: form.label, description: form.description || null, enabled: false, category: form.category, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
      setFlags((prev) => [...prev, newFlag])
    }
    setSaving(false)
    setModalOpen(false)
    setForm({ key: "", label: "", description: "", category: "engagement" })
  }

  const handleDelete = async () => {
    if (!confirmDelete) return
    const ok = await deleteFeatureFlag(confirmDelete.id)
    if (ok) setFlags((prev) => prev.filter((f) => f.id !== confirmDelete.id))
    setConfirmDelete(null)
  }

  const grouped = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    label: CATEGORY_LABELS[cat] ?? cat,
    flags: flags.filter((f) => f.category === cat),
  })).filter((g) => g.flags.length > 0)

  if (error) return <ErrorState message={error} onRetry={fetchFlags} />

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <PageHeader title="Feature Flags" description={`${flags.length} flags · ${flags.filter((f) => f.enabled).length} actifs`} />
        <button onClick={() => setModalOpen(true)}
          className="h-9 px-4 bg-gray-900 text-white text-[12px] font-medium rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-1.5 cursor-pointer">
          <Plus className="w-3.5 h-3.5" /> Nouveau flag
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-32 mb-3" />
              <div className="space-y-2">
                {[1, 2].map((j) => (
                  <div key={j} className="h-12 bg-gray-100 rounded-lg" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {grouped.map((group) => (
            <div key={group.category} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                <span className="text-[14px]">{CATEGORY_ICONS[group.category] ?? "🏷️"}</span>
                <h3 className="text-[13px] font-semibold text-gray-900">{group.label}</h3>
                <span className="text-[11px] text-gray-400 ml-auto">{group.flags.filter((f) => f.enabled).length}/{group.flags.length} actifs</span>
              </div>
              <div className="divide-y divide-gray-50">
                {group.flags.map((flag) => (
                  <div key={flag.id} className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50/50 transition-colors">
                    <button onClick={() => handleToggle(flag)}
                      disabled={toggling === flag.id}
                      className={`shrink-0 w-12 h-6 rounded-full transition-colors relative cursor-pointer disabled:opacity-50 ${flag.enabled ? "bg-emerald-500" : "bg-gray-300"}`}>
                      <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${flag.enabled ? "translate-x-6" : "translate-x-0.5"}`} />
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <code className="text-[11px] font-mono text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">{flag.key}</code>
                        <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${flag.enabled ? "text-emerald-600" : "text-gray-400"}`}>
                          {flag.enabled ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {flag.enabled ? "Actif" : "Inactif"}
                        </span>
                      </div>
                      <p className="text-[13px] font-medium text-gray-900 mt-0.5">{flag.label}</p>
                      {flag.description && <p className="text-[11px] text-gray-400 mt-0.5">{flag.description}</p>}
                    </div>
                    <button onClick={() => setConfirmDelete(flag)}
                      className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 cursor-pointer">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => !saving && setModalOpen(false)} title="Nouveau feature flag" size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1">Clé</label>
            <input type="text" value={form.key} onChange={(e) => setForm({ ...form, key: e.target.value })}
              placeholder="feature_key"
              className="w-full h-9 px-3 text-[13px] bg-gray-50 border border-gray-200 rounded-lg outline-none text-gray-900 focus:border-gray-300 font-mono" />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1">Nom</label>
            <input type="text" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })}
              className="w-full h-9 px-3 text-[13px] bg-gray-50 border border-gray-200 rounded-lg outline-none text-gray-900 focus:border-gray-300" />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full h-20 px-3 py-2 text-[13px] bg-gray-50 border border-gray-200 rounded-lg outline-none text-gray-900 focus:border-gray-300 resize-none" />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1">Catégorie</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full h-9 px-3 text-[13px] bg-gray-50 border border-gray-200 rounded-lg outline-none text-gray-900 focus:border-gray-300 cursor-pointer">
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button onClick={() => setModalOpen(false)} disabled={saving}
              className="h-9 px-4 text-[12px] font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer disabled:opacity-50">Annuler</button>
            <button onClick={handleCreate} disabled={saving || !form.key || !form.label}
              className="h-9 px-4 bg-gray-900 text-white text-[12px] font-medium rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50">
              <Save className="w-3.5 h-3.5" /> {saving ? "Création…" : "Créer"}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!confirmDelete}
        onCancel={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        title="Supprimer le flag"
        message={`Êtes-vous sûr de vouloir supprimer le flag "${confirmDelete?.label}" ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        variant="danger"
      />
    </div>
  )
}
