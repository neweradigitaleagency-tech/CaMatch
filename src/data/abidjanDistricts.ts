export interface District {
  name: string;
  commune: string;
  lat: number;
  lng: number;
}

export const ABIDJAN_DISTRICTS: District[] = [
  { name: "Cocody Riviera 3", commune: "Cocody", lat: 5.358, lng: -3.983 },
  { name: "Cocody Riviera 2", commune: "Cocody", lat: 5.367, lng: -3.975 },
  { name: "Cocody Angré", commune: "Cocody", lat: 5.377, lng: -3.966 },
  { name: "Cocody Danga", commune: "Cocody", lat: 5.355, lng: -3.968 },
  { name: "Cocody Saint-Jean", commune: "Cocody", lat: 5.360, lng: -3.990 },
  { name: "Cocody M'pouto", commune: "Cocody", lat: 5.345, lng: -3.978 },
  { name: "Cocody Ambassades", commune: "Cocody", lat: 5.352, lng: -3.995 },
  { name: "Cocody 2 Plateaux", commune: "Cocody", lat: 5.363, lng: -3.970 },
  { name: "Cocody 2 Plateaux Vallon", commune: "Cocody", lat: 5.370, lng: -3.962 },
  { name: "Cocody 2 Plateaux Latrille", commune: "Cocody", lat: 5.375, lng: -3.958 },
  { name: "Cocody Palmeraie", commune: "Cocody", lat: 5.380, lng: -3.952 },
  { name: "Plateau", commune: "Plateau", lat: 5.323, lng: -4.019 },
  { name: "Plateau Avenue Noguès", commune: "Plateau", lat: 5.320, lng: -4.022 },
  { name: "Plateau Avenue Chardy", commune: "Plateau", lat: 5.327, lng: -4.015 },
  { name: "Marcory Zone 4", commune: "Marcory", lat: 5.305, lng: -3.987 },
  { name: "Marcory Zone 4C", commune: "Marcory", lat: 5.310, lng: -3.980 },
  { name: "Marcory Anoumabo", commune: "Marcory", lat: 5.300, lng: -3.978 },
  { name: "Treichville", commune: "Treichville", lat: 5.295, lng: -4.005 },
  { name: "Treichville Rue 12", commune: "Treichville", lat: 5.290, lng: -4.010 },
  { name: "Treichville Rue 24", commune: "Treichville", lat: 5.288, lng: -4.008 },
  { name: "Treichville Rue de la Paix", commune: "Treichville", lat: 5.293, lng: -4.003 },
  { name: "Adjamé", commune: "Adjamé", lat: 5.355, lng: -4.033 },
  { name: "Adjamé Williamsville", commune: "Adjamé", lat: 5.360, lng: -4.028 },
  { name: "Adjamé Bingo", commune: "Adjamé", lat: 5.358, lng: -4.038 },
  { name: "Yopougon", commune: "Yopougon", lat: 5.348, lng: -4.071 },
  { name: "Yopougon Siporex", commune: "Yopougon", lat: 5.355, lng: -4.065 },
  { name: "Yopougon Koweït", commune: "Yopougon", lat: 5.340, lng: -4.080 },
  { name: "Yopougon Niangon", commune: "Yopougon", lat: 5.330, lng: -4.095 },
  { name: "Yopougon Port-Bouët 2", commune: "Yopougon", lat: 5.338, lng: -4.075 },
  { name: "Abobo", commune: "Abobo", lat: 5.416, lng: -4.031 },
  { name: "Abobo Baoulé", commune: "Abobo", lat: 5.420, lng: -4.025 },
  { name: "Abobo PK 18", commune: "Abobo", lat: 5.430, lng: -4.035 },
  { name: "Abobo Kennedy", commune: "Abobo", lat: 5.410, lng: -4.028 },
  { name: "Koumassi", commune: "Koumassi", lat: 5.291, lng: -3.956 },
  { name: "Koumassi Campement", commune: "Koumassi", lat: 5.285, lng: -3.950 },
  { name: "Port-Bouët", commune: "Port-Bouët", lat: 5.252, lng: -3.909 },
  { name: "Port-Bouët Vridi", commune: "Port-Bouët", lat: 5.240, lng: -3.918 },
  { name: "Port-Bouët Gonzagueville", commune: "Port-Bouët", lat: 5.260, lng: -3.898 },
  { name: "Bingerville", commune: "Bingerville", lat: 5.355, lng: -3.885 },
  { name: "Bingerville Carrefour", commune: "Bingerville", lat: 5.348, lng: -3.892 },
  { name: "Anyama", commune: "Anyama", lat: 5.496, lng: -4.049 },
  { name: "Attécoubé", commune: "Attécoubé", lat: 5.369, lng: -4.056 },
  { name: "Attécoubé Agoin", commune: "Attécoubé", lat: 5.375, lng: -4.050 },
  { name: "Williamsville", commune: "Adjamé", lat: 5.360, lng: -4.028 },
  { name: "Indénié", commune: "Indénié", lat: 5.363, lng: -3.915 },
  { name: "Djibi", commune: "Cocody", lat: 5.383, lng: -3.945 },
  { name: "Akoupé-Zeudji", commune: "Port-Bouët", lat: 5.275, lng: -3.930 },
];

export function searchDistricts(query: string): District[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return ABIDJAN_DISTRICTS.filter(
    (d) =>
      d.name.toLowerCase().includes(q) ||
      d.commune.toLowerCase().includes(q)
  ).slice(0, 8);
}
