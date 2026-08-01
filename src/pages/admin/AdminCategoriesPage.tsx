import { useState, useEffect, useCallback } from "react"
import { getCategories, createCategory, updateCategory, deleteCategory, toggleCategoryActive, findParentName, MOCK_CATEGORIES } from "../../services/admin/categories.service"
import type { CategoryRow } from "../../services/admin/categories.service"
import { usePermissions } from "../../hooks/usePermissions"
import { SERVICE_CATEGORIES } from "../../data/serviceCategories"
import Modal from "../../components/admin/ui/Modal"
import StatusBadge from "../../components/admin/ui/StatusBadge"
import ErrorState from "../../components/admin/ui/ErrorState"
import ConfirmDialog from "../../components/admin/ui/ConfirmDialog"
import { Plus, Pencil, Trash2, Save, ChevronDown, ChevronRight, Home, Truck, PartyPopper, BookOpen, Monitor, Handshake, Search, X } from "lucide-react"

const PARENT_ICONS: Record<string, React.ReactNode> = {
  "maison-reparations": <Home className="w-4 h-4" />,
  "transport-livraison": <Truck className="w-4 h-4" />,
  evenements: <PartyPopper className="w-4 h-4" />,
  "education-formation": <BookOpen className="w-4 h-4" />,
  "social-media-informatique": <Monitor className="w-4 h-4" />,
  "assistance-services": <Handshake className="w-4 h-4" />,
}

const PARENT_EMOJIS: Record<string, string> = {
  "maison-reparations": "🏠",
  "transport-livraison": "🚗",
  evenements: "🎉",
  "education-formation": "📚",
  "social-media-informatique": "💻",
  "assistance-services": "🤝",
}

const PARENT_COLORS: Record<string, string> = {
  "maison-reparations": "#2d6a4f",
  "transport-livraison": "#f4a261",
  evenements: "#457b9d",
  "education-formation": "#52b788",
  "social-media-informatique": "#457b9d",
  "assistance-services": "#f4a261",
}

interface CategoryForm {
  name: string
  slug: string
  parent_id: string
}

const emptyForm: CategoryForm = { name: "", slug: "", parent_id: "" }

export default function AdminCategoriesPage() {
  const { hasPermission } = usePermissions()
  const canCreate = hasPermission("categories.create")
  const canUpdate = hasPermission("categories.update")
  const canDelete = hasPermission("categories.delete")

  const [categories, setCategories] = useState<CategoryRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<CategoryForm>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<CategoryRow | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedParents, setExpandedParents] = useState<Set<string>>(new Set(SERVICE_CATEGORIES.map((c) => c.id)))

  const fetchCategories = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getCategories()
      setCategories(data)
    } catch {
      setError("Impossible de charger les catégories.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchCategories() }, [fetchCategories])

  const toggleExpand = (id: string) => {
    setExpandedParents((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const parents = categories.filter((c) => !c.parent_id)
  const children = categories.filter((c) => c.parent_id)

  const filteredParents = parents.filter((p) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    if (p.name.toLowerCase().includes(q)) return true
    return children.some((c) => c.parent_id === p.id && c.name.toLowerCase().includes(q))
  })

  const openCreateModal = (parentId: string) => {
    setEditingId(null)
    setForm({ name: "", slug: "", parent_id: parentId })
    setModalOpen(true)
  }

  const openEditModal = (cat: CategoryRow) => {
    setEditingId(cat.id)
    setForm({ name: cat.name, slug: cat.slug, parent_id: cat.parent_id ?? "" })
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.name || !form.slug) return
    if (!editingId && !canCreate) return
    if (editingId && !canUpdate) return
    setSaving(true)
    const payload = {
      name: form.name,
      slug: form.slug,
      description: undefined,
      icon: undefined,
      color: undefined,
      parent_id: form.parent_id || undefined,
      sort_order: 0,
    }
    const ok = editingId ? await updateCategory(editingId, payload) : await createCategory(payload)
    setSaving(false)
    if (ok) {
      setModalOpen(false)
      setForm(emptyForm)
      setEditingId(null)
      fetchCategories()
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget || !canDelete) return
    setDeleteLoading(true)
    const ok = await deleteCategory(deleteTarget.id)
    setDeleteLoading(false)
    setDeleteTarget(null)
    if (ok) fetchCategories()
  }

  const handleToggle = async (cat: CategoryRow) => {
    if (!canUpdate) return
    setActionLoading(cat.id)
    await toggleCategoryActive(cat.id, !cat.is_active)
    setActionLoading(null)
    fetchCategories()
  }

  const getParentIcon = (slug: string) => PARENT_ICONS[slug] ?? null
  const getParentEmoji = (slug: string) => PARENT_EMOJIS[slug] ?? "📁"
  const getParentColor = (slug: string) => PARENT_COLORS[slug] ?? "#6b7280"

  if (error) return <ErrorState message={error} onRetry={fetchCategories} />

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-bold text-cm-text">Catégories</h1>
          <p className="text-[13px] text-cm-text-muted mt-0.5">{parents.length} catégories · {children.length} sous-catégories</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-cm-text-muted" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher..."
              className="w-48 h-9 pl-8 pr-3 text-[12px] bg-cm-surface border border-cm-border rounded-lg outline-none text-cm-text focus:border-cm-border" />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-cm-text-muted hover:text-cm-text-soft cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-cm-elevated border border-cm-border rounded-xl overflow-hidden animate-pulse">
              <div className="h-12 bg-cm-surface" />
              {[1, 2].map((j) => <div key={j} className="h-10 bg-cm-surface border-t border-cm-border/40" />)}
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredParents.map((parent) => {
            const parentChildren = children.filter((c) => c.parent_id === parent.id)
            const isExpanded = expandedParents.has(parent.id)
            const hasSearchMatch = searchQuery && parentChildren.some((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()))

            return (
              <div key={parent.id} className="bg-cm-elevated border border-cm-border rounded-xl overflow-hidden">
                <div className="flex items-center gap-2 px-4 h-11 bg-cm-surface border-b border-cm-border/40 cursor-pointer hover:bg-cm-surface/80 transition-colors select-none"
                  onClick={() => toggleExpand(parent.id)}>
                  <button className="text-cm-text-muted hover:text-cm-text-soft cursor-pointer shrink-0">
                    {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  </button>
                  <span className="text-[15px]">{getParentEmoji(parent.slug)}</span>
                  <span className="text-[13px] font-semibold text-cm-text">{parent.name}</span>
                  <span className="text-[11px] text-cm-text-muted">({parentChildren.length} sous-catégorie{parentChildren.length !== 1 ? "s" : ""})</span>
                  {canCreate && (
                    <button onClick={(e) => { e.stopPropagation(); openCreateModal(parent.id) }}
                      className="ml-auto flex items-center gap-1 h-7 px-2.5 rounded-lg text-[11px] font-medium text-cm-text-muted hover:text-cm-text-soft hover:bg-cm-border-soft/50 cursor-pointer transition-colors">
                      <Plus className="w-3 h-3" /> Ajouter
                    </button>
                  )}
                </div>
                {isExpanded && (
                  <div className="divide-y divide-cm-border/40">
                    {parentChildren.length === 0 && (
                      <div className="px-4 py-6 text-center text-[12px] text-cm-text-muted">
                        Aucune sous-catégorie
                      </div>
                    )}
                    {parentChildren.map((child) => (
                      <div key={child.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-cm-surface/50 transition-colors min-h-[40px]">
                        <div className="w-5 h-5 rounded-full bg-cm-surface flex items-center justify-center text-[10px] text-cm-text-muted shrink-0">
                          {child.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] font-medium text-cm-text">{child.name}</span>
                            <span className="text-[10px] text-cm-text-muted font-mono">{child.slug}</span>
                          </div>
                        </div>
                        <StatusBadge status={child.is_active ? "active" : "inactive"} label={child.is_active ? "Actif" : "Inactif"} />
                        <span className="text-[11px] text-cm-text-muted w-12 text-right">{child.pro_count} pro{child.pro_count !== 1 ? "s" : ""}</span>
                        {canUpdate && (
                          <div className="flex items-center gap-1">
                            <button onClick={() => openEditModal(child)}
                              className="w-7 h-7 flex items-center justify-center rounded-lg text-cm-text-muted hover:text-cm-text-soft hover:bg-cm-surface cursor-pointer">
                              <Pencil className="w-3 h-3" />
                            </button>
                            <button onClick={() => handleToggle(child)} disabled={actionLoading === child.id}
                              className={`w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer disabled:opacity-50 ${
                                child.is_active ? "text-amber-500 hover:bg-amber-50" : "text-emerald-500 hover:bg-emerald-50"
                              }`}>
                              {child.is_active ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                            </button>
                            {canDelete && (
                              <button onClick={() => setDeleteTarget(child)}
                                className="w-7 h-7 flex items-center justify-center rounded-lg text-cm-text-muted hover:text-red-500 hover:bg-red-50 cursor-pointer">
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
          {filteredParents.length === 0 && (
            <div className="bg-cm-elevated border border-cm-border rounded-xl py-12 text-center text-[13px] text-cm-text-muted">
              Aucune catégorie trouvée
            </div>
          )}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => { if (!saving) { setModalOpen(false); } }} title={editingId ? "Modifier la sous-catégorie" : "Nouvelle sous-catégorie"} size="sm">
        <div className="space-y-4">
          <div>
            <label className="block text-[12px] font-medium text-cm-text-soft mb-1">Catégorie parente</label>
            <select value={form.parent_id} onChange={(e) => setForm({ ...form, parent_id: e.target.value })}
              className="w-full h-9 px-3 text-[13px] bg-cm-surface border border-cm-border rounded-lg outline-none text-cm-text focus:border-cm-border cursor-pointer">
              {parents.map((p) => (
                <option key={p.id} value={p.id}>{getParentEmoji(p.slug)} {p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[12px] font-medium text-cm-text-soft mb-1">Nom</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ex: Plombier, Électricien…"
              className="w-full h-9 px-3 text-[13px] bg-cm-surface border border-cm-border rounded-lg outline-none text-cm-text focus:border-cm-border" />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-cm-text-soft mb-1">Slug</label>
            <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder="Ex: plombier, electricien…"
              className="w-full h-9 px-3 text-[13px] bg-cm-surface border border-cm-border rounded-lg outline-none text-cm-text focus:border-cm-border font-mono" />
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button onClick={() => { setModalOpen(false) }} disabled={saving}
              className="h-9 px-4 text-[12px] font-medium text-cm-text-soft bg-cm-elevated border border-cm-border rounded-lg hover:bg-cm-surface cursor-pointer disabled:opacity-50">
              Annuler
            </button>
            <button onClick={handleSave} disabled={saving || !form.name || !form.slug}
              className="h-9 px-4 bg-cm-text text-white text-[12px] font-medium rounded-lg hover:bg-cm-text/80 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50">
              <Save className="w-3.5 h-3.5" /> {saving ? "Enregistrement…" : editingId ? "Enregistrer" : "Créer"}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Supprimer la sous-catégorie"
        message={`Êtes-vous sûr de vouloir supprimer "${deleteTarget?.name}" ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        variant="danger"
      />
    </div>
  )
}
