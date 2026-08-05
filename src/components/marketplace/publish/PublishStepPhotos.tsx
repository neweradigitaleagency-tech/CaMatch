import { useRef, useState } from "react"
import { motion } from "motion/react"
import { ImagePlus, X, Link as LinkIcon, Sparkles } from "lucide-react"
import { usePublishListingStore } from "../../../stores/publishListingStore"

const SUGGESTIONS = [
  "https://images.unsplash.com/photo-1518709766631-a6b04f8b5a7a?w=400",
  "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=400",
  "https://images.unsplash.com/photo-1611200945002-403b0b46e7c5?w=400",
  "https://images.unsplash.com/photo-1562259929-b4e1fd3aef09?w=400",
  "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400",
  "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400",
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
]

export default function PublishStepPhotos() {
  const { draft, addImage, removeImage } = usePublishListingStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [url, setUrl] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader()
        reader.onload = (ev) => {
          if (ev.target?.result) addImage(ev.target.result as string)
        }
        reader.readAsDataURL(file)
      })
    }
    e.target.value = ""
  }

  const handleAddUrl = () => {
    if (url.trim()) {
      addImage(url)
      setUrl("")
    }
  }

  const remaining = 8 - draft.images.length

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-bold text-cm-text">Photos de votre produit</h2>
        <p className="text-sm text-cm-text-muted mt-1">
          Jusqu'à 8 photos. Les annonces avec 3 photos ou plus se vendent mieux.
        </p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {draft.images.map((img, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-24 h-24 rounded-xl overflow-hidden border border-cm-border-soft"
          >
            <img src={img} alt="" className="w-full h-full object-cover" />
            <button
              onClick={() => removeImage(i)}
              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/50 flex items-center justify-center cursor-pointer"
              aria-label="Retirer la photo"
            >
              <X className="w-3 h-3 text-white" />
            </button>
          </motion.div>
        ))}

        {draft.images[0] && (
          <div className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-cm-accent">
            <img src={draft.images[0]} alt="" className="w-full h-full object-cover" />
            <span className="absolute bottom-0 inset-x-0 bg-cm-forest/85 text-white text-[8px] font-bold py-0.5 text-center">
              Couverture
            </span>
          </div>
        )}

        {remaining > 0 && (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-24 h-24 rounded-xl border-2 border-dashed border-cm-border-soft flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-cm-text transition-colors bg-cm-elevated"
          >
            <ImagePlus className="w-5 h-5 text-cm-text-muted" />
            <span className="text-[9px] text-cm-text-muted font-medium">Ajouter</span>
          </button>
        )}
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cm-text-muted" />
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleAddUrl()
                }
              }}
              className="w-full h-11 pl-9 pr-3 rounded-xl bg-cm-elevated border border-cm-border-soft text-sm text-cm-text outline-none focus:border-cm-text transition-colors placeholder:text-cm-border-soft"
              placeholder="Coller une URL d'image..."
            />
          </div>
          <button
            onClick={handleAddUrl}
            disabled={!url.trim()}
            className="h-11 px-4 rounded-xl bg-cm-text text-white text-sm font-bold cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all"
          >
            Ajouter
          </button>
        </div>

        <button
          onClick={() => setShowSuggestions((v) => !v)}
          className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-cm-forest cursor-pointer hover:underline self-start"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Utiliser une photo d'exemple
        </button>

        {showSuggestions && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="overflow-hidden">
            <div className="grid grid-cols-4 gap-2 pt-1">
              {SUGGESTIONS.filter((s) => !draft.images.includes(s)).slice(0, remaining).map((s) => (
                <button
                  key={s}
                  onClick={() => addImage(s)}
                  className="aspect-square rounded-lg overflow-hidden border border-cm-border-soft cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <img src={s} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
