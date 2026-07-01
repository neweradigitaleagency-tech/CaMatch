import { Plus, X, ImageIcon } from "lucide-react";

interface PortfolioItem {
  url: string;
  caption: string;
}

interface PortfolioStepProps {
  items: PortfolioItem[];
  onItemsChange: (items: PortfolioItem[]) => void;
}

export default function PortfolioStep({ items, onItemsChange }: PortfolioStepProps) {
  const addItem = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*,video/*";
    input.multiple = true;
    input.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      const newItems = files.map((f) => ({
        url: URL.createObjectURL(f),
        caption: f.name.replace(/\.[^/.]+$/, ""),
      }));
      onItemsChange([...items, ...newItems]);
    };
    input.click();
  };

  const removeItem = (index: number) => {
    onItemsChange(items.filter((_, i) => i !== index));
  };

  return (
    <div>
      <h2 className="text-[18px] font-extrabold text-cm-text mb-1">Galerie de réalisations</h2>
      <p className="text-[13px] text-cm-text-soft mb-4">
        Montrez vos plus beaux travaux pour convaincre les clients.
      </p>

      <div className="grid grid-cols-3 gap-2 mb-4">
        {items.map((item, i) => (
          <div key={i} className="relative aspect-square rounded-[12px] overflow-hidden bg-cm-border-soft group">
            <img src={item.url} alt={item.caption} className="w-full h-full object-cover" />
            <button onClick={() => removeItem(i)}
              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <X className="w-3 h-3 text-white" />
            </button>
          </div>
        ))}
        <button onClick={addItem}
          className="aspect-square rounded-[12px] border-2 border-dashed border-cm-border-soft flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-cm-accent transition-colors">
          <Plus className="w-5 h-5 text-cm-text-muted" />
          <span className="text-[10px] text-cm-text-muted font-medium">Ajouter</span>
        </button>
      </div>

      {items.length === 0 && (
        <div className="text-center py-8 bg-cm-elevated border border-cm-border rounded-[14px]">
          <ImageIcon className="w-8 h-8 text-cm-text-muted mx-auto mb-2" />
          <p className="text-[12px] text-cm-text-muted">Ajoutez au moins une photo</p>
        </div>
      )}
    </div>
  );
}
