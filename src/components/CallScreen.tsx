import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, X } from "lucide-react";
import type { CallSession, CallStatus } from "../types";

interface CallScreenProps {
  session: CallSession;
  onEnd: () => void;
  onAnswer?: () => void;
  onDecline?: () => void;
  onToggleMute?: (muted: boolean) => void;
  onToggleSpeaker?: (speaker: boolean) => void;
}

function formatDuration(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
}

function getCallStatusLabel(status: CallStatus): string {
  switch (status) {
    case "ringing": return "Sonnerie...";
    case "connecting": return "Connexion...";
    case "connected": return "En cours";
    case "ended": return "Terminé";
  }
}

export default function CallScreen({ session, onEnd, onAnswer, onDecline, onToggleMute, onToggleSpeaker }: CallScreenProps) {
  const [displayStatus, setDisplayStatus] = useState<CallStatus>(session.status);
  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(true);
  const [durationMs, setDurationMs] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  const isIncoming = session.isIncoming;
  const otherName = isIncoming ? session.callerName : session.calleeName;
  const otherAvatar = isIncoming ? session.callerAvatar : session.calleeAvatar;

  useEffect(() => {
    if (displayStatus === "connected") {
      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        setDurationMs(Date.now() - startTimeRef.current);
      }, 200);
    } else if (displayStatus === "ringing" && isIncoming) {
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [displayStatus, isIncoming]);

  useEffect(() => {
    setDisplayStatus(session.status);
  }, [session.status]);

  useEffect(() => {
    if (isIncoming && displayStatus === "ringing") {
      const t = setTimeout(() => {
        setDisplayStatus("connected");
      }, 3000);
      return () => clearTimeout(t);
    }
  }, [isIncoming, displayStatus]);

  const handleEnd = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    onEnd();
  };

  const handleMute = () => {
    const next = !muted;
    setMuted(next);
    onToggleMute?.(next);
  };

  const handleSpeaker = () => {
    const next = !speaker;
    setSpeaker(next);
    onToggleSpeaker?.(next);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-cm-bg">
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <div className="relative mb-8">
          <div className={`w-24 h-24 rounded-full overflow-hidden border-2 ${displayStatus === "connected" ? "border-cm-accent" : "border-cm-border"} shadow-cm-md`}>
            <img src={otherAvatar} alt={otherName} className="w-full h-full object-cover" />
          </div>
          {displayStatus === "ringing" && (
            <motion.div
              className="absolute -inset-2 rounded-full border-2 border-cm-accent/30"
              animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
          {displayStatus === "connected" && (
            <motion.div
              className="absolute -top-1 -right-1 w-4 h-4 bg-cm-accent rounded-full"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            />
          )}
        </div>

        <h2 className="text-[22px] font-display font-bold text-cm-text mb-1">{otherName}</h2>
        <p className="text-[13px] font-mono text-cm-text-soft mb-2">{getCallStatusLabel(displayStatus)}</p>

        {(displayStatus === "connected" || displayStatus === "ended") && (
          <p className="text-[32px] font-mono text-cm-text font-light tabular-nums tracking-wider">
            {formatDuration(durationMs)}
          </p>
        )}
      </div>

      <div className="px-8 pb-12 space-y-8">
        {displayStatus === "ringing" && !isIncoming && (
          <div className="flex justify-center">
            <div className="flex items-center gap-2 px-5 py-2 bg-cm-accent-soft rounded-full">
              <motion.div
                className="w-2 h-2 bg-cm-accent rounded-full"
                animate={{ opacity: [1, 0.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <span className="text-[12px] font-mono text-cm-text-soft">Appel en cours...</span>
            </div>
          </div>
        )}

        {displayStatus === "ringing" && isIncoming && (
          <div className="flex items-center justify-center gap-8">
            <button onClick={() => { onDecline?.(); handleEnd(); }}
              className="w-16 h-16 rounded-full bg-red-500 text-white flex items-center justify-center cursor-pointer active:scale-90 shadow-cm-md hover:bg-red-600 transition-colors">
              <X className="w-7 h-7" />
            </button>
            <button onClick={() => { onAnswer?.(); setDisplayStatus("connected"); }}
              className="w-16 h-16 rounded-full bg-cm-accent text-white flex items-center justify-center cursor-pointer active:scale-90 shadow-cm-md hover:bg-cm-accent-hover transition-colors">
              <Phone className="w-7 h-7" />
            </button>
          </div>
        )}

        {displayStatus === "connected" && (
          <div className="flex items-center justify-center gap-8">
            <button onClick={handleMute}
              className={`w-14 h-14 rounded-full flex items-center justify-center cursor-pointer active:scale-90 shadow-cm-sm transition-all ${muted ? "bg-cm-accent text-white" : "bg-cm-elevated text-cm-text border border-cm-border"}`}>
              {muted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            <button onClick={handleEnd}
              className="w-16 h-16 rounded-full bg-red-500 text-white flex items-center justify-center cursor-pointer active:scale-90 shadow-cm-md hover:bg-red-600 transition-colors">
              <PhoneOff className="w-7 h-7" />
            </button>
            <button onClick={handleSpeaker}
              className={`w-14 h-14 rounded-full flex items-center justify-center cursor-pointer active:scale-90 shadow-cm-sm transition-all ${speaker ? "bg-cm-accent text-white" : "bg-cm-elevated text-cm-text border border-cm-border"}`}>
              {speaker ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
          </div>
        )}

        {displayStatus === "ended" && (
          <div className="flex justify-center">
            <button onClick={handleEnd}
              className="px-8 py-3 bg-cm-elevated text-cm-text rounded-xl border border-cm-border font-display font-bold text-[14px] cursor-pointer active:scale-95 hover:bg-cm-accent-soft transition-colors">
              Fermer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
