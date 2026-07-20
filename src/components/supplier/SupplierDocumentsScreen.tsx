import { useState } from "react"
import { FileText, Upload, Search, FileSpreadsheet, FileImage, File, CheckCircle2, XCircle, Clock, AlertCircle, Eye, RotateCcw, ScanLine, ChevronRight, Download } from "lucide-react"
import { useSupplierDocuments, useUploadDocument, useProcessOcr } from "../../hooks/supplier/useSupplierDocuments"
import { DOCUMENT_CATEGORY_LABELS, DOCUMENT_STATUS_LABELS } from "../../types/supplier"
import type { SupplierDocument, DocumentCategory } from "../../types/supplier"

const CATEGORY_ICONS: Record<DocumentCategory, typeof FileText> = {
  legal: FileText,
  catalog: FileSpreadsheet,
  invoice: FileText,
  delivery_note: File,
  identification: FileImage,
  other: File,
}

const STATUS_ICONS = {
  pending: Clock,
  processing: RotateCcw,
  reviewed: Eye,
  approved: CheckCircle2,
  rejected: XCircle,
}

const STATUS_COLORS = {
  pending: "text-amber-600 bg-amber-50",
  processing: "text-blue-600 bg-blue-50",
  reviewed: "text-gray-600 bg-gray-100",
  approved: "text-green-700 bg-green-50",
  rejected: "text-red-600 bg-red-50",
}

const FILE_ICONS = { pdf: FileText, xlsx: FileSpreadsheet, csv: FileSpreadsheet, jpg: FileImage, png: FileImage, default: File }

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
}

export default function SupplierDocumentsScreen() {
  const { data: documents = [], isLoading } = useSupplierDocuments()
  const uploadDoc = useUploadDocument()
  const processOcr = useProcessOcr()

  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<DocumentCategory | "all">("all")
  const [selectedDoc, setSelectedDoc] = useState<SupplierDocument | null>(null)
  const [dragging, setDragging] = useState(false)

  const filtered = documents.filter((d) => {
    if (categoryFilter !== "all" && d.category !== categoryFilter) return false
    if (search && !d.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const categories: { key: DocumentCategory | "all"; label: string }[] = [
    { key: "all", label: "Tous" },
    { key: "legal", label: "Légaux" },
    { key: "catalog", label: "Catalogues" },
    { key: "invoice", label: "Factures" },
    { key: "delivery_note", label: "BL" },
    { key: "identification", label: "ID" },
  ]

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const ext = file.name.split(".").pop()?.toLowerCase() || ""
    const catMap: Record<string, DocumentCategory> = {
      pdf: "legal", xlsx: "catalog", csv: "catalog",
      jpg: "identification", png: "identification",
    }
    uploadDoc.mutate({ file, category: catMap[ext] || "other" })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-bold text-gray-900">Documents</h1>
          <p className="text-[12px] text-gray-500 mt-1">Documents légaux, catalogues, factures et bons</p>
        </div>
        <label className="flex items-center gap-1.5 px-3 py-2 bg-cm-green text-white rounded-lg text-[12px] font-semibold cursor-pointer hover:bg-cm-green/90 transition-colors">
          <Upload className="w-3.5 h-3.5" />
          Importer
          <input type="file" className="hidden" onChange={handleUpload} accept=".pdf,.xlsx,.csv,.jpg,.png" />
        </label>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher..."
            className="w-full pl-8 pr-3 py-2 text-[12px] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cm-green/20 focus:border-cm-green bg-white" />
        </div>
        <div className="flex gap-1">
          {categories.map((c) => (
            <button key={c.key} onClick={() => setCategoryFilter(c.key)}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                categoryFilter === c.key ? "bg-cm-green text-white" : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"
              }`}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-6 h-6 border-2 border-cm-green border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <FileText className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-[13px] text-gray-500">Aucun document trouvé</p>
          <p className="text-[11px] text-gray-400 mt-1">Importez un document pour commencer</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((doc) => {
            const DocIcon = CATEGORY_ICONS[doc.category] || File
            const StatusIcon = STATUS_ICONS[doc.status]
            const FileIcon = FILE_ICONS[doc.fileType as keyof typeof FILE_ICONS] || FILE_ICONS.default
            return (
              <div key={doc.id}
                className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-center gap-3 hover:border-gray-300 transition-colors cursor-pointer"
                onClick={() => setSelectedDoc(doc)}>
                <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                  <DocIcon className="w-4.5 h-4.5 text-gray-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-[13px] text-gray-800 font-medium truncate">{doc.name}</p>
                    <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold shrink-0 ${STATUS_COLORS[doc.status]}`}>
                      <StatusIcon className="w-3 h-3" />
                      {DOCUMENT_STATUS_LABELS[doc.status]}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-[11px] text-gray-400">{DOCUMENT_CATEGORY_LABELS[doc.category]}</span>
                    <span className="flex items-center gap-1 text-[11px] text-gray-400">
                      <FileIcon className="w-3 h-3" />
                      {doc.fileType.toUpperCase()} · {formatSize(doc.fileSize)}
                    </span>
                    <span className="text-[11px] text-gray-400">{formatDate(doc.uploadedAt)}</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </div>
            )
          })}
        </div>
      )}

      {uploadDoc.isPending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 text-center space-y-3">
            <div className="w-10 h-10 border-2 border-cm-green border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-[13px] text-gray-700 font-medium">Import en cours...</p>
          </div>
        </div>
      )}

      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={() => setSelectedDoc(null)}>
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
          <div className="relative bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
              <h2 className="text-[14px] font-bold text-gray-900 truncate">{selectedDoc.name}</h2>
              <button onClick={() => setSelectedDoc(null)} className="text-gray-400 hover:text-gray-600 text-[18px] cursor-pointer">✕</button>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-3">
                {(() => {
                  const StatusIcon = STATUS_ICONS[selectedDoc.status]
                  return (
                    <span className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold ${STATUS_COLORS[selectedDoc.status]}`}>
                      {StatusIcon && <StatusIcon className="w-3.5 h-3.5" />}
                      {DOCUMENT_STATUS_LABELS[selectedDoc.status]}
                    </span>
                  )
                })()}
                <span className="text-[11px] text-gray-400">{DOCUMENT_CATEGORY_LABELS[selectedDoc.category]}</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[12px]">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-400">Fichier</p>
                  <p className="text-gray-800 font-medium">{selectedDoc.fileName}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-400">Taille</p>
                  <p className="text-gray-800 font-medium">{formatSize(selectedDoc.fileSize)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-400">Type</p>
                  <p className="text-gray-800 font-medium">{selectedDoc.fileType.toUpperCase()}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-400">Importé le</p>
                  <p className="text-gray-800 font-medium">{formatDate(selectedDoc.uploadedAt)}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button className="flex items-center gap-1.5 px-3 py-2 text-[11px] font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer">
                  <Download className="w-3.5 h-3.5" /> Télécharger
                </button>
                {selectedDoc.status === "processing" && (
                  <button onClick={() => processOcr.mutate(selectedDoc.id)}
                    className="flex items-center gap-1.5 px-3 py-2 text-[11px] font-semibold text-white bg-cm-green rounded-lg hover:bg-cm-green/90 transition-colors cursor-pointer">
                    <ScanLine className="w-3.5 h-3.5" /> Analyser (OCR)
                  </button>
                )}
              </div>

              {selectedDoc.ocrText && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-[12px] font-semibold text-gray-700">Texte extrait (OCR)</h3>
                    {selectedDoc.ocrConfidence && (
                      <span className="text-[11px] text-gray-400">
                        Confiance: {Math.round(selectedDoc.ocrConfidence * 100)}%
                      </span>
                    )}
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-[12px] text-gray-600 font-mono whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                    {selectedDoc.ocrText}
                  </div>
                </div>
              )}

              {selectedDoc.extractedFields && Object.keys(selectedDoc.extractedFields).length > 0 && (
                <div>
                  <h3 className="text-[12px] font-semibold text-gray-700 mb-2">Champs extraits</h3>
                  <div className="bg-green-50 rounded-lg divide-y divide-green-100">
                    {Object.entries(selectedDoc.extractedFields).map(([key, value]) => (
                      <div key={key} className="flex justify-between px-3 py-2 text-[12px]">
                        <span className="text-gray-500">{key}</span>
                        <span className="text-gray-800 font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedDoc.status === "rejected" && selectedDoc.rejectionReason && (
                <div className="flex items-start gap-2 bg-red-50 rounded-lg p-3">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[12px] font-semibold text-red-700">Motif du rejet</p>
                    <p className="text-[12px] text-red-600 mt-0.5">{selectedDoc.rejectionReason}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
