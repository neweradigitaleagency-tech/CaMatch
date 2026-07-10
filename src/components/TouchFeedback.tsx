import { useRef } from "react";

interface TouchFeedbackProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export default function TouchFeedback({ children, onClick, className = "", disabled }: TouchFeedbackProps) {
  const ref = useRef<HTMLDivElement>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (disabled) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const ripple = document.createElement("span");
    ripple.className = "absolute rounded-full bg-white/30 pointer-events-none animate-ripple";
    const size = Math.max(rect.width, rect.height) * 2;
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x - size / 2}px`;
    ripple.style.top = `${y - size / 2}px`;
    ripple.style.transform = "scale(0)";
    el.appendChild(ripple);
    ripple.addEventListener("animationend", () => ripple.remove());
  };

  return (
    <div
      ref={ref}
      onClick={disabled ? undefined : onClick}
      className={`relative overflow-hidden cursor-pointer select-none active:opacity-80 transition-opacity ${disabled ? "opacity-60 cursor-not-allowed" : ""} ${className}`}
      onPointerDown={handlePointerDown}
      role="button"
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => { if (!disabled && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); onClick?.(); } }}
    >
      {children}
    </div>
  );
}