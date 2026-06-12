"use client";

import { ArrowLeft, Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  showNotification?: boolean;
  right?: React.ReactNode;
  className?: string;
}

export function Header({ title, showBack, showNotification, right, className }: HeaderProps) {
  const router = useRouter();

  return (
    <header className={cn("sticky top-0 z-40 bg-white/90 backdrop-blur-lg border-b border-gray-100", className)}>
      <div className="max-w-lg mx-auto flex items-center justify-between h-14 px-4">
        <div className="flex items-center gap-3">
          {showBack && (
            <button onClick={() => router.back()} className="btn-ghost p-2 -ml-2">
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          {title && (
            <h1 className="text-lg font-bold text-text-primary">{title}</h1>
          )}
        </div>
        <div className="flex items-center gap-2">
          {right}
          {showNotification && (
            <button className="btn-ghost p-2 relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
