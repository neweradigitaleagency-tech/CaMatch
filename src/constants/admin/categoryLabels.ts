import { SERVICE_CATEGORIES } from "../../data/serviceCategories"

export interface CategoryOption {
  value: string
  label: string
  parent: string
  parentLabel: string
}

export const ALL_SUBCATEGORIES: CategoryOption[] = SERVICE_CATEGORIES.flatMap((cat) =>
  cat.subcategories.map((sub) => ({
    value: sub.name.toLowerCase().replace(/[&\s-]+/g, "_"),
    label: sub.name,
    parent: cat.id,
    parentLabel: cat.name,
  }))
)

export const SUBCATEGORY_LABEL: Record<string, string> = Object.fromEntries(
  ALL_SUBCATEGORIES.map((c) => [c.value, c.label])
)

export const SUBCATEGORY_PARENT: Record<string, string> = Object.fromEntries(
  ALL_SUBCATEGORIES.map((c) => [c.value, c.parent])
)

export const SUBCATEGORY_PARENT_LABEL: Record<string, string> = Object.fromEntries(
  ALL_SUBCATEGORIES.map((c) => [c.value, c.parentLabel])
)

const PARENT_LABEL: Record<string, string> = Object.fromEntries(
  SERVICE_CATEGORIES.map((c) => [c.id, c.name])
)

export function getCategoryLabel(category: string): string {
  if (!category) return "—"
  const subLabel = SUBCATEGORY_LABEL[category]
  if (subLabel) return subLabel
  const parentLabel = PARENT_LABEL[category]
  if (parentLabel) return parentLabel
  return category
}

export function getSubcategoryLabel(slug: string): string {
  return SUBCATEGORY_LABEL[slug] ?? slug
}

export function getSubcategoryParent(slug: string): string | undefined {
  return SUBCATEGORY_PARENT[slug]
}

export function getSubcategoryParentLabel(slug: string): string {
  return SUBCATEGORY_PARENT_LABEL[slug] ?? slug
}

export const SUBCATEGORY_OPTIONS: { label: string; value: string }[] = ALL_SUBCATEGORIES.map((c) => ({
  label: c.label,
  value: c.value,
}))

export const PARENT_CATEGORY_OPTIONS = SERVICE_CATEGORIES.map((c) => ({
  value: c.id,
  label: `${c.icon} ${c.name}`,
}))
