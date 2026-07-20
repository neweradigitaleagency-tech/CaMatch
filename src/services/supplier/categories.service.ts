import type { ProductCategory } from "../../types/supplier"
import { MOCK_CATEGORIES } from "../../data/supplier-mocks"

function delay(ms = 300): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

export async function getAllProductCategories(): Promise<ProductCategory[]> {
  await delay()
  return MOCK_CATEGORIES
}
