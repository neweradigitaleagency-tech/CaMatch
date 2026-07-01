import { MapPin, Navigation } from "lucide-react";
import { COMMUNES } from "../../stores/locationStore";

interface LocationStepProps {
  location: { lat: number; lng: number };
  serviceRadiusKm: number;
  onLocationChange: (location: { lat: number; lng: number }) => void;
  onRadiusChange: (radius: number) => void;
}

const COMMUNE_COORDS: Record<string, { lat: number; lng: number }> = {
  Cocody: { lat: 5.360, lng: -4.008 },
  Plateau: { lat: 5.323, lng: -4.019 },
  Marcory: { lat: 5.310, lng: -3.999 },
  Treichville: { lat: 5.301, lng: -4.006 },
  Adjamé: { lat: 5.340, lng: -4.010 },
  Yopougon: { lat: 5.350, lng: -4.083 },
  Abobo: { lat: 5.400, lng: -4.017 },
  Koumassi: { lat: 5.286, lng: -3.997 },
  "Port-Bouët": { lat: 5.252, lng: -3.942 },
  Bingerville: { lat: 5.353, lng: -3.899 },
  Anyama: { lat: 5.486, lng: -4.051 },
  Attécoubé: { lat: 5.320, lng: -4.050 },
  Williamsville: { lat: 5.335, lng: -4.005 },
};

export default function LocationStep({
  location, serviceRadiusKm,
  onLocationChange, onRadiusChange,
}: LocationStepProps) {
  const findNearest = (name: string) => {
    const coord = COMMUNE_COORDS[name];
    if (coord) onLocationChange(coord);
  };

  return (
    <div>
      <h2 className="text-[18px] font-extrabold text-cm-text mb-1">Votre localisation</h2>
      <p className="text-[13px] text-cm-text-soft mb-4">
        Indiquez où vous exercez vos services.
      </p>

      <div className="mb-5">
        <p className="text-[12px] font-semibold text-cm-text mb-2">Votre commune</p>
        <div className="flex flex-wrap gap-1.5">
          {COMMUNES.map((name) => {
            const isActive = location.lat === (COMMUNE_COORDS[name]?.lat || 0);
            return (
              <button
                key={name}
                onClick={() => findNearest(name)}
                className={`px-3.5 py-1.5 rounded-full text-[12px] font-medium cursor-pointer transition-colors ${
                  isActive
                    ? "bg-cm-accent text-white"
                    : "bg-cm-border-soft text-cm-text-soft hover:bg-cm-accent-soft"
                }`}
              >
                {name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-5">
        <p className="text-[12px] font-semibold text-cm-text mb-2">Rayon d'intervention</p>
        <div className="bg-cm-elevated border border-cm-border rounded-[14px] p-4">
          <input
            type="range"
            min="1"
            max="50"
            value={serviceRadiusKm}
            onChange={(e) => onRadiusChange(Number(e.target.value))}
            className="w-full accent-cm-accent"
          />
          <div className="flex items-center justify-between mt-1">
            <span className="text-[11px] text-cm-text-muted">1 km</span>
            <span className="text-[14px] font-bold text-cm-text">{serviceRadiusKm} km</span>
            <span className="text-[11px] text-cm-text-muted">50 km</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 p-3.5 bg-cm-accent-soft rounded-[14px]">
        <Navigation className="w-5 h-5 text-cm-accent shrink-0" />
        <div>
          <p className="text-[12px] font-semibold text-cm-text">Position actuelle</p>
          <p className="text-[11px] text-cm-text-muted">
            {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
          </p>
        </div>
      </div>
    </div>
  );
}
