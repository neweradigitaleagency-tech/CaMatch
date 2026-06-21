import { supabase } from "./supabase";
import type { ProfessionalDetails, Service } from "../types";

export const api = {
  professionals: {
    list: async (params?: {
      category?: string;
      search?: string;
    }): Promise<ProfessionalDetails[]> => {
      let query = supabase
        .from("professional_profiles")
        .select("*");

      if (params?.category) {
        query = query.eq("category", params.category);
      }
      if (params?.search) {
        query = query.textSearch("fts", params.search);
      }

      const { data } = await query;
      return (data || []) as unknown as ProfessionalDetails[];
    },

    get: async (id: string): Promise<ProfessionalDetails | null> => {
      const { data } = await supabase
        .from("professional_profiles")
        .select("*")
        .eq("user_id", id)
        .single();

      return data as unknown as ProfessionalDetails | null;
    },
  },

  requests: {
    create: async (data: Record<string, unknown>) => {
      const { data: result, error } = await supabase
        .from("service_requests")
        .insert(data as any)
        .select()
        .single();

      if (error) throw error;
      return result;
    },

    list: async (clientId: string) => {
      const { data } = await supabase
        .from("service_requests")
        .select("*")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false });

      return data || [];
    },

    update: async (id: string, data: Record<string, unknown>) => {
      const { data: result, error } = await supabase
        .from("service_requests")
        .update(data as any)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
  },

  professionalsList: async (): Promise<ProfessionalDetails[]> => {
    const { data } = await supabase
      .from("professional_profiles")
      .select("*");

    return (data || []) as unknown as ProfessionalDetails[];
  },

  servicesList: async (): Promise<Service[]> => {
    return [];
  },
};
