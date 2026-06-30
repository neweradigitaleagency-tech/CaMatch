import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Wrench } from "lucide-react";

interface Props {
  userPosition: [number, number];
  providerPosition: [number, number];
  userLabel?: string;
  providerLabel?: string;
  center?: [number, number];
  zoom?: number;
  height?: string;
}

const userIcon = L.divIcon({
  className: "",
  html: `<div style="width:16px;height:16px;border-radius:50%;background:#3B82F6;border:3px solid white;box-shadow:0 0 0 2px rgba(59,130,246,0.4)"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const providerIcon = L.divIcon({
  className: "",
  html: `<div style="width:16px;height:16px;border-radius:50%;background:#AECB2A;border:3px solid white;box-shadow:0 0 0 2px rgba(174,203,42,0.4)"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

export default function ServiceMapCard({
  userPosition,
  providerPosition,
  userLabel = "MOI",
  providerLabel = "PRO",
  center = [5.36, -4.01],
  zoom = 12,
  height = "h-[120px]",
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!ref.current || instanceRef.current) return;
    const map = L.map(ref.current, {
      center,
      zoom,
      zoomControl: false,
      attributionControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      touchZoom: false,
    });
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
      attribution: "© OpenStreetMap © CartoDB",
    }).addTo(map);
    L.marker(userPosition, { icon: userIcon }).addTo(map);
    L.marker(providerPosition, { icon: providerIcon }).addTo(map);
    L.polyline([userPosition, providerPosition], {
      color: "#AECB2A",
      weight: 2,
      dashArray: "6,6",
    }).addTo(map);
    instanceRef.current = map;
    return () => { map.remove(); instanceRef.current = null; };
  }, []);

  return (
    <div className="relative">
      <div ref={ref} className={`${height} w-full rounded-[20px] overflow-hidden bg-cm-bg`} />

      <div className="absolute left-3 top-1/2 -translate-y-1/2 z-[1000]">
        <p className="text-[10px] text-cm-text-soft">{userLabel.split(" · ")[0]}</p>
        <p className="text-[15px] font-bold text-cm-text">MOI</p>
      </div>

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[1000] w-7 h-7 rounded-full bg-cm-text flex items-center justify-center">
        <Wrench className="w-3.5 h-3.5 text-white" />
      </div>

      <div className="absolute right-3 top-1/2 -translate-y-1/2 z-[1000] text-right">
        <p className="text-[10px] text-cm-text-soft">{providerLabel.split(" · ")[0]}</p>
        <p className="text-[15px] font-bold text-cm-text">{providerLabel}</p>
      </div>
    </div>
  );
}
