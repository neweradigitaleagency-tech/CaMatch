import { motion, AnimatePresence } from "motion/react";
import { useEffect } from "react";
import { X } from "lucide-react";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxHeight?: string;
}

export default function BottomSheet({ open, onClose, title, children, maxHeight = "85dvh" }: BottomSheetProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div key="bottom-sheet-group">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-cm-overlay"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 w-full max-w-[448px] bg-cm-elevated rounded-t-[28px] flex flex-col shadow-2xl pb-[env(safe-area-inset-bottom,0px)]"
            style={{ maxHeight }}
          >
            {title && (
              <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-cm-border shrink-0">
                <h2 className="text-[16px] font-bold text-cm-text">{title}</h2>
                <button onClick={onClose}
                  className="p-1 cursor-pointer active:scale-[0.97] transition-transform touch-min">
                  <X className="w-5 h-5 text-cm-text" />
                </button>
              </div>
            )}
            <div className="flex-1 overflow-y-auto px-5 py-3">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}