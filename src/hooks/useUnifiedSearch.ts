import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { searchAll, searchSuggest, type SearchResult, type SearchSuggestion } from "../services/searchService";
import { smartSearchSuggestions } from "../data/serviceCategories";
import { useRequestStore } from "../stores/requestStore";

const DEBOUNCE_MS = 300;
const SUGGESTION_MIN_LENGTH = 2;

interface UseUnifiedSearchOptions {
  lat?: number;
  lng?: number;
  limit?: number;
  initialQuery?: string;
}

export interface MatchedService {
  label: string;
  subName: string;
  categoryId: string;
}

export interface SimilarRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  budgetXOF: number;
}

interface UseUnifiedSearchReturn {
  query: string;
  setQuery: (q: string) => void;
  results: SearchResult[];
  suggestions: SearchSuggestion[];
  loading: boolean;
  searched: boolean;
  search: () => Promise<void>;
  reset: () => void;
  professionals: SearchResult[];
  products: SearchResult[];
  suppliers: SearchResult[];
  matchedServices: MatchedService[];
  similarRequests: SimilarRequest[];
  count: number;
  countByType: { professional: number; product: number; supplier: number; service: number; request: number };
}

export function useUnifiedSearch(options: UseUnifiedSearchOptions = {}): UseUnifiedSearchReturn {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchIdRef = useRef(0);
  const initialDone = useRef(false);
  const missions = useRequestStore((s) => s.missions);

  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }

    const id = ++searchIdRef.current;
    setLoading(true);
    setSearched(true);

    const res = await searchAll({
      query: q,
      lat: options.lat,
      lng: options.lng,
      limit: options.limit ?? 20,
    });

    if (id === searchIdRef.current) {
      setResults(res);
      setLoading(false);
    }
  }, [options.lat, options.lng, options.limit]);

  const doSuggest = useCallback(async (q: string) => {
    if (q.length < SUGGESTION_MIN_LENGTH) {
      setSuggestions([]);
      return;
    }
    const res = await searchSuggest(q, 5);
    setSuggestions(res);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      doSearch(query);
      doSuggest(query);
    }, initialDone.current ? DEBOUNCE_MS : 300);
    return () => { if (debounceRef.current) { clearTimeout(debounceRef.current); debounceRef.current = null; } };
  }, [query, doSearch, doSuggest]);

  useEffect(() => {
    if (options.initialQuery && !initialDone.current) {
      initialDone.current = true;
      setQuery(options.initialQuery);
      doSearch(options.initialQuery);
      doSuggest(options.initialQuery);
    }
  }, []);

  const search = useCallback(async () => {
    await doSearch(query);
  }, [query, doSearch]);

  const reset = useCallback(() => {
    setQuery("");
    setResults([]);
    setSuggestions([]);
    setSearched(false);
  }, []);

  const professionals = results.filter((r) => r.result_type === "professional");
  const products = results.filter((r) => r.result_type === "product");
  const suppliers = results.filter((r) => r.result_type === "supplier");

  const matchedServices = useMemo(() => {
    if (query.length < 2) return [];
    return smartSearchSuggestions(query);
  }, [query]);

  const similarRequests = useMemo(() => {
    if (query.length < 2 || !missions.length) return [];
    const q = query.toLowerCase();
    return missions
      .filter((m) =>
        m.title.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q) ||
        (m.subCategory?.toLowerCase().includes(q) ?? false)
      )
      .slice(0, 5)
      .map((m) => ({
        id: m.id,
        title: m.title,
        description: m.description,
        category: m.category,
        location: m.address,
        budgetXOF: m.budgetXOF,
      }));
  }, [query, missions]);

  const count = results.length + matchedServices.length + similarRequests.length;
  const countByType = {
    professional: professionals.length,
    product: products.length,
    supplier: suppliers.length,
    service: matchedServices.length,
    request: similarRequests.length,
  };

  return {
    query,
    setQuery,
    results,
    suggestions,
    loading,
    searched,
    search,
    reset,
    professionals,
    products,
    suppliers,
    matchedServices,
    similarRequests,
    count,
    countByType,
  };
}
