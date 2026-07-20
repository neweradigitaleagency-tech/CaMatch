import { User as UserIcon } from "lucide-react";

interface DrawerHeaderProps {
  name: string;
  email?: string;
  avatarUrl?: string;
}

export default function DrawerHeader({ name, email, avatarUrl }: DrawerHeaderProps) {
  return (
    <div className="w-full flex items-center gap-3 px-4 pt-6 pb-4 text-left">
      <div className="w-12 h-12 rounded-full bg-[rgba(43,43,43,0.08)] backdrop-blur-sm border border-[rgba(43,43,43,0.10)] overflow-hidden shrink-0 flex items-center justify-center">
        {avatarUrl ? (
          <img src={avatarUrl} alt={name} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <UserIcon className="w-5 h-5 text-[#2B2B2B]" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h2 className="text-[16px] font-extrabold text-[#2B2B2B] truncate">{name}</h2>
        {email && (
          <p className="text-[12px] text-gray-400 truncate mt-0.5">{email}</p>
        )}
      </div>
    </div>
  );
}
