import { supabase, isSupabaseReady } from "../supabase"
import type { DeliveryZone } from "../../types/supplier"
import { getMockDeliveryZones } from "../../data/supplier-mocks"

function delay(ms = 300): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

export async function getDeliveryZones(supplierId: string): Promise<DeliveryZone[]> {
  await delay()
  if (!isSupabaseReady()) return getMockDeliveryZones(supplierId)
  const { data } = await supabase
    .from("delivery_zones" as never)
    .select("*" as never)
    .eq("supplier_id" as never, supplierId)
    .order("city" as never, { ascending: true })
  if (!data) return []
  return (data as any[]).map((z: any) => ({
    id: z.id,
    supplierId: z.supplier_id,
    city: z.city,
    price: z.price,
    estimatedDelayHours: z.estimated_delay_hours ?? undefined,
    isActive: z.is_active,
  }))
}

export async function upsertDeliveryZone(supplierId: string, data: { city: string; price: number; estimatedDelayHours?: number }): Promise<boolean> {
  await delay()
  if (!isSupabaseReady()) return true
  const db = {
    supplier_id: supplierId,
    city: data.city,
    price: data.price,
    estimated_delay_hours: data.estimatedDelayHours ?? null,
    is_active: true,
  }
  const { error } = await supabase.from("delivery_zones" as never).upsert(db as never, { onConflict: "supplier_id,city" }).select("id" as never).single()
  return !error
}

export async function deleteDeliveryZone(zoneId: string): Promise<boolean> {
  await delay()
  if (!isSupabaseReady()) return true
  const { error } = await supabase.from("delivery_zones" as never).delete().eq("id" as never, zoneId)
  return !error
}
