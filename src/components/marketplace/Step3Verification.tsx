import { useRef } from "react"
import { Upload, FileText, X, ShieldCheck } from "lucide-react"
import { useSellerRegistrationStore } from "../../stores/sellerRegistrationStore"

export default function Step3Verification() {
  const { draft, addLegalDoc, removeLegalDoc } = useSellerRegistrationStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader()
        reader.onload = (ev) => {
          if (ev.target?.result) {
            addLegalDoc({ name: file.name, file: ev.target.result as string })
          }
        }
        reader.readAsDataURL(file)
      })
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-[#243318]/10 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-5 h-5 text-[#243318]" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-cm-text">Vérification</h2>
          <p className="text-sm text-cm-text-muted mt-1">
            Nous vérifions votre identité pour garantir la confiance sur la plateforme
          </p>
        </div>
      </div>

      {draft.sellerType === "professional" && (
        <>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-xs text-amber-800 font-medium">
              Documents requis pour les professionnels :
            </p>
            <ul className="text-xs text-amber-700 mt-2 space-y-1">
              <li>• Registre de commerce (RCCM)</li>
              <li>• Pièce d'identité du responsable</li>
              <li>• Photos du magasin (optionnel)</li>
            </ul>
          </div>

          <div>
            <label className="text-xs font-semibold text-cm-text-muted uppercase tracking-wider mb-2 block">
              Documents légaux
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />

            {draft.legalDocs.map((doc, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-cm-surface border border-cm-border mb-2">
                <FileText className="w-5 h-5 text-cm-text-muted shrink-0" />
                <span className="text-xs text-cm-text flex-1 truncate">{doc.name}</span>
                <button onClick={() => removeLegalDoc(i)} className="cursor-pointer">
                  <X className="w-4 h-4 text-cm-text-muted hover:text-red-500" />
                </button>
              </div>
            ))}

            <button
              onClick={handleFileSelect}
              className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-cm-border-soft text-sm text-cm-text-muted font-medium cursor-pointer hover:border-cm-border-soft hover:text-cm-text-soft transition-colors"
            >
              <Upload className="w-4 h-4" />
              Ajouter un document
            </button>
          </div>
        </>
      )}

      {draft.sellerType === "individual" && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-xs text-green-800 font-medium">Vérification simplifiée</p>
          <p className="text-xs text-green-700 mt-1">
            En tant que particulier, votre téléphone et votre email suffisent pour commencer à vendre.
            Nous vous recommanderons de vérifier votre identité plus tard pour débloquer plus de fonctionnalités.
          </p>
        </div>
      )}

      <div className="bg-[#243318]/5 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-amber-400" />
          <span className="text-xs font-semibold text-cm-text">Statut de la demande</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
            Pending
          </span>
          <span className="text-xs text-cm-text-muted">→</span>
          <span className="text-[10px] text-cm-text-muted">Verification → Active</span>
        </div>
        <p className="text-[11px] text-cm-text-muted mt-2">
          Notre équipe examinera vos documents sous 24-48h ouvrées. Vous recevrez une notification dès que votre boutique sera active.
        </p>
      </div>
    </div>
  )
}
