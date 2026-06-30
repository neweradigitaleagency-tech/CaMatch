import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface ImageViewerProps {
  images: { url: string; title?: string }[];
  initialIndex?: number;
  open: boolean;
  onClose: () => void;
}

export default function ImageViewer({ images, initialIndex = 0, open, onClose }: ImageViewerProps) {
  const [idx, setIdx] = useState(initialIndex);

  if (!open || images.length === 0) return null;

  const current = images[idx]!;

  const prev = () => setIdx(i => Math.max(0, i - 1));
  const next = () => setIdx(i => Math.min(images.length - 1, i + 1));

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center"
        >
          <button onClick={onClose} className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white z-10 cursor-pointer hover:bg-white/20 active:scale-90 transition-all">
            <X className="w-5 h-5" />
          </button>

          {images.length > 1 && (
            <>
              <button onClick={prev} disabled={idx === 0}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white disabled:opacity-30 cursor-pointer hover:bg-white/20 active:scale-90 transition-all">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={next} disabled={idx === images.length - 1}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white disabled:opacity-30 cursor-pointer hover:bg-white/20 active:scale-90 transition-all">
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          <div className="flex flex-col items-center max-w-3xl w-full px-4">
            <motion.img
              key={idx}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              src={current.url}
              alt={current.title || ""}
              className="w-full max-h-[80vh] object-contain rounded-2xl shadow-premium"
              draggable={false}
            />
            {current.title && (
              <p className="text-sm text-white/80 mt-3 font-bold">{current.title}</p>
            )}
            {images.length > 1 && (
              <p className="text-caption text-white/50 mt-2 font-medium">{idx + 1} / {images.length}</p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
