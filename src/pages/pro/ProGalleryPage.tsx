import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, Plus, Trash2, Loader2, ImageIcon } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useAuthStore } from "../../stores/authStore";
import { fetchGalleryImages, uploadGalleryImage, deleteGalleryImage } from "../../services/galleryService";
import type { GalleryItem, GalleryCategory } from "../../types";

const CATEGORIES: { key: string; label: string }[] = [
  { key: "Tout", label: "Tout" },
  { key: "realisation", label: "Réalisations" },
  { key: "before_after", label: "Avant/Après" },
  { key: "certificate", label: "Certificats" },
  { key: "equipment", label: "Équipement" },
];

export default function ProGalleryPage() {
  const nav = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [filter, setFilter] = useState("Tout");
  const [images, setImages] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<GalleryCategory>("realisation");
  const [showUploadSheet, setShowUploadSheet] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const captionInputRef = useRef<HTMLInputElement>(null);

  const proId = user?.id || "pro1";

  useEffect(() => {
    fetchGalleryImages(proId)
      .then(setImages)
      .finally(() => setLoading(false));
  }, [proId]);

  const filtered = filter === "Tout"
    ? images
    : images.filter((img) => img.category === filter);

  const handleFilePick = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const item = await uploadGalleryImage(
        proId,
        file,
        selectedCategory,
        captionInputRef.current?.value
      );
      setImages((prev) => [item, ...prev]);
      setShowUploadSheet(false);
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (item: GalleryItem) => {
    try {
      await deleteGalleryImage(item.url);
      setImages((prev) => prev.filter((i) => i.id !== item.id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div className="min-h-dynamic bg-[#F5F5F0]">
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-lg border-b border-gray-200">
        <div className="flex items-center justify-between h-14 px-4 max-w-[448px] mx-auto">
          <div className="flex items-center gap-3">
            <button onClick={() => nav(-1)}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer active:scale-95">
              <ArrowLeft className="w-5 h-5 text-gray-900" />
            </button>
            <h1 className="text-[16px] font-bold text-gray-900">Galerie</h1>
          </div>
          <button onClick={() => setShowUploadSheet(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white text-[11px] font-bold rounded-full cursor-pointer active:scale-95 hover:bg-gray-800 transition-colors">
            <Plus className="w-3.5 h-3.5" />
            <span>Ajouter</span>
          </button>
        </div>
      </header>

      <div className="w-full max-w-[448px] mx-auto px-4 pt-3 pb-24">
        {/* Catégories */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button key={cat.key} onClick={() => setFilter(cat.key)}
              className={`shrink-0 px-3.5 py-1.5 text-[11px] font-bold rounded-full cursor-pointer active:scale-95 transition-colors ${
                filter === cat.key
                  ? "bg-gray-900 text-white shadow-sm"
                  : "bg-white border border-gray-200 text-gray-500 hover:border-gray-300"
              }`}>
              {cat.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <ImageIcon className="w-7 h-7 text-gray-400" />
            </div>
            <p className="text-[14px] font-bold text-gray-900 mb-1">Aucune photo</p>
            <p className="text-[12px] text-gray-500 mb-3">Ajoutez vos réalisations pour convaincre vos clients.</p>
            <button onClick={() => setShowUploadSheet(true)}
              className="px-4 py-2 bg-gray-900 text-white text-[11px] font-bold rounded-full cursor-pointer active:scale-95">
              <Plus className="w-3.5 h-3.5 inline mr-1" /> Ajouter une photo
            </button>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-2 gap-3">
            {filtered.map((item, i) => (
              <motion.div key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                className="group relative bg-white border border-gray-200 rounded-[14px] overflow-hidden shadow-sm">
                <div className="aspect-square overflow-hidden">
                  <img src={item.url} alt={item.caption}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="p-2.5">
                  <p className="text-[11px] font-medium text-gray-900 line-clamp-2">{item.caption}</p>
                  <p className="text-[9px] text-gray-400 mt-0.5">{item.category === "realisation" ? "Réalisation" : item.category === "before_after" ? "Avant/Après" : item.category === "certificate" ? "Certificat" : "Équipement"}</p>
                </div>
                <button onClick={(e) => { e.stopPropagation(); handleDelete(item); }}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer active:scale-90 hover:bg-red-500/70">
                  <Trash2 className="w-3.5 h-3.5 text-white" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Upload bottom sheet */}
      {showUploadSheet && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={() => !uploading && setShowUploadSheet(false)}>
          <div className="w-full max-w-md bg-white rounded-t-[20px] p-5 pb-8" onClick={(e) => e.stopPropagation()}>
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
            <h2 className="text-[16px] font-bold text-gray-900 mb-3">Ajouter une photo</h2>

            <div className="mb-3">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Catégorie</p>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.filter((c) => c.key !== "Tout").map((cat) => (
                  <button key={cat.key} onClick={() => setSelectedCategory(cat.key as GalleryCategory)}
                    className={`px-3 py-1.5 rounded-[10px] text-[11px] font-bold border cursor-pointer active:scale-95 transition-all ${
                      selectedCategory === cat.key
                        ? "bg-gray-900 text-white border-gray-900"
                        : "bg-white text-gray-500 border-gray-200"
                    }`}>
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Légende</p>
              <input ref={captionInputRef} type="text" placeholder="Description (optionnelle)"
                className="w-full h-11 text-[13px] bg-white rounded-[12px] px-3 border border-gray-200 outline-none focus:ring-1 focus:ring-gray-300" />
            </div>

            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFilePick} />

            {uploading ? (
              <div className="flex items-center justify-center h-11 bg-gray-100 rounded-[12px] text-[12px] font-bold text-gray-500 gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Upload en cours...
              </div>
            ) : (
              <button onClick={() => fileInputRef.current?.click()}
                className="w-full h-11 bg-gray-900 text-white text-[12px] font-bold rounded-[12px] cursor-pointer active:scale-[0.98] transition-transform hover:bg-gray-800 flex items-center justify-center gap-2 shadow-sm">
                <Plus className="w-4 h-4" /> Choisir une photo
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
