import { useState, useRef } from "react"
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, XCircle, Clock, ChevronRight } from "lucide-react"
import { useImportSessions, useImportCatalog } from "../../hooks/supplier/useSupplierDocuments"

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
}

const STATUS_BADGE: Record<string, { color: string; icon: typeof Clock; label: string }> = {
  pending: { color: "text-amber-600 bg-amber-50", icon: Clock, label: "En attente" },
  processing: { color: "text-blue-600 bg-blue-50", icon: Clock, label: "En cours..." },
  completed: { color: "text-green-700 bg-green-50", icon: CheckCircle2, label: "Terminé" },
  failed: { color: "text-red-600 bg-red-50", icon: XCircle, label: "Échoué" },
}

export default function SupplierImportScreen() {
  const { data: sessions = [], isLoading } = useImportSessions()
  const importCatalog = useImportCatalog()
  const fileRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)

  function handleFile(file: File) {
    if (!file.name.match(/\.(csv|xlsx?)$/i)) return
    importCatalog.mutate(file)
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-[20px] font-bold text-gray-900">Import catalogue</h1>
        <p className="text-[12px] text-gray-500 mt-1">Importez vos produits depuis un fichier Excel ou CSV</p>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
        onClick={() => fileRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          dragging ? "border-cm-green bg-cm-green/5" : "border-gray-200 hover:border-gray-300 bg-white"
        }`}>
        <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
        <p className="text-[13px] text-gray-600 font-medium">Déposez votre fichier ici</p>
        <p className="text-[11px] text-gray-400 mt-1">ou cliquez pour parcourir</p>
        <p className="text-[10px] text-gray-300 mt-2">Formats acceptés : .xlsx, .csv</p>
        <input ref={fileRef} type="file" className="hidden" accept=".xlsx,.csv"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
      </div>

      <div className="flex items-center gap-2 px-1">
        <FileSpreadsheet className="w-4 h-4 text-cm-green" />
        <p className="text-[12px] text-gray-500">
          <a href="#" className="text-cm-green font-medium hover:underline">Télécharger le modèle Excel</a> pour formater vos données
        </p>
      </div>

      <div>
        <h2 className="text-[14px] font-bold text-gray-900 mb-3">Historique des imports</h2>

        {isLoading ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="w-6 h-6 border-2 border-cm-green border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <FileSpreadsheet className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-[13px] text-gray-500">Aucun import pour l'instant</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sessions.map((s) => {
              const badge = (STATUS_BADGE[s.status] || STATUS_BADGE.pending)!
              const BadgeIcon = badge.icon
              const isExpanded = expanded === s.id
              const hasErrors = s.failedRows > 0 && s.errors.length > 0
              return (
                <div key={s.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div onClick={() => setExpanded(isExpanded ? null : s.id)}
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors">
                    <FileSpreadsheet className="w-4 h-4 text-gray-400 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] text-gray-800 font-medium truncate">{s.fileName}</p>
                      <p className="text-[11px] text-gray-400">{formatDate(s.createdAt)}</p>
                    </div>
                    {s.status === "completed" && (
                      <div className="text-right shrink-0">
                        <p className="text-[12px] text-gray-700 font-medium">{s.importedRows}/{s.totalRows}</p>
                        {s.failedRows > 0 && <p className="text-[10px] text-red-500">{s.failedRows} erreur{s.failedRows > 1 ? "s" : ""}</p>}
                      </div>
                    )}
                    <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold shrink-0 ${badge.color}`}>
                      <BadgeIcon className="w-3 h-3" />{badge.label}
                    </span>
                    <ChevronRight className={`w-4 h-4 text-gray-300 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                  </div>

                  {isExpanded && (
                    <div className="border-t border-gray-100 px-4 py-3 space-y-2">
                      {s.importedRows > 0 && (
                        <div className="flex items-center gap-2 text-[12px]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                          <span>{s.importedRows} produit{s.importedRows > 1 ? "s" : ""} importé{s.importedRows > 1 ? "s" : ""}</span>
                        </div>
                      )}
                      {s.failedRows > 0 && (
                        <div className="flex items-center gap-2 text-[12px]">
                          <XCircle className="w-3.5 h-3.5 text-red-500" />
                          <span>{s.failedRows} ligne{s.failedRows > 1 ? "s" : ""} en erreur</span>
                        </div>
                      )}
                      {hasErrors && (
                        <div className="bg-red-50 rounded-lg p-3 space-y-1.5 mt-2">
                          {s.errors.map((err, i) => (
                            <div key={i} className="flex gap-2 text-[11px]">
                              <span className="text-red-500 font-semibold shrink-0">Ligne {err.row}</span>
                              <span className="text-red-700">{err.message}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {s.status === "processing" && (
                        <div className="flex items-center gap-2 text-[12px] text-blue-600">
                          <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                          Import en cours...
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {importCatalog.isPending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 text-center space-y-3">
            <div className="w-10 h-10 border-2 border-cm-green border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-[13px] text-gray-700 font-medium">Import du catalogue...</p>
            <p className="text-[11px] text-gray-400">Analyse du fichier en cours</p>
          </div>
        </div>
      )}
    </div>
  )
}
