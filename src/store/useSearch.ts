import { create } from "zustand";

interface SearchState {
  query: string;
  location: string;
  setQuery: (query: string) => void;
  setLocation: (location: string) => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  query: "",
  location: "Cocody, Abidjan",
  setQuery: (query) => set({ query }),
  setLocation: (location) => set({ location }),
}));
