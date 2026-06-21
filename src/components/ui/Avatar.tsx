interface AvatarProps {
  readonly src: string;
  readonly alt: string;
  readonly size?: "sm" | "md" | "lg";
  readonly className?: string;
}

const sizes = {
  sm: "w-8 h-8",
  md: "w-12 h-12",
  lg: "w-20 h-20",
};

export default function Avatar({ src, alt, size = "md", className = "" }: AvatarProps) {
  return (
    <div
      className={`rounded-full overflow-hidden border-2 border-pale-mint/30 shrink-0 ${sizes[size]} ${className}`}
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        loading="lazy"
      />
    </div>
  );
}
