import { useMemo, useState } from "react";
import type { ProfessionalDetails } from "../types";
import { haversineKm } from "../stores/locationStore";

export interface FilterState {
  query: string;
  categoryId: string | null;
  subCategory: string | null;
  rating: number;
  location: string;
  nearbyOnly: boolean;
}

export function useProFilters(pros: ProfessionalDetails[], userCoord: { lat: number; lng: number }) {
  const [filters, setFilters] = useState<FilterState>({
    query: "",
    categoryId: null,
    subCategory: null,
    rating: 0,
    location: "",
    nearbyOnly: false,
  });

  const setFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({ query: "", categoryId: null, subCategory: null, rating: 0, location: "", nearbyOnly: false });
  };

  const filteredPros = useMemo(() => {
    let result = [...pros];

    const q = filters.query.toLowerCase();
    if (q.length >= 2) {
      result = result.filter((pro) => {
        const nameMatch = pro.name.toLowerCase().includes(q);
        const titleMatch = pro.title.toLowerCase().includes(q);
        const locationMatch = pro.locationNeighborhood.toLowerCase().includes(q);
        const subMatch = pro.subCategory.toLowerCase().includes(q);
        return nameMatch || titleMatch || locationMatch || subMatch;
      });
    }

    if (filters.categoryId) {
      result = result.filter((pro) => pro.category === filters.categoryId);
    }

    if (filters.subCategory) {
      const sc = filters.subCategory.toLowerCase();
      result = result.filter(
        (pro) =>
          pro.subCategory?.toLowerCase() === sc ||
          pro.title.toLowerCase().includes(sc)
      );
    }

    if (filters.rating > 0) {
      result = result.filter((pro) => (pro.rating / 10) >= filters.rating);
    }

    if (filters.location) {
      result = result.filter((pro) =>
        pro.locationNeighborhood.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.nearbyOnly) {
      result = result
        .filter((p) => p.lat != null && p.lng != null)
        .sort((a, b) => {
          const dA = haversineKm(userCoord, { lat: a.lat!, lng: a.lng! });
          const dB = haversineKm(userCoord, { lat: b.lat!, lng: b.lng! });
          return dA - dB;
        });
    } else {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [pros, filters, userCoord]);

  const nearbyPros = useMemo(() => {
    return [...pros]
      .filter((p) => p.lat != null && p.lng != null)
      .sort((a, b) => {
        const dA = haversineKm(userCoord, { lat: a.lat!, lng: a.lng! });
        const dB = haversineKm(userCoord, { lat: b.lat!, lng: b.lng! });
        return dA - dB;
      });
  }, [pros, userCoord]);

  return {
    filters,
    setFilter,
    resetFilters,
    filteredPros,
    nearbyPros,
  };
}
