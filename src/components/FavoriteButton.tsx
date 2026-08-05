import { Heart } from "lucide-react";
import { useFavoritesStore, type FavoriteItem } from "../stores/favoritesStore";

interface Props {
  item: Omit<FavoriteItem, "addedAt">;
  className?: string;
  floating?: boolean;
}

export default function FavoriteButton({ item, className = "", floating = true }: Props) {
  const isFavorite = useFavoritesStore((s) => s.isFavorite(item.type, item.id));
  const toggle = useFavoritesStore((s) => s.toggle);

  return (
    <div
      role="button"
      aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(item);
      }}
      className={`${floating ? "absolute top-2 right-2 z-10 " : ""}w-8 h-8 rounded-full bg-cm-elevated/95 backdrop-blur-sm border border-cm-border shadow-sm flex items-center justify-center cursor-pointer active:scale-90 transition-transform ${className}`}
    >
      <Heart className={`w-4 h-4 transition-colors ${isFavorite ? "fill-red-500 text-red-500" : "text-cm-text-soft"}`} />
    </div>
  );
}
