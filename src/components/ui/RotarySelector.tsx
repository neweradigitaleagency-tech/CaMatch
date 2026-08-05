import { useRef, useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

export interface RotaryOption {
  key: string;
  label: string;
  icon?: string;
  sublabel?: string;
}

interface RotarySelectorProps {
  options: RotaryOption[];
  onSelect: (option: RotaryOption) => void;
  ctaLabel?: string;
  hint?: string;
}

const ITEM = 62;
const HALF = ITEM / 2;
const RX = 120;
const RY = 104;
const STEP_PX = 56;
const VISIBLE = 2.2;

function clampIndex(v: number, n: number) {
  return ((v % n) + n) % n;
}

export default function RotarySelector({ options, onSelect, ctaLabel = "Choisir", hint }: RotarySelectorProps) {
  const [selected, setSelected] = useState(0);
  const [dragX, setDragX] = useState(0);
  const dragRef = useRef<{ startX: number; startSel: number; pid: number } | null>(null);
  const didDrag = useRef(false);
  const handlersRef = useRef<{ move: (e: PointerEvent) => void; up: (e: PointerEvent) => void } | null>(null);

  const count = options.length;
  const step = Math.min((Math.PI * 2) / count, 0.72);
  const liveOffset = dragRef.current ? dragX / STEP_PX : 0;
  const effSelected = clampIndex(selected + liveOffset, count);
  const frontIndex = Math.round(effSelected) % count;

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    didDrag.current = false;
    dragRef.current = { startX: e.clientX, startSel: selected, pid: e.pointerId };

    const move = (ev: PointerEvent) => {
      const d = dragRef.current;
      if (!d || ev.pointerId !== d.pid) return;
      const dx = ev.clientX - d.startX;
      if (Math.abs(dx) > 6) didDrag.current = true;
      setDragX(dx);
    };

    const up = (ev: PointerEvent) => {
      const d = dragRef.current;
      if (!d || ev.pointerId !== d.pid) return;
      if (didDrag.current) {
        const steps = Math.round(-(ev.clientX - d.startX) / STEP_PX);
        setSelected(clampIndex(d.startSel + steps, count));
      }
      dragRef.current = null;
      setDragX(0);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      handlersRef.current = null;
    };

    handlersRef.current = { move, up };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  };

  const handleItemClick = (opt: RotaryOption, i: number) => {
    if (didDrag.current) return;
    if (i === frontIndex) onSelect(opt);
    else setSelected(i);
  };

  if (count === 0) {
    return <p className="text-center text-[12px] text-cm-text-muted py-8">Aucune option disponible</p>;
  }

  const front = options[frontIndex]!;

  return (
    <div>
      <div
        className="relative w-full overflow-hidden select-none"
        style={{ height: 320, touchAction: "pan-y" }}
        onPointerDown={handlePointerDown}
      >
        {options.map((opt, i) => {
          const theta = (i - effSelected) * step;
          if (Math.abs(theta) > VISIBLE) return null;
          const cos = Math.cos(theta);
          const scale = 0.5 + 0.5 * ((cos + 1) / 2);
          const opacity = 0.3 + 0.7 * ((cos + 1) / 2);
          const isFront = i === frontIndex;
          const x = Math.sin(theta) * RX;
          const y = Math.cos(theta) * RY;
          return (
            <motion.button
              key={opt.key}
              type="button"
              onClick={() => handleItemClick(opt, i)}
              aria-label={opt.label}
              animate={{ x, y, scale, opacity, zIndex: 10 + Math.round(cos * 20) }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
              className="absolute left-1/2 top-[46%] will-change-transform cursor-pointer"
              style={{ marginLeft: -HALF, marginTop: -HALF }}
            >
              <span
                className={`flex items-center justify-center rounded-full bg-cm-elevated border shadow-cm-card transition-shadow ${
                  isFront ? "ring-2 ring-cm-accent" : "border-cm-border-soft"
                }`}
                style={{ width: ITEM, height: ITEM }}
              >
                <span className="text-[24px] leading-none">{opt.icon}</span>
              </span>
              {isFront && (
                <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 text-[11px] font-bold text-cm-text whitespace-nowrap">
                  {opt.label}
                </span>
              )}
              {isFront && opt.sublabel && (
                <span className="absolute top-full left-1/2 -translate-x-1/2 mt-[26px] text-[10px] font-semibold text-cm-accent whitespace-nowrap">
                  {opt.sublabel}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-3 mt-1">
        <button
          type="button"
          onClick={() => setSelected(clampIndex(selected - 1, count))}
          aria-label="Option précédente"
          className="w-11 h-11 shrink-0 rounded-full bg-cm-elevated border border-cm-border flex items-center justify-center cursor-pointer active:scale-90 transition-transform"
        >
          <ChevronLeft className="w-5 h-5 text-cm-text" />
        </button>

        <button
          type="button"
          onClick={() => onSelect(front)}
          className="h-12 px-4 sm:px-5 min-w-0 rounded-full bg-cm-text text-white text-[13px] font-bold flex items-center gap-2 cursor-pointer active:scale-95 transition-transform touch-min"
        >
          <span className="truncate">{ctaLabel}</span>
          <span className="text-white/90 shrink-0">{front.icon}</span>
          <span className="truncate hidden sm:inline">{front.label}</span>
          <ArrowRight className="w-4 h-4 shrink-0" />
        </button>

        <button
          type="button"
          onClick={() => setSelected(clampIndex(selected + 1, count))}
          aria-label="Option suivante"
          className="w-11 h-11 shrink-0 rounded-full bg-cm-elevated border border-cm-border flex items-center justify-center cursor-pointer active:scale-90 transition-transform"
        >
          <ChevronRight className="w-5 h-5 text-cm-text" />
        </button>
      </div>

      {hint && (
        <p className="text-center text-[10px] text-cm-text-muted mt-2">{hint}</p>
      )}
    </div>
  );
}
