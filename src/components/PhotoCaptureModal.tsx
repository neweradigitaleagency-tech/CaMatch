import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Camera, Image, Check, RotateCcw } from "lucide-react";

export default function PhotoCaptureModal({
  open,
  onClose,
  onCapture,
  title = "Ajouter une photo",
}: {
  open: boolean;
  onClose: () => void;
  onCapture: (dataUrl: string) => void;
  title?: string;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleCamera = () => {
    if (navigator.mediaDevices) {
      cameraRef.current?.click();
    }
  };

  const handleGallery = () => {
    galleryRef.current?.click();
  };

  const handleValidate = () => {
    if (preview) {
      onCapture(preview);
      setPreview(null);
    }
  };

  const handleRetake = () => {
    setPreview(null);
  };

  const handleClose = () => {
    setPreview(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/40"
          onClick={handleClose}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[24px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mt-3 mb-2" />

            <div className="px-5 pb-8">
              <h3 className="text-[16px] font-bold text-gray-900 text-center mb-1">{title}</h3>
              <p className="text-[11px] text-gray-500 text-center mb-5">La photo servira de preuve pour la mission</p>

              {preview ? (
                <div className="space-y-4">
                  <div className="w-full aspect-video rounded-[16px] overflow-hidden bg-gray-100">
                    <img src={preview} alt="Aperçu" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex gap-3">
                    <button onClick={handleRetake}
                      className="flex-1 h-12 rounded-[14px] border-2 border-gray-200 text-gray-700 text-[13px] font-bold cursor-pointer active:scale-[0.97] transition-transform flex items-center justify-center gap-2">
                      <RotateCcw className="w-4 h-4" /> Reprendre
                    </button>
                    <button onClick={handleValidate}
                      className="flex-1 h-12 rounded-[14px] bg-gray-900 text-white text-[13px] font-bold cursor-pointer active:scale-[0.97] transition-transform hover:bg-gray-800 flex items-center justify-center gap-2 shadow-md">
                      <Check className="w-4 h-4" /> Valider la photo
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <button onClick={handleCamera}
                    className="w-full h-14 rounded-[14px] bg-gray-50 border-2 border-dashed border-gray-200 text-gray-800 text-[14px] font-bold cursor-pointer active:scale-[0.98] transition-transform hover:bg-gray-100 flex items-center justify-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gray-900 flex items-center justify-center">
                      <Camera className="w-4 h-4 text-white" />
                    </div>
                    Prendre une photo
                  </button>

                  <button onClick={handleGallery}
                    className="w-full h-14 rounded-[14px] bg-gray-50 border-2 border-dashed border-gray-200 text-gray-800 text-[14px] font-bold cursor-pointer active:scale-[0.98] transition-transform hover:bg-gray-100 flex items-center justify-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gray-900 flex items-center justify-center">
                      <Image className="w-4 h-4 text-white" />
                    </div>
                    Choisir depuis la galerie
                  </button>

                  <button onClick={handleClose}
                    className="w-full h-11 text-[13px] text-gray-500 font-medium cursor-pointer hover:text-gray-700 transition-colors">
                    Annuler
                  </button>
                </div>
              )}
            </div>
          </motion.div>

          <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
          <input ref={galleryRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
