import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { usePermissions } from "../../hooks/usePermissions"
import { getCMSPages, createCMSPage, updateCMSPage, deleteCMSPage } from "../../services/admin/cms.service"
import Modal from "../../components/admin/ui/Modal"
import ConfirmDialog from "../../components/admin/ui/ConfirmDialog"
import StatusBadge from "../../components/admin/ui/StatusBadge"
import ErrorState from "../../components/admin/ui/ErrorState"
import AdminTable from "../../components/admin/ui/AdminTable"
import type { Column } from "../../components/admin/ui/AdminTable"
import type { CMSPageRow } from "../../services/admin/cms.service"
import { Plus, FileText, ExternalLink, Save, Eye, EyeOff, Trash2 } from "lucide-react"

import { format } from "date-fns"
import { fr } from "date-fns/locale"

interface PageForm {
  slug: string
  title: string
  content: string
  meta_title: string
  meta_description: string
}

const emptyForm: PageForm = { slug: "", title: "", content: "", meta_title: "", meta_description: "" }

export default function AdminCMSPage() {
  const navigate = useNavigate()
  const { hasPermission } = usePermissions()
  const canCreate = hasPermission("cms.create")
  const canUpdate = hasPermission("cms.update")
  const canDelete = hasPermission("cms.delete")

  const [pages, setPages] = useState<CMSPageRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<PageForm>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<CMSPageRow | null>(null)

  const fetchPages = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getCMSPages()
      setPages(data)
    } catch {
      setError("Impossible de charger les pages.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchPages() }, [fetchPages])

  const openCreate = () => {
    setEditId(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  const openEdit = (page: CMSPageRow) => {
    setEditId(page.id)
    setForm({
      slug: page.slug,
      title: page.title,
      content: page.content,
      meta_title: page.meta_title ?? "",
      meta_description: page.meta_description ?? "",
    })
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.slug || !form.title) return
    setSaving(true)
    let ok: boolean
    if (editId) {
      ok = await updateCMSPage(editId, {
        slug: form.slug,
        title: form.title,
        content: form.content,
        meta_title: form.meta_title || undefined,
        meta_description: form.meta_description || undefined,
      })
    } else {
      ok = await createCMSPage({
        slug: form.slug,
        title: form.title,
        content: form.content,
        meta_title: form.meta_title || undefined,
        meta_description: form.meta_description || undefined,
      })
    }
    setSaving(false)
    if (ok) {
      setModalOpen(false)
      setEditId(null)
      setForm(emptyForm)
      fetchPages()
    }
  }

  const handlePublish = async (page: CMSPageRow) => {
    if (!canUpdate) return
    const newStatus = page.status === "published" ? "draft" : "published"
    await updateCMSPage(page.id, { status: newStatus })
    fetchPages()
  }

  const handleDelete = async () => {
    if (!confirmDelete || !canDelete) return
    await deleteCMSPage(confirmDelete.id)
    setConfirmDelete(null)
    fetchPages()
  }

  const columns: Column<CMSPageRow>[] = [
    {
      key: "slug", label: "Page", sortable: true, width: "250px",
      render: (p) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cm-surface flex items-center justify-center">
            <FileText className="w-4 h-4 text-cm-text-muted" />
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-cm-text">{p.title}</p>
            <p className="text-[11px] text-cm-text-muted">/{p.slug}</p>
          </div>
        </div>
      ),
    },
    {
      key: "author_name", label: "Auteur", width: "120px",
      render: (p) => <span className="text-[12px] text-cm-text-soft">{p.author_name ?? "—"}</span>,
    },
    {
      key: "status", label: "Statut", sortable: true, width: "110px",
      render: (p) => (
        <StatusBadge
          status={p.status === "published" ? "published" : p.status === "draft" ? "draft" : "archived"}
          label={p.status === "published" ? "Publiée" : p.status === "draft" ? "Brouillon" : "Archivée"}
        />
      ),
    },
    {
      key: "published_at", label: "Publiée le", sortable: true, width: "120px",
      render: (p) => (
        <span className="text-[12px] text-cm-text-muted">
          {p.published_at ? format(new Date(p.published_at), "d MMM yyyy", { locale: fr }) : "—"}
        </span>
      ),
    },
    {
      key: "updated_at", label: "Modifiée le", sortable: true, width: "120px",
      render: (p) => (
        <span className="text-[12px] text-cm-text-muted">
          {format(new Date(p.updated_at), "d MMM yyyy", { locale: fr })}
        </span>
      ),
    },
    {
      key: "actions", label: "", width: "140px",
      render: (p) => (
        <div className="flex items-center gap-1">
          {canUpdate && (
            <>
              <button onClick={() => openEdit(p)}
                className="text-[11px] font-medium text-[var(--admin-accent)] hover:underline cursor-pointer px-1">Modifier</button>
              <button onClick={() => handlePublish(p)}
                className="text-[11px] font-medium cursor-pointer px-1 flex items-center gap-0.5 text-cm-text-muted hover:text-cm-text-soft">
                {p.status === "published" ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                {p.status === "published" ? "Dépublier" : "Publier"}
              </button>
            </>
          )}
          {canDelete && (
            <button onClick={() => setConfirmDelete(p)}
              className="text-[11px] font-medium text-red-500 hover:underline cursor-pointer px-1">
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      ),
    },
  ]

  if (error) return <ErrorState message={error} onRetry={fetchPages} />

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-bold text-cm-text">Pages CMS</h1>
          <p className="text-[13px] text-cm-text-muted mt-0.5">{pages.length} pages</p>
        </div>
        {canCreate && (
          <button onClick={openCreate}
            className="h-9 px-4 bg-cm-text text-white text-[12px] font-medium rounded-lg hover:bg-cm-text/80 transition-colors flex items-center gap-1.5 cursor-pointer">
            <Plus className="w-3.5 h-3.5" /> Nouvelle page
          </button>
        )}
      </div>

      <AdminTable
        columns={columns}
        data={pages}
        keyExtractor={(p) => p.id}
        searchable
        searchKeys={["title", "slug"]}
        exportable
        loading={loading}
        emptyMessage="Aucune page trouvée"
      />

      <Modal isOpen={modalOpen} onClose={() => !saving && setModalOpen(false)} title={editId ? "Modifier la page" : "Nouvelle page"} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-cm-text-soft mb-1">Titre</label>
              <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full h-9 px-3 text-[13px] bg-cm-surface border border-cm-border rounded-lg outline-none text-cm-text focus:border-cm-border" />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-cm-text-soft mb-1">Slug</label>
              <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className="w-full h-9 px-3 text-[13px] bg-cm-surface border border-cm-border rounded-lg outline-none text-cm-text focus:border-cm-border" />
            </div>
          </div>
          <div>
            <label className="block text-[12px] font-medium text-cm-text-soft mb-1">Contenu</label>
            <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={8}
              className="w-full px-3 py-2 text-[13px] bg-cm-surface border border-cm-border rounded-lg outline-none text-cm-text focus:border-cm-border resize-y" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-cm-text-soft mb-1">Meta titre (SEO)</label>
              <input type="text" value={form.meta_title} onChange={(e) => setForm({ ...form, meta_title: e.target.value })}
                className="w-full h-9 px-3 text-[13px] bg-cm-surface border border-cm-border rounded-lg outline-none text-cm-text focus:border-cm-border" />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-cm-text-soft mb-1">Meta description</label>
              <input type="text" value={form.meta_description} onChange={(e) => setForm({ ...form, meta_description: e.target.value })}
                className="w-full h-9 px-3 text-[13px] bg-cm-surface border border-cm-border rounded-lg outline-none text-cm-text focus:border-cm-border" />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button onClick={() => setModalOpen(false)} disabled={saving}
              className="h-9 px-4 text-[12px] font-medium text-cm-text-soft bg-cm-elevated border border-cm-border rounded-lg hover:bg-cm-surface cursor-pointer disabled:opacity-50">Annuler</button>
            <button onClick={handleSave} disabled={saving || !form.slug || !form.title}
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
        title="Supprimer la page"
        message={`Êtes-vous sûr de vouloir supprimer "${confirmDelete?.title}" ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        variant="danger"
      />
    </div>
  )
}
