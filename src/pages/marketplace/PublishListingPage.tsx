import { useEffect, useState } from "react"
import { CheckCircle, FileText, X } from "lucide-react"
import { useAppNavigation } from "../../navigation/useAppNavigation"
import { usePublishListingStore, DEFAULT_PUBLISH_DRAFT } from "../../stores/publishListingStore"
import PublishListingWizard from "../../components/marketplace/publish/PublishListingWizard"

function hasDraftContent() {
  const stored = localStorage.getItem("marketplace-publish-listing")
  if (!stored) return false
  try {
    const parsed = JSON.parse(stored)
    const draft = parsed?.state?.draft
    if (!draft) return false
    return draft.step !== DEFAULT_PUBLISH_DRAFT.step
  } catch {
    return false
  }
}

export default function PublishListingPage() {
  const { goBack, complete } = useAppNavigation()
  const { publish, resetDraft } = usePublishListingStore()
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [resumeBanner, setResumeBanner] = useState(false)

  useEffect(() => {
    setResumeBanner(hasDraftContent())
  }, [])

  const handleSubmit = () => {
    if (loading) return
    setLoading(true)
    window.setTimeout(() => {
      publish()
      setLoading(false)
      setSubmitted(true)
    }, 700)
  }

  if (submitted) {
    return (
      <div className="min-h-dynamic bg-cm-bg flex items-center justify-center p-6">
        <div className="bg-cm-elevated rounded-2xl border border-cm-border p-8 max-w-md w-full text-center">
          <div className="w-14 h-14 rounded-full bg-cm-accent/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-7 h-7 text-cm-forest" />
          </div>
          <h2 className="text-[18px] font-bold text-cm-text mb-2">Annonce publiée !</h2>
          <p className="text-[13px] text-cm-text-soft mb-6">
            Votre annonce est en ligne. Les acheteurs du marché peuvent désormais la voir.
          </p>
          <button
            onClick={() => complete({ to: "/marketplace/profile" })}
            className="h-10 px-6 bg-cm-text text-cm-elevated text-[12px] font-bold rounded-xl cursor-pointer transition-all hover:opacity-90"
          >
            Voir mon espace vendeur
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      {resumeBanner && (
        <div className="fixed top-2 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-24px)] max-w-md">
          <div className="flex items-center gap-3 px-4 py-3 bg-cm-forest text-white rounded-xl shadow-lg">
            <FileText className="w-4 h-4 text-cm-accent shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-bold">Brouillon enregistré</p>
              <p className="text-[10px] text-white/70">Vous n'aviez pas terminé votre annonce.</p>
            </div>
            <button
              onClick={() => {
                resetDraft()
                setResumeBanner(false)
              }}
              className="text-[10px] font-bold text-cm-accent underline cursor-pointer whitespace-nowrap"
            >
              Recommencer
            </button>
            <button
              onClick={() => setResumeBanner(false)}
              className="w-6 h-6 flex items-center justify-center rounded-full bg-white/10 cursor-pointer shrink-0"
              aria-label="Fermer"
            >
              <X className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
        </div>
      )}
      <PublishListingWizard onBack={() => goBack()} onSubmit={handleSubmit} loading={loading} />
    </div>
  )
}
