import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Navigation, MapPin } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

// @ts-expect-error - Leaflet icon fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl, iconRetinaUrl, shadowUrl });

const CLIENT_COORDS: Record<string, { lat: number; lng: number }> = {
  "Plateau, Abidjan": { lat: 5.3363, lng: -4.0268 },
  "Marcory, Abidjan": { lat: 5.3185, lng: -3.9961 },
  "Cocody, Abidjan": { lat: 5.3598, lng: -3.9870 },
  "Yopougon, Abidjan": { lat: 5.3489, lng: -4.0791 },
  "Treichville, Abidjan": { lat: 5.3035, lng: -4.0060 },
  "Adjamé, Abidjan": { lat: 5.3495, lng: -4.0225 },
  "Koumassi, Abidjan": { lat: 5.2903, lng: -3.9596 },
  "Abobo, Abidjan": { lat: 5.4164, lng: -4.0295 },
  "Port-Bouët, Abidjan": { lat: 5.2486, lng: -3.9024 },
  "Riviera, Abidjan": { lat: 5.3725, lng: -3.9665 },
};

const PRO_COORDS = { lat: 5.3545, lng: -4.0235 };

const clientIcon = new L.DivIcon({
  className: "custom-marker-client",
  html: `<div style="width:36px;height:36px;background:#AECB2A;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -38],
});

const proIcon = new L.DivIcon({
  className: "custom-marker-pro",
  html: `<div style="width:28px;height:28px;background:#1F2937;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

export default function RouteMapModal({
  open, onClose, job,
}: {
  open: boolean;
  onClose: () => void;
  job: typeof import("../services/mockData").MOCK_PRO_JOBS[0] | null;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<L.Map | null>(null);

  const location = job?.clientLocation || "";
  const coords = CLIENT_COORDS[location] || { lat: 5.3545, lng: -4.0235 };

  useEffect(() => {
    if (!open || !mapRef.current || instanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [PRO_COORDS.lat, PRO_COORDS.lng],
      zoom: 14,
      zoomControl: false,
      attributionControl: false,
    });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
    }).addTo(map);

    L.marker([coords.lat, coords.lng], { icon: clientIcon }).addTo(map)
      .bindTooltip(job?.clientName || "Client", { direction: "top", offset: L.point(0, -8) });

    L.marker([PRO_COORDS.lat, PRO_COORDS.lng], { icon: proIcon }).addTo(map)
      .bindTooltip("Vous", { direction: "top", offset: L.point(0, -8) });

    const bounds = L.latLngBounds(
      [Math.min(PRO_COORDS.lat, coords.lat), Math.min(PRO_COORDS.lng, coords.lng)],
      [Math.max(PRO_COORDS.lat, coords.lat), Math.max(PRO_COORDS.lng, coords.lng)]
    );
    map.fitBounds(bounds, { padding: [50, 50] });

    instanceRef.current = map;
    return () => {
      map.remove();
      instanceRef.current = null;
    };
  }, [open, coords.lat, coords.lng, job?.clientName]);

  const openGoogleMapsDirections = () => {
    const dest = `${coords.lat},${coords.lng}`;
    const origin = `${PRO_COORDS.lat},${PRO_COORDS.lng}`;
    window.open(`https://www.google.com/maps/dir/${origin}/${dest}`, "_blank");
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-md mx-4 bg-white rounded-[20px] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <div>
                <h2 className="text-[16px] font-bold text-cm-text">Itinéraire</h2>
                {job && <p className="text-[11px] text-cm-text-muted">{job.clientLocation}</p>}
              </div>
              <button onClick={onClose}
                className="p-1 cursor-pointer active:scale-[0.97] transition-transform touch-min">
                <X className="w-4 h-4 text-cm-text-soft" />
              </button>
            </div>

            <div ref={mapRef} className="w-full h-64" />

            <div className="p-4 space-y-2.5">
              <div className="flex items-center gap-3 text-[12px] text-cm-text-soft">
                <div className="w-6 h-6 rounded-full bg-cm-text flex items-center justify-center shrink-0">
                  <MapPin className="w-3 h-3 text-white" />
                </div>
                <span>Vous · {PRO_COORDS.lat.toFixed(4)}, {PRO_COORDS.lng.toFixed(4)}</span>
              </div>
              <div className="flex items-center gap-3 text-[12px] text-cm-text-soft">
                <div className="w-6 h-6 rounded-full bg-[#AECB2A] flex items-center justify-center shrink-0">
                  <MapPin className="w-3 h-3 text-white" />
                </div>
                <span>Client · {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}</span>
              </div>

              <button onClick={openGoogleMapsDirections}
                className="w-full h-11 rounded-[12px] bg-cm-text text-white text-[12px] font-bold cursor-pointer active:scale-[0.98] transition-transform hover:bg-cm-text/90 flex items-center justify-center gap-2 shadow-sm">
                <Navigation className="w-4 h-4" /> Ouvrir dans Google Maps
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
