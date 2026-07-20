import { supabase, isSupabaseReady } from "./supabase";

export interface SearchResult {
  result_type: "professional" | "product" | "supplier";
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  price: number;
  rating: number;
  image_url: string | null;
  location_city: string | null;
  distance_km: number | null;
  relevance_score: number;
}

export interface SearchSuggestion {
  suggestion: string;
  result_type: "professional" | "product" | "supplier";
  score: number;
}

export interface SearchParams {
  query: string;
  lat?: number;
  lng?: number;
  limit?: number;
  type?: "professional" | "product" | "supplier";
}

function generateMockResults(query: string, type?: string): SearchResult[] {
  const q = query.toLowerCase();
  if (!q && !type) return [];

  const mock: SearchResult[] = [];

  if (!type || type === "professional") {
    mock.push(
      { result_type: "professional", id: "pro-1", title: "Kouamé Jean – Électricien", description: "Électricien général avec 15 ans d'expérience à Abidjan", category: "['elec']", price: 15000, rating: 4.8, image_url: null, location_city: "Cocody", distance_km: 2.3, relevance_score: 95 },
      { result_type: "professional", id: "pro-2", title: "Yao Marc – Plombier", description: "Plomberie, chauffe-eau, fuites et installations", category: "['plomberie']", price: 12000, rating: 4.5, image_url: null, location_city: "Plateau", distance_km: 1.8, relevance_score: 88 },
      { result_type: "professional", id: "pro-3", title: "Koné Fatou – Climatisation", description: "Installation et maintenance de climatiseurs", category: "['climatisation']", price: 20000, rating: 4.9, image_url: null, location_city: "Treichville", distance_km: 3.1, relevance_score: 92 },
    );
  }

  if (!type || type === "product") {
    mock.push(
      { result_type: "product", id: "prod-1", title: "Climatiseur Samsung 12000 BTU", description: "Split mural inverter, froid seul, classe A++", category: "Climatisation", price: 350000, rating: 4.7, image_url: null, location_city: null, distance_km: null, relevance_score: 85 },
      { result_type: "product", id: "prod-2", title: "Tube cuivre Ø12mm (10m)", description: "Tube cuivre recuit pour climatisation et plomberie", category: "Plomberie", price: 15000, rating: 4.3, image_url: null, location_city: null, distance_km: null, relevance_score: 72 },
      { result_type: "product", id: "prod-3", title: "Disjoncteur Legrand 20A", description: "Disjoncteur modulaire Legrand 20A courbe C", category: "Électricité", price: 8500, rating: 4.6, image_url: null, location_city: null, distance_km: null, relevance_score: 68 },
    );
  }

  if (!type || type === "supplier") {
    mock.push(
      { result_type: "supplier", id: "supp-1", title: "Quincaillerie du Plateau", description: '{"total_products": "45", "total_orders": "128"}', category: null, price: 0, rating: 4.5, image_url: null, location_city: "Plateau", distance_km: null, relevance_score: 60 },
      { result_type: "supplier", id: "supp-2", title: "Matériaux Côte d'Ivoire", description: '{"total_products": "120", "total_orders": "340"}', category: null, price: 0, rating: 4.2, image_url: null, location_city: "Yopougon", distance_km: null, relevance_score: 55 },
    );
  }

  return mock.filter((r) => {
    if (!q && type) return true;
    return r.title.toLowerCase().includes(q) || (r.description?.toLowerCase().includes(q) ?? false);
  });
}

function generateMockSuggestions(query: string): SearchSuggestion[] {
  const q = query.toLowerCase();
  const all: SearchSuggestion[] = [
    { suggestion: "Kouamé Jean – Électricien", result_type: "professional", score: 0.9 },
    { suggestion: "Climatiseur Samsung 12000 BTU", result_type: "product", score: 0.85 },
    { suggestion: "Quincaillerie du Plateau", result_type: "supplier", score: 0.7 },
    { suggestion: "Yao Marc – Plombier", result_type: "professional", score: 0.65 },
    { suggestion: "Tube cuivre Ø12mm", result_type: "product", score: 0.6 },
  ];
  return all.filter((s) => s.suggestion.toLowerCase().includes(q));
}

export async function searchAll(params: SearchParams): Promise<SearchResult[]> {
  if (!isSupabaseReady()) {
    return generateMockResults(params.query, params.type);
  }

  const { data, error } = await supabase.rpc("search_all", {
    search_query: params.query,
    user_lat: params.lat ?? null,
    user_lng: params.lng ?? null,
    result_limit: params.limit ?? 20,
  });

  if (error) {
    console.error("search_all RPC error:", error);
    return generateMockResults(params.query, params.type);
  }

  let results = (data ?? []) as SearchResult[];
  if (params.type) {
    results = results.filter((r) => r.result_type === params.type);
  }
  return results;
}

export async function searchSuggest(query: string, maxResults = 5): Promise<SearchSuggestion[]> {
  if (!isSupabaseReady()) {
    return generateMockSuggestions(query);
  }

  const { data, error } = await supabase.rpc("search_suggest", {
    query_text: query,
    max_results: maxResults,
  });

  if (error) {
    console.error("search_suggest RPC error:", error);
    return generateMockSuggestions(query);
  }

  return (data ?? []) as SearchSuggestion[];
}
