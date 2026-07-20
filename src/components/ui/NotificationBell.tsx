import { Bell } from "lucide-react";

interface NotificationBellProps {
  unreadCount: number;
  onClick: () => void;
  variant?: "client" | "supplier";
}

export default function NotificationBell({ unreadCount, onClick, variant = "client" }: NotificationBellProps) {
  if (variant === "supplier") {
    return (
      <button onClick={onClick}
        className="relative w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
        <Bell className="w-4.5 h-4.5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 flex items-center justify-center bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[18px] px-1">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
    );
  }

  return (
    <button onClick={onClick}
      className="relative w-8 h-8 flex items-center justify-center cursor-pointer">
      <Bell className="w-5 h-5 text-cm-text" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-4 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </button>
  );
}
