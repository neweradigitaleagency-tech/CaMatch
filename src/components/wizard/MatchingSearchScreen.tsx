import { useEffect, useState, useRef } from "react";
import { motion } from "motion/react";
import { Search, Clock, Users } from "lucide-react";

interface MatchingSearchScreenProps {
  onProposalsReceived: () => void;
}

export default function MatchingSearchScreen({ onProposalsReceived }: MatchingSearchScreenProps) {
  const [elapsed, setElapsed] = useState(0);
  const [dots, setDots] = useState("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const start = Date.now();
    intervalRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000));
    }, 1000);

    const dotInterval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "" : d + "."));
    }, 500);

    const timeout = setTimeout(() => {
      onProposalsReceived();
    }, 4000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      clearInterval(dotInterval);
      clearTimeout(timeout);
    };
  }, [onProposalsReceived]);

  const formatTime = (s: number) => {
    if (s < 60) return `${s}s`;
    return `${Math.floor(s / 60)}m ${s % 60}s`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-dynamic bg-cm-bg px-8 pb-20">
      <div className="relative w-48 h-48 mb-8">
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-cm-text/10"
          animate={{ scale: [1, 1.8, 1], opacity: [0.4, 0, 0.4] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut" }}
        />
        <motion.div
          className="absolute inset-4 rounded-full border-2 border-cm-text/15"
          animate={{ scale: [1, 1.6, 1], opacity: [0.3, 0, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut", delay: 0.3 }}
        />
        <motion.div
          className="absolute inset-8 rounded-full border-2 border-cm-text/20"
          animate={{ scale: [1, 1.4, 1], opacity: [0.2, 0, 0.2] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut", delay: 0.6 }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="w-20 h-20 rounded-full bg-cm-text flex items-center justify-center"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <Search className="w-8 h-8 text-white" />
          </motion.div>
        </div>
      </div>

      <h2 className="text-[20px] font-bold text-cm-text text-center mb-2">
        Recherche des meilleurs professionnels{dots}
      </h2>
      <p className="text-[13px] text-cm-text-muted text-center mb-6">
        Nous trouvons les pros disponibles près de chez vous
      </p>

      <div className="flex items-center gap-5 text-[11px] text-cm-text-muted">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          {formatTime(elapsed)}
        </div>
        <div className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5" />
          Analyse en cours...
        </div>
      </div>

      <div className="mt-8 w-full max-w-xs">
        <div className="h-1 rounded-full bg-cm-border-soft overflow-hidden">
          <motion.div
            className="h-full bg-cm-text rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 4, ease: "easeInOut" }}
          />
        </div>
      </div>
    </div>
  );
}
