import { supabase, isSupabaseReady } from "./supabase"
import type { ProOnboardingData } from "../types"

export interface CreateProProfileInput {
  userId: string
  firstName: string
  lastName: string
  categories: string[]
  subCategories: string[]
  bio: string
  hourlyRate: number
  travelFee: number
  city: string
  phone: string
  email: string
}

export async function createProProfile(input: CreateProProfileInput): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseReady()) return { success: false, error: "Supabase non disponible" }

  try {
    const { error: insertError } = await (supabase
      .from("professional_profiles") as any)
      .insert({
        user_id: input.userId,
        first_name: input.firstName,
        last_name: input.lastName,
        categories: input.categories,
        sub_categories: input.subCategories,
        bio: input.bio,
        hourly_rate: input.hourlyRate,
        travel_fee: input.travelFee,
        city: input.city,
        is_active: true,
        is_available: true,
        verification_level: "none",
      }) as any

    if (insertError) return { success: false, error: insertError.message }
    return { success: true }
  } catch (err) {
    return { success: false, error: String(err) }
  }
}

export async function updateProCategories(userId: string, categories: string[], subCategories: string[]): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseReady()) return { success: false, error: "Supabase non disponible" }
  try {
    const { error: updateError } = await (supabase
      .from("professional_profiles") as any)
      .update({ categories, sub_categories: subCategories })
      .eq("user_id", userId) as any
    if (updateError) return { success: false, error: updateError.message }
    return { success: true }
  } catch (err) {
    return { success: false, error: String(err) }
  }
}
