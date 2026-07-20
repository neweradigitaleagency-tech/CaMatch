import { useState } from "react";
import { MapPin, Navigation, ChevronRight, X } from "lucide-react";
import MapView from "../ui/MapView";
import { useRequestWizardStore } from "../../stores/requestWizardStore";

export default function Step3Location() {
  const { draft, setAddress, setAddressComplement, setAccessInstructions, setCoordinates } = useRequestWizardStore();
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [mapCoords, setMapCoords] = useState({ lat: draft.lat || 5.35, lng: draft.lng || -4.0 });

  const handleGpsLocate = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setMapCoords({ lat, lng });
        setCoordinates(lat, lng);
        setIsLocating(false);
      },
      () => setIsLocating(false),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const handleMapClick = (lat: number, lng: number) => {
    setMapCoords({ lat, lng });
  };

  const confirmAddress = () => {
    setCoordinates(mapCoords.lat, mapCoords.lng);
    setShowMapPicker(false);
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-[18px] font-bold text-cm-text">Où aura lieu l'intervention ?</h2>
        <p className="text-[13px] text-cm-text-muted mt-1">Indiquez l'adresse où le professionnel devra se rendre</p>
      </div>

      <div>
        <label className="text-[11px] font-bold text-cm-text-muted uppercase tracking-wider mb-2 block">
          Adresse <span className="text-cm-error">*</span>
        </label>
        <button
          onClick={() => setShowMapPicker(true)}
          className="w-full flex items-center gap-2.5 p-3 bg-cm-elevated border border-cm-border rounded-2xl text-left cursor-pointer active:scale-[0.97] hover:bg-cm-bg transition-all"
        >
          <MapPin className="w-5 h-5 text-cm-text shrink-0" />
          <div className="flex-1 min-w-0">
            <p className={`text-[12px] font-bold truncate ${draft.address ? "text-cm-text" : "text-cm-text-muted"}`}>
              {draft.address || "Appuyez pour choisir l'adresse"}
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-cm-text-muted shrink-0" />
        </button>
      </div>

      <div>
        <label className="text-[11px] font-bold text-cm-text-muted uppercase tracking-wider mb-2 block">
          Complément d'adresse
        </label>
        <input
          value={draft.addressComplement}
          onChange={(e) => setAddressComplement(e.target.value)}
          placeholder="Ex: Bâtiment B, 3ème étage, porte 12"
          className="w-full h-11 px-4 text-[13px] font-medium bg-cm-elevated border border-cm-border rounded-xl text-cm-text outline-none focus:border-cm-text placeholder:text-cm-text-muted"
        />
      </div>

      <div>
        <label className="text-[11px] font-bold text-cm-text-muted uppercase tracking-wider mb-2 block">
          Instructions d'accès
          <span className="text-cm-text-muted font-normal lowercase ml-1">(optionnel)</span>
        </label>
        <textarea
          value={draft.accessInstructions}
          onChange={(e) => setAccessInstructions(e.target.value)}
          placeholder="Ex: Sonner à l'interphone, le portail est à gauche..."
          className="w-full h-24 text-[13px] bg-cm-elevated border border-cm-border rounded-2xl p-4 outline-none resize-none text-cm-text placeholder:text-cm-text-muted font-medium focus:border-cm-text"
        />
      </div>

      {showMapPicker && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50" onClick={() => setShowMapPicker(false)}>
          <div className="w-full max-w-md bg-cm-bg rounded-t-[24px] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 flex items-center justify-between border-b border-cm-border">
              <h3 className="text-[14px] font-bold text-cm-text">Choisir l'adresse</h3>
              <button onClick={() => setShowMapPicker(false)} className="w-10 h-10 rounded-full bg-cm-elevated flex items-center justify-center cursor-pointer">
                <X className="w-5 h-5 text-cm-text" />
              </button>
            </div>
            <div className="h-64 relative">
              <MapView
                height="h-64"
                center={[mapCoords.lat, mapCoords.lng]}
                markers={[{ id: "client", lat: mapCoords.lat, lng: mapCoords.lng, label: draft.address || "" }]}
                interactive
                onMapClick={handleMapClick}
              />
              <button
                onClick={handleGpsLocate}
                disabled={isLocating}
                className="absolute top-3 right-3 z-[1000] w-10 h-10 bg-cm-elevated rounded-full flex items-center justify-center shadow-md border border-cm-border cursor-pointer hover:bg-cm-bg transition-colors active:scale-95 disabled:opacity-50"
              >
                <Navigation className={`w-5 h-5 text-cm-text ${isLocating ? "animate-spin" : ""}`} />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <input
                value={draft.address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full h-11 px-4 text-[13px] font-medium bg-cm-elevated border border-cm-border rounded-xl text-cm-text outline-none focus:border-cm-text placeholder:text-cm-text-muted"
                placeholder="Entrez votre adresse"
              />
              <button
                onClick={confirmAddress}
                className="w-full py-4 bg-cm-text text-white font-bold text-[13px] rounded-xl hover:opacity-90 transition-all cursor-pointer active:scale-[0.97]"
              >
                Confirmer l'adresse
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
