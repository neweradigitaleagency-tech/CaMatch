import { useEffect, useRef, CSSProperties } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default icon paths for bundlers
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

// @ts-expect-error - Leaflet icon fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl, iconRetinaUrl, shadowUrl });

// Custom lime marker for cm-accent brand
const cmIcon = new L.Icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [24, 36],
  iconAnchor: [12, 36],
  popupAnchor: [0, -38],
  shadowSize: [36, 36],
});

const selectedIcon = new L.DivIcon({
  className: "custom-marker-selected",
  html: `<div style="width:32px;height:32px;background:#AECB2A;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  label?: string;
  selected?: boolean;
}

interface MapViewProps {
  center?: [number, number];
  zoom?: number;
  markers?: MapMarker[];
  className?: string;
  style?: CSSProperties;
  interactive?: boolean;
  onMarkerClick?: (id: string) => void;
  onMapClick?: (lat: number, lng: number) => void;
  /** Height in Tailwind class or px. Default "h-48" */
  height?: string;
}

export default function MapView({
  center = [5.36, -4.01],
  zoom = 13,
  markers = [],
  className = "",
  style,
  interactive = true,
  onMarkerClick,
  onMapClick,
  height = "h-48",
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());

  useEffect(() => {
    if (!mapRef.current || instanceRef.current) return;
    const map = L.map(mapRef.current, {
      center,
      zoom,
      zoomControl: false,
      attributionControl: false,
      dragging: interactive,
      scrollWheelZoom: interactive,
      touchZoom: interactive,
      doubleClickZoom: interactive,
    });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
    }).addTo(map);

    if (onMapClick) {
      map.on("click", (e: L.LeafletMouseEvent) => {
        onMapClick(e.latlng.lat, e.latlng.lng);
      });
    }

    instanceRef.current = map;
    return () => {
      map.remove();
      instanceRef.current = null;
    };
  }, []);

  // Update markers
  useEffect(() => {
    const map = instanceRef.current;
    if (!map) return;

    const existing = markersRef.current;
    const ids = new Set(markers.map((m) => m.id));

    // Remove stale markers
    for (const [id, marker] of existing) {
      if (!ids.has(id)) {
        marker.remove();
        existing.delete(id);
      }
    }

    // Add/update markers
    markers.forEach((m) => {
      const icon = m.selected ? selectedIcon : cmIcon;
      if (existing.has(m.id)) {
        const marker = existing.get(m.id)!;
        marker.setLatLng([m.lat, m.lng]);
        marker.setIcon(icon);
        if (m.label) marker.bindTooltip(m.label, { direction: "top", offset: L.point(0, -8) });
      } else {
        const marker = L.marker([m.lat, m.lng], { icon }).addTo(map);
        if (m.label) marker.bindTooltip(m.label, { direction: "top", offset: L.point(0, -8) });
        if (onMarkerClick) {
          marker.on("click", () => onMarkerClick(m.id));
        }
        existing.set(m.id, marker);
      }
    });
  }, [markers]);

  return (
    <div ref={mapRef} className={`${height} w-full rounded-xl overflow-hidden ${className}`} style={style} />
  );
}
