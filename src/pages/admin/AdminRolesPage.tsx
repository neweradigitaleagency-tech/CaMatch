import { useState, useEffect, useCallback } from "react"
import { usePermissions } from "../../hooks/usePermissions"
import { getAdmins, getRoles, createRole, updateRole, deleteRole, assignRole, removeRole } from "../../services/admin/roles.service"
import Modal from "../../components/admin/ui/Modal"
import ConfirmDialog from "../../components/admin/ui/ConfirmDialog"
import StatusBadge from "../../components/admin/ui/StatusBadge"
import ErrorState from "../../components/admin/ui/ErrorState"
import AdminTable from "../../components/admin/ui/AdminTable"
import type { Column } from "../../components/admin/ui/AdminTable"
import { ALL_PERMISSIONS, PERMISSION_GROUPS } from "../../constants/admin/permissions"
import type { Permission } from "../../types/admin"
import type { AdminRow, RoleRow } from "../../services/admin/roles.service"
import { Shield, Plus, Save, ShieldCheck, UserCog, Trash2 } from "lucide-react"

type Tab = "admins" | "roles"

import { format } from "date-fns"
import { fr } from "date-fns/locale"

const ROLE_STYLES: Record<string, string> = {
  platform_super_admin: "text-red-700 bg-red-50 border-red-200",
  platform_admin: "text-purple-700 bg-purple-50 border-purple-200",
  moderator: "text-blue-700 bg-blue-50 border-blue-200",
  support: "text-green-700 bg-green-50 border-green-200",
  finance: "text-amber-700 bg-amber-50 border-amber-200",
}

const ROLE_LABELS: Record<string, string> = {
  platform_super_admin: "Super Admin",
  platform_admin: "Admin",
  moderator: "Modérateur",
  support: "Support",
  finance: "Finance",
}

interface RoleForm {
  name: string
  description: string
  permissions: Record<string, boolean>
}

const emptyRoleForm: RoleForm = { name: "", description: "", permissions: {} }

function getRoleStyle(name: string): string {
  return ROLE_STYLES[name] ?? "text-gray-600 bg-gray-50 border-gray-200"
}

function getRoleLabel(name: string): string {
  return ROLE_LABELS[name] ?? name
}

export default function AdminRolesPage() {
  const { hasPermission } = usePermissions()
  const canCreate = hasPermission("roles.update")
  const canUpdate = hasPermission("roles.update")

  const [tab, setTab] = useState<Tab>("admins")
  const [admins, setAdmins] = useState<AdminRow[]>([])
  const [roles, setRoles] = useState<RoleRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [roleModalOpen, setRoleModalOpen] = useState(false)
  const [editRoleId, setEditRoleId] = useState<string | null>(null)
  const [roleForm, setRoleForm] = useState<RoleForm>(emptyRoleForm)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<RoleRow | null>(null)
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [assignAdmin, setAssignAdmin] = useState<AdminRow | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [adminsData, rolesData] = await Promise.all([getAdmins(), getRoles()])
      setAdmins(adminsData)
      setRoles(rolesData)
    } catch {
      setError("Impossible de charger les données.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const openRoleCreate = () => {
    setEditRoleId(null)
    setRoleForm(emptyRoleForm)
    setRoleModalOpen(true)
  }

  const openRoleEdit = (role: RoleRow) => {
    setEditRoleId(role.id)
    setRoleForm({ name: role.name, description: role.description ?? "", permissions: { ...role.permissions } })
    setRoleModalOpen(true)
  }

  const handleRoleSave = async () => {
    if (!roleForm.name) return
    setSaving(true)
    let ok: boolean
    if (editRoleId) {
      ok = await updateRole(editRoleId, {
        name: roleForm.name,
        description: roleForm.description || undefined,
        permissions: roleForm.permissions,
      })
    } else {
      ok = await createRole({ name: roleForm.name, description: roleForm.description || undefined, permissions: roleForm.permissions })
    }
    setSaving(false)
    if (ok) {
      setRoleModalOpen(false)
      setEditRoleId(null)
      setRoleForm(emptyRoleForm)
      fetchData()
    }
  }

  const handleDeleteRole = async () => {
    if (!confirmDelete) return
    const ok = await deleteRole(confirmDelete.id)
    if (ok) {
      setConfirmDelete(null)
      fetchData()
    }
  }

  const togglePermission = (perm: string) => {
    setRoleForm((prev) => ({
      ...prev,
      permissions: { ...prev.permissions, [perm]: !prev.permissions[perm] },
    }))
  }

  const handleAssignRole = async (roleId: string) => {
    if (!assignAdmin) return
    const ok = await assignRole(assignAdmin.id, roleId)
    if (ok) {
      setAssignModalOpen(false)
      setAssignAdmin(null)
      fetchData()
    }
  }

  const handleRemoveRole = async (adminId: string, roleId: string) => {
    if (!canUpdate) return
    await removeRole(adminId, roleId)
    fetchData()
  }

  if (error) return <ErrorState message={error} onRetry={fetchData} />

  const adminColumns: Column<AdminRow>[] = [
    {
      key: "name", label: "Administrateur", sortable: true, width: "220px",
      render: (a) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[12px] font-semibold text-gray-600 shrink-0">
            {(a.firstname?.charAt(0) ?? "") + (a.lastname?.charAt(0) ?? "") || a.email.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-gray-900">{a.firstname} {a.lastname}</p>
            <p className="text-[11px] text-gray-400">{a.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "roles", label: "Rôles", width: "200px",
      render: (a) => (
        <div className="flex flex-wrap gap-1">
          {a.roles.length === 0 && <span className="text-[11px] text-gray-400">Aucun rôle</span>}
          {a.roles.map((r) => (
            <span key={r.id} className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full border ${getRoleStyle(r.name)}`}>
              {getRoleLabel(r.name)}
              {canUpdate && (
                <button onClick={() => handleRemoveRole(a.id, r.id)}
                  className="hover:text-red-500 cursor-pointer">&times;</button>
              )}
            </span>
          ))}
          {canUpdate && (
            <button onClick={() => { setAssignAdmin(a); setAssignModalOpen(true) }}
              className="text-[10px] px-1.5 py-0.5 rounded-full border border-dashed border-gray-300 text-gray-400 hover:text-gray-600 hover:border-gray-400 cursor-pointer">
              + Ajouter
            </button>
          )}
        </div>
      ),
    },
    {
      key: "status", label: "Statut", sortable: true, width: "100px",
      render: (a) => <StatusBadge status={a.status} label={a.status === "active" ? "Actif" : a.status === "inactive" ? "Inactif" : "Suspendu"} />,
    },
    {
      key: "last_login", label: "Dernière connexion", sortable: true, width: "140px",
      render: (a) => (
        <span className="text-[12px] text-gray-500">
          {a.last_login ? format(new Date(a.last_login), "d MMM HH:mm", { locale: fr }) : "—"}
        </span>
      ),
    },
  ]

  const roleColumns: Column<RoleRow>[] = [
    {
      key: "name", label: "Rôle", sortable: true, width: "180px",
      render: (r) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-gray-500" />
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-gray-900">{getRoleLabel(r.name)}</p>
            <p className="text-[11px] text-gray-400">{r.name}</p>
          </div>
        </div>
      ),
    },
    {
      key: "description", label: "Description",
      render: (r) => <span className="text-[12px] text-gray-500">{r.description ?? "—"}</span>,
    },
    {
      key: "is_system", label: "Système", width: "80px",
      render: (r) => <span className="text-[12px] text-gray-500">{r.is_system ? "Oui" : "Non"}</span>,
    },
    {
      key: "admin_count", label: "Admins", sortable: true, width: "80px",
      render: (r) => <span className="text-[12px] text-gray-700">{r.admin_count}</span>,
    },
    {
      key: "actions", label: "", width: "100px",
      render: (r) => (
        <div className="flex items-center gap-1">
          {canUpdate && !r.is_system && (
            <>
              <button onClick={() => openRoleEdit(r)}
                className="text-[11px] font-medium text-[var(--admin-accent)] hover:underline cursor-pointer px-1">Modifier</button>
              <button onClick={() => setConfirmDelete(r)}
                className="text-[11px] font-medium text-red-500 hover:underline cursor-pointer px-1">
                <Trash2 className="w-3 h-3" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-bold text-gray-900">Rôles & permissions</h1>
          <p className="text-[13px] text-gray-500 mt-0.5">
            {tab === "admins" ? `${admins.length} administrateurs` : `${roles.length} rôles`}
          </p>
        </div>
        {tab === "roles" && canCreate && (
          <button onClick={openRoleCreate}
            className="h-9 px-4 bg-gray-900 text-white text-[12px] font-medium rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-1.5 cursor-pointer">
            <Plus className="w-3.5 h-3.5" /> Nouveau rôle
          </button>
        )}
      </div>

      <div className="flex gap-1 border-b border-gray-200">
        <button onClick={() => setTab("admins")}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-[12px] font-medium border-b-2 transition-colors cursor-pointer ${tab === "admins" ? "border-gray-900 text-gray-900" : "border-transparent text-gray-400 hover:text-gray-600"}`}>
          <UserCog className="w-3.5 h-3.5" /> Administrateurs
        </button>
        <button onClick={() => setTab("roles")}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-[12px] font-medium border-b-2 transition-colors cursor-pointer ${tab === "roles" ? "border-gray-900 text-gray-900" : "border-transparent text-gray-400 hover:text-gray-600"}`}>
          <Shield className="w-3.5 h-3.5" /> Rôles
        </button>
      </div>

      {tab === "admins" ? (
        <AdminTable
          columns={adminColumns}
          data={admins}
          keyExtractor={(a) => a.id}
          searchable
          searchKeys={["firstname", "lastname", "email"]}
          exportable
          loading={loading}
          emptyMessage="Aucun administrateur trouvé"
        />
      ) : (
        <AdminTable
          columns={roleColumns}
          data={roles}
          keyExtractor={(r) => r.id}
          searchable
          searchKeys={["name", "description"]}
          exportable
          loading={loading}
          emptyMessage="Aucun rôle trouvé"
        />
      )}

      <Modal isOpen={roleModalOpen} onClose={() => !saving && setRoleModalOpen(false)}
        title={editRoleId ? "Modifier le rôle" : "Nouveau rôle"} size="xl">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-gray-700 mb-1">Nom</label>
              <input type="text" value={roleForm.name} onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                className="w-full h-9 px-3 text-[13px] bg-gray-50 border border-gray-200 rounded-lg outline-none text-gray-900 focus:border-gray-300" />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-gray-700 mb-1">Description</label>
              <input type="text" value={roleForm.description} onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                className="w-full h-9 px-3 text-[13px] bg-gray-50 border border-gray-200 rounded-lg outline-none text-gray-900 focus:border-gray-300" />
            </div>
          </div>
          <div>
            <p className="text-[12px] font-medium text-gray-700 mb-2">Permissions</p>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {Object.entries(PERMISSION_GROUPS).map(([key, group]) => (
                <div key={key}>
                  <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{group.label}</p>
                  <div className="flex flex-wrap gap-2">
                    {group.permissions.map((perm) => (
                      <label key={perm} className="flex items-center gap-1.5 cursor-pointer">
                        <input type="checkbox" checked={!!roleForm.permissions[perm]}
                          onChange={() => togglePermission(perm)}
                          className="w-3.5 h-3.5 rounded border-gray-300 text-gray-900 accent-gray-900 cursor-pointer" />
                        <span className="text-[11px] text-gray-600">{perm}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button onClick={() => setRoleModalOpen(false)} disabled={saving}
              className="h-9 px-4 text-[12px] font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer disabled:opacity-50">Annuler</button>
            <button onClick={handleRoleSave} disabled={saving || !roleForm.name}
              className="h-9 px-4 bg-gray-900 text-white text-[12px] font-medium rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50">
              <Save className="w-3.5 h-3.5" /> {saving ? "Enregistrement…" : editRoleId ? "Enregistrer" : "Créer"}
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={assignModalOpen} onClose={() => setAssignModalOpen(false)}
        title={`Ajouter un rôle — ${assignAdmin?.firstname ?? ""} ${assignAdmin?.lastname ?? ""}`} size="sm">
        <div className="space-y-2">
          {roles
            .filter((r) => !assignAdmin?.roles.some((ar) => ar.id === r.id))
            .map((r) => (
              <button key={r.id} onClick={() => handleAssignRole(r.id)}
                className="w-full text-left px-4 py-2.5 text-[13px] font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 cursor-pointer">
                {getRoleLabel(r.name)}
                <span className="text-[11px] text-gray-400 ml-2">{r.description}</span>
              </button>
            ))}
          {roles.filter((r) => !assignAdmin?.roles.some((ar) => ar.id === r.id)).length === 0 && (
            <p className="text-[13px] text-gray-400 text-center py-4">Tous les rôles sont déjà attribués</p>
          )}
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!confirmDelete}
        onCancel={() => setConfirmDelete(null)}
        onConfirm={handleDeleteRole}
        title="Supprimer le rôle"
        message={`Êtes-vous sûr de vouloir supprimer le rôle "${confirmDelete?.name}" ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        variant="danger"
      />
    </div>
  )
}
