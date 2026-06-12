"use client";

import { cn } from "@/lib/utils";

interface AvatarProps {
  src?: string | null;
  alt: string;
  size?: "sm" | "md" | "lg" | "xl";
  verified?: boolean;
  className?: string;
}

const sizeMap = {
  sm: "w-8 h-8",
  md: "w-12 h-12",
  lg: "w-16 h-16",
  xl: "w-[120px] h-[120px]",
};

export function Avatar({ src, alt, size = "md", verified, className }: AvatarProps) {
  return (
    <div className={cn("relative inline-flex", className)}>
      <div className={cn("rounded-full overflow-hidden bg-gray-100", sizeMap[size])}>
        {src ? (
          <img src={src} alt={alt} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary-100 text-primary-700 font-bold text-lg">
            {alt.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      {verified && (
        <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-primary rounded-full border-2 border-white flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </div>
  );
}
