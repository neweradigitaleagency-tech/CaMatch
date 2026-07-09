import { useState, useEffect, useCallback } from "react"
import { Plus, Save, Trash2, Puzzle } from "lucide-react"
import AdminTable from "../../components/admin/ui/AdminTable"
import type { Column } from "../../components/admin/ui/AdminTable"
import ErrorState from "../../components/admin/ui/ErrorState"
import Modal from "../../components/admin/ui/Modal"
import ConfirmDialog from "../../components/admin/ui/ConfirmDialog"
import type { Feature } from "../../types/subscription"

const MOCK_FEATURES: Feature[] = [
  { id: "f1", name: "Recherche professionnels", code: "search_pros", description: "Accéder à l'annuaire des professionnels" },
  { id: "f2", name: "Création demandes", code: "create_requests", description: "Publier des demandes de service" },
  { id: "f3", name: "Réservation", code: "booking", description: "Réserver un professionnel" },
  { id: "f4", name: "Messagerie illimitée", code: "unlimited_messages", description: "Messagerie sans limite" },
  { id: "f5", name: "Avis et notation", code: "reviews", description: "Noter les professionnels" },
  { id: "f6", name: "Matching prioritaire", code: "priority_matching", description: "Être matché en priorité avec les meilleurs pros" },
  { id: "f7", name: "Demandes simultanées", code: "concurrent_requests", description: "Nombre de demandes actives simultanément" },
  { id: "f8", name: "Favoris illimités", code: "unlimited_favorites", description: "Sauvegarder des pros en favoris sans limite" },
  { id: "f9", name: "Historique complet", code: "full_history", description: "Accès à tout l'historique des missions" },
  { id: "f10", name: "Support prioritaire", code: "priority_support", description: "Support client prioritaire" },
  { id: "f11", name: "Badge client vérifié", code: "verified_badge", description: "Badge de confiance sur le profil" },
  { id: "f12", name: "Matching IA avancé", code: "ai_matching", description: "Algorithme IA pour trouver le meilleur pro" },
  { id: "f13", name: "Concierge", code: "concierge", description: "Assistance personnelle pour vos demandes" },
  { id: "f14", name: "Offres exclusives", code: "exclusive_offers", description: "Accès à des offres et promotions exclusives" },
  { id: "f15", name: "Support VIP", code: "vip_support", description: "Support dédié 24/7" },
  { id: "f16", name: "Création profil pro", code: "pro_profile", description: "Créer et gérer son profil professionnel" },
  { id: "f17", name: "Ajout services", code: "manage_services", description: "Configurer ses services et tarifs" },
  { id: "f18", name: "Portfolio", code: "portfolio", description: "Galerie de réalisations" },
  { id: "f19", name: "Candidatures missions", code: "job_applications", description: "Postuler aux demandes des clients" },
  { id: "f20", name: "Badge professionnel", code: "pro_badge", description: "Badge vérifié sur le profil" },
]

interface FeatureForm {
  name: string
  code: string
  description: string
}

const EMPTY_FORM: FeatureForm = { name: "", code: "", description: "" }

export default function AdminFeaturesPage() {
  const [features, setFeatures] = useState<Feature[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<FeatureForm>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<Feature | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      await new Promise((r) => setTimeout(r, 300))
      setFeatures(MOCK_FEATURES)
    } catch {
      setFeatures(MOCK_FEATURES)
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

  const openEdit = (f: Feature) => {
    setEditId(f.id)
    setForm({ name: f.name, code: f.code, description: f.description ?? "" })
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.name || !form.code) return
    setSaving(true)
    await new Promise((r) => setTimeout(r, 300))
    if (editId) {
      setFeatures((prev) =>
        prev.map((f) =>
          f.id === editId
            ? { ...f, name: form.name, code: form.code, description: form.description || null }
            : f
        )
      )
    } else {
      const newFeature: Feature = {
        id: `f_${Date.now()}`,
        name: form.name,
        code: form.code,
        description: form.description || null,
      }
      setFeatures((prev) => [...prev, newFeature])
    }
    setSaving(false)
    setModalOpen(false)
    setEditId(null)
    setForm(EMPTY_FORM)
  }

  const handleDelete = () => {
    if (!confirmDelete) return
    setFeatures((prev) => prev.filter((f) => f.id !== confirmDelete.id))
    setConfirmDelete(null)
  }

  if (error) return <ErrorState message={error} onRetry={fetchData} />

  const columns: Column<Feature>[] = [
    {
      key: "name", label: "Nom", sortable: true, width: "250px",
      render: (f) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
            <Puzzle className="w-4 h-4 text-gray-500" />
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-gray-900">{f.name}</p>
            <p className="text-[11px] text-gray-400">{f.description ?? "—"}</p>
          </div>
        </div>
      ),
    },
    {
      key: "code", label: "Code", sortable: true, width: "180px",
      render: (f) => <code className="text-[12px] font-mono text-gray-600 bg-gray-50 px-1.5 py-0.5 rounded">{f.code}</code>,
    },
    {
      key: "id", label: "ID", width: "120px",
      render: (f) => <span className="text-[11px] font-mono text-gray-400">{f.id}</span>,
    },
    {
      key: "actions", label: "", width: "100px",
      render: (f) => (
        <div className="flex items-center gap-1">
          <button onClick={() => openEdit(f)}
            className="px-2 h-7 text-[11px] font-medium text-[var(--admin-accent)] hover:underline cursor-pointer">Modifier</button>
          <button onClick={() => setConfirmDelete(f)}
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
          <h1 className="text-[20px] font-bold text-gray-900">Fonctionnalités</h1>
          <p className="text-[13px] text-gray-500 mt-0.5">{features.length} fonctionnalités disponibles</p>
        </div>
        <button onClick={openCreate}
          className="h-9 px-4 bg-gray-900 text-white text-[12px] font-medium rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-1.5 cursor-pointer">
          <Plus className="w-3.5 h-3.5" /> Nouvelle fonctionnalité
        </button>
      </div>

      <AdminTable
        columns={columns}
        data={features}
        keyExtractor={(f) => f.id}
        searchable
        searchKeys={["name", "code", "description"]}
        loading={loading}
        emptyMessage="Aucune fonctionnalité trouvée"
      />

      <Modal isOpen={modalOpen} onClose={() => !saving && setModalOpen(false)}
        title={editId ? "Modifier la fonctionnalité" : "Nouvelle fonctionnalité"} size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1">Nom</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full h-9 px-3 text-[13px] bg-gray-50 border border-gray-200 rounded-lg outline-none text-gray-900 focus:border-gray-300" />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1">Code</label>
            <input type="text" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })}
              placeholder="feature_code"
              className="w-full h-9 px-3 text-[13px] bg-gray-50 border border-gray-200 rounded-lg outline-none text-gray-900 focus:border-gray-300" />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full h-20 px-3 py-2 text-[13px] bg-gray-50 border border-gray-200 rounded-lg outline-none text-gray-900 focus:border-gray-300 resize-none" />
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button onClick={() => setModalOpen(false)} disabled={saving}
              className="h-9 px-4 text-[12px] font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer disabled:opacity-50">Annuler</button>
            <button onClick={handleSave} disabled={saving || !form.name || !form.code}
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
        title="Supprimer la fonctionnalité"
        message={`Êtes-vous sûr de vouloir supprimer la fonctionnalité "${confirmDelete?.name}" ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        variant="danger"
      />
    </div>
  )
}
