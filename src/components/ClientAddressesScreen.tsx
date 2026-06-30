import { useState, useCallback, useMemo } from "react";
import { ArrowLeft, MapPin, Plus, Home, Building, Trash2, Search, Check, X, Navigation } from "lucide-react";
import MapView from "./ui/MapView";
import { searchDistricts, type District } from "../data/abidjanDistricts";

interface Address {
  id: string;
  label: string;
  icon: typeof Home;
  addr: string;
  lat: number;
  lng: number;
  default: boolean;
}

const DEFAULT_ADDRESSES: Address[] = [
  { id: "a1", label: "Domicile", icon: Home, addr: "Cocody Riviera 3, Abidjan", lat: 5.358, lng: -3.983, default: true },
  { id: "a2", label: "Bureau", icon: Building, addr: "Plateau, Avenue Noguès, Abidjan", lat: 5.320, lng: -4.022, default: false },
];

interface ClientAddressesScreenProps { onBack: () => void; }

export default function ClientAddressesScreen({ onBack }: ClientAddressesScreenProps) {
  const [addresses, setAddresses] = useState<Address[]>(() => {
    const saved = localStorage.getItem("savedAddresses");
    return saved ? JSON.parse(saved) : DEFAULT_ADDRESSES;
  });
  const [showAdd, setShowAdd] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<District[]>([]);
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [newLabel, setNewLabel] = useState("");
  const [newAddr, setNewAddr] = useState("");

  const saveAddresses = useCallback((list: Address[]) => {
    setAddresses(list);
    localStorage.setItem("savedAddresses", JSON.stringify(list));
  }, []);

  const handleSearch = useCallback((val: string) => {
    setSearchQuery(val);
    setResults(searchDistricts(val));
  }, []);

  const selectDistrict = useCallback((d: District) => {
    setSearchQuery(`${d.name}, ${d.commune}`);
    setNewAddr(`${d.name}, ${d.commune}`);
    setSelectedCoords({ lat: d.lat, lng: d.lng });
    setResults([]);
  }, []);

  const handleMapClick = useCallback((lat: number, lng: number) => {
    setSelectedCoords({ lat, lng });
  }, []);

  const handleAddAddress = useCallback(() => {
    if (!newLabel || !newAddr || !selectedCoords) return;
    const newAddrObj: Address = {
      id: "a_" + Date.now(),
      label: newLabel,
      icon: newLabel.toLowerCase().includes("bureau") || newLabel.toLowerCase().includes("travail") ? Building : Home,
      addr: newAddr,
      lat: selectedCoords.lat,
      lng: selectedCoords.lng,
      default: addresses.length === 0,
    };
    const updated = [...addresses, newAddrObj];
    saveAddresses(updated);
    setShowAdd(false);
    setSearchQuery("");
    setNewLabel("");
    setNewAddr("");
    setSelectedCoords(null);
  }, [newLabel, newAddr, selectedCoords, addresses, saveAddresses]);

  const handleDelete = useCallback((id: string) => {
    const updated = addresses.filter((a) => a.id !== id);
    saveAddresses(updated);
  }, [addresses, saveAddresses]);

  const setDefault = useCallback((id: string) => {
    const updated = addresses.map((a) => ({ ...a, default: a.id === id }));
    saveAddresses(updated);
  }, [addresses, saveAddresses]);

  const handleUseMap = useCallback(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setSelectedCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { enableHighAccuracy: true }
    );
  }, []);

  const mapCenter: [number, number] = selectedCoords
    ? [selectedCoords.lat, selectedCoords.lng]
    : [5.36, -4.01];
  const mapMarkers = selectedCoords
    ? [{ id: "new", lat: selectedCoords.lat, lng: selectedCoords.lng, label: newLabel || "Nouvelle adresse", selected: true }]
    : [];

  return (
    <div className="flex flex-col w-full min-h-screen bg-gray-50 pb-32">
      <header className="flex items-center justify-between px-4 py-3 sticky top-0 z-10 bg-white border-b border-gray-100">
        <button onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 bg-white cursor-pointer active:scale-90 transition-all">
          <ArrowLeft className="w-4 h-4 text-gray-700" />
        </button>
        <h1 className="text-[15px] font-bold text-gray-900">Mes adresses</h1>
        <div className="w-9 h-9" />
      </header>

      <div className="px-4 pt-4 space-y-3">
        {!showAdd ? (
          <>
            {addresses.map((a) => (
              <div key={a.id} className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                  <a.icon className="w-4 h-4 text-gray-900" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[13px] font-semibold text-gray-900">{a.label}</p>
                    {a.default && (
                      <span className="text-[9px] font-medium bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">Par défaut</span>
                    )}
                  </div>
                  <p className="text-[12px] text-gray-400 mt-0.5 truncate">{a.addr}</p>
                </div>
                <div className="flex items-center gap-1">
                  {!a.default && (
                    <>
                      <button onClick={() => setDefault(a.id)}
                        className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
                        title="Définir par défaut">
                        <Check className="w-3.5 h-3.5 text-gray-500" />
                      </button>
                      <button onClick={() => handleDelete(a.id)}
                        className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-red-50 transition-colors"
                        title="Supprimer">
                        <Trash2 className="w-3.5 h-3.5 text-gray-500 hover:text-red-500" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}

            <button onClick={() => setShowAdd(true)}
              className="w-full h-12 bg-gray-900 rounded-2xl text-[12px] font-bold text-white flex items-center justify-center gap-2 cursor-pointer hover:opacity-90 transition-all active:scale-[0.97]">
              <Plus className="w-4 h-4" /> Ajouter une adresse
            </button>
          </>
        ) : (
          <div className="space-y-3">
            {/* Search bar */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
              <p className="text-[13px] font-semibold text-gray-900 mb-3">Où se trouve l'adresse ?</p>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" value={searchQuery} onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Rechercher un quartier à Abidjan..."
                  className="w-full h-11 pl-10 pr-4 text-[13px] bg-gray-50 border border-gray-200 rounded-xl text-gray-900 outline-none focus:border-gray-400 placeholder:text-gray-400" />
                {searchQuery && (
                  <button onClick={() => { setSearchQuery(""); setResults([]); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer">
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                )}
              </div>

              {/* Autocomplete results */}
              {results.length > 0 && (
                <div className="mt-2 border border-gray-200 rounded-xl overflow-hidden bg-white">
                  {results.map((d, i) => (
                    <button key={i} onClick={() => selectDistrict(d)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 cursor-pointer text-left border-b border-gray-50 last:border-0">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <div>
                        <p className="text-[12px] font-medium text-gray-900">{d.name}</p>
                        <p className="text-[10px] text-gray-400">{d.commune}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Ma position */}
              <button onClick={handleUseMap}
                className="w-full flex items-center justify-center gap-2 mt-3 h-10 bg-gray-100 rounded-xl text-[11px] font-semibold text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors">
                <Navigation className="w-4 h-4" /> Utiliser ma position actuelle
              </button>
            </div>

            {/* Map */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="h-48">
                <MapView
                  center={mapCenter}
                  zoom={15}
                  markers={mapMarkers}
                  onMapClick={handleMapClick}
                  height="h-48"
                />
              </div>
              {selectedCoords && (
                <div className="px-4 py-2 border-t border-gray-100">
                  <p className="text-[10px] text-gray-400 font-mono">
                    {selectedCoords.lat.toFixed(5)}, {selectedCoords.lng.toFixed(5)}
                  </p>
                </div>
              )}
            </div>

            {/* Label input */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
              <p className="text-[13px] font-semibold text-gray-900 mb-2">Donnez un nom à cette adresse</p>
              <input type="text" value={newLabel} onChange={(e) => setNewLabel(e.target.value)}
                placeholder="Ex: Domicile, Bureau, Parents..."
                className="w-full h-11 px-4 text-[13px] bg-gray-50 border border-gray-200 rounded-xl text-gray-900 outline-none focus:border-gray-400 placeholder:text-gray-400" />
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              <button onClick={() => setShowAdd(false)}
                className="flex-1 h-12 border border-gray-200 rounded-2xl text-[12px] font-semibold text-gray-600 cursor-pointer hover:bg-gray-50 transition-colors active:scale-[0.97]">
                Annuler
              </button>
              <button onClick={handleAddAddress} disabled={!newLabel || !selectedCoords}
                className="flex-1 h-12 bg-gray-900 rounded-2xl text-[12px] font-bold text-white cursor-pointer disabled:opacity-40 hover:opacity-90 transition-all active:scale-[0.97]">
                Enregistrer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
