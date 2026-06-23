import { create } from "zustand";

export type LocationStatus = "idle" | "locating" | "available" | "denied" | "error" | "unsupported";
export type GeocodingSource = "nominatim" | "fallback" | "manual";

interface PersistedData {
  latitude: number;
  longitude: number;
  neighborhood: string;
  gpsAccuracy: number | null;
  geocodingSource: GeocodingSource;
}

interface LocationState {
  latitude: number;
  longitude: number;
  neighborhood: string;
  status: LocationStatus;
  error: string | null;
  gpsAccuracy: number | null;
  geocodingSource: GeocodingSource;
  refreshLocation: () => void;
  setNeighborhood: (name: string) => void;
  setCoords: (lat: number, lng: number) => void;
}

const NEIGHBORHOOD_COORDS: Record<string, { lat: number; lng: number }> = {
  Cocody: { lat: 5.360, lng: -4.008 },
  Plateau: { lat: 5.323, lng: -4.019 },
  Marcory: { lat: 5.310, lng: -3.999 },
  Yopougon: { lat: 5.350, lng: -4.083 },
  Treichville: { lat: 5.301, lng: -4.006 },
  Koumassi: { lat: 5.286, lng: -3.997 },
  Abobo: { lat: 5.400, lng: -4.017 },
  Adjamé: { lat: 5.340, lng: -4.010 },
  "Port-Bouët": { lat: 5.252, lng: -3.942 },
  Riviera: { lat: 5.367, lng: -3.989 },
  Angré: { lat: 5.368, lng: -3.976 },
  "Zone 4": { lat: 5.328, lng: -3.999 },
  Bingerville: { lat: 5.353, lng: -3.899 },
  "Saint-Jean": { lat: 5.316, lng: -3.974 },
  Anyama: { lat: 5.486, lng: -4.051 },
};

function findNearestNeighborhood(lat: number, lng: number): string {
  let closest = "Cocody";
  let minDist = Infinity;
  for (const [name, coord] of Object.entries(NEIGHBORHOOD_COORDS)) {
    const d = Math.sqrt((coord.lat - lat) ** 2 + (coord.lng - lng) ** 2);
    if (d < minDist) {
      minDist = d;
      closest = name;
    }
  }
  return closest;
}

async function nominatimReverse(
  lat: number,
  lng: number,
): Promise<string | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&accept-language=fr`,
      { headers: { "User-Agent": "CaMatch/1.0" } },
    );
    if (!res.ok) return null;
    const data = await res.json();
    const addr = data.address;
    return addr?.suburb || addr?.city_district || addr?.town || addr?.city || null;
  } catch {
    return null;
  }
}

function loadPersisted(): PersistedData | null {
  try {
    const raw = localStorage.getItem("cm_location");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function persist(data: PersistedData) {
  try {
    localStorage.setItem("cm_location", JSON.stringify(data));
  } catch {}
}

export const useLocationStore = create<LocationState>((set, get) => {
  const saved = loadPersisted();

  return {
    latitude: saved?.latitude ?? 5.360,
    longitude: saved?.longitude ?? -4.008,
    neighborhood: saved?.neighborhood ?? "Cocody",
    status: "idle" as LocationStatus,
    error: null,
    gpsAccuracy: saved?.gpsAccuracy ?? null,
    geocodingSource: saved?.geocodingSource ?? "manual",

    refreshLocation: () => {
      if (!navigator.geolocation) {
        set({ status: "unsupported", error: "GPS non supporté" });
        return;
      }
      set({ status: "locating", error: null });
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude, accuracy } = pos.coords;
          const nbh = await nominatimReverse(latitude, longitude);
          if (nbh) {
            persist({ latitude, longitude, neighborhood: nbh, gpsAccuracy: accuracy, geocodingSource: "nominatim" });
            set({ latitude, longitude, neighborhood: nbh, status: "available", error: null, gpsAccuracy: accuracy, geocodingSource: "nominatim" });
          } else {
            const nbh2 = findNearestNeighborhood(latitude, longitude);
            persist({ latitude, longitude, neighborhood: nbh2, gpsAccuracy: accuracy, geocodingSource: "fallback" });
            set({ latitude, longitude, neighborhood: nbh2, status: "available", error: null, gpsAccuracy: accuracy, geocodingSource: "fallback" });
          }
        },
        (err) => {
          const msg = err.code === err.PERMISSION_DENIED
            ? "Localisation refusée"
            : err.code === err.TIMEOUT
              ? "Délai de localisation dépassé"
              : "Erreur de localisation";
          set({ status: "denied", error: msg });
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
      );
    },

    setNeighborhood: (name: string) => {
      const coord = NEIGHBORHOOD_COORDS[name];
      if (coord) {
        persist({ latitude: coord.lat, longitude: coord.lng, neighborhood: name, gpsAccuracy: null, geocodingSource: "manual" });
        set({ latitude: coord.lat, longitude: coord.lng, neighborhood: name, error: null, gpsAccuracy: null, geocodingSource: "manual" });
      }
    },

    setCoords: (lat: number, lng: number) => {
      const neighborhood = findNearestNeighborhood(lat, lng);
      persist({ latitude: lat, longitude: lng, neighborhood, gpsAccuracy: null, geocodingSource: "fallback" });
      set({ latitude: lat, longitude: lng, neighborhood, error: null, gpsAccuracy: null, geocodingSource: "fallback" });
    },
  };
});

export function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const h =
    sinDLat * sinDLat +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      sinDLng * sinDLng;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export const LOCATIONS = [
  "Abidjan, Cocody",
  "Abidjan, Plateau",
  "Abidjan, Marcory",
  "Abidjan, Yopougon",
  "Abidjan, Treichville",
];

export const COMMUNES = [
  "Cocody", "Plateau", "Marcory", "Treichville", "Adjamé",
  "Yopougon", "Abobo", "Koumassi", "Port-Bouët", "Bingerville",
  "Anyama", "Attécoubé", "Williamsville",
];
