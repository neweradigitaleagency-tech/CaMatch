import { getMockPickingLists } from "../../data/supplier-mocks"
import type { PickingList, PickingStatus } from "../../types/supplier"

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

export async function fetchPickingLists(supplierId: string): Promise<PickingList[]> {
  await delay(250)
  return getMockPickingLists(supplierId)
}

export async function fetchPickingListById(listId: string): Promise<PickingList | undefined> {
  await delay(200)
  return getMockPickingLists("supplier-1").find((p) => p.id === listId)
}

export async function updatePickingStatus(
  listId: string,
  status: PickingStatus,
): Promise<PickingList> {
  await delay(300)
  const lists = getMockPickingLists("supplier-1")
  const list = lists.find((p) => p.id === listId)
  if (!list) throw new Error("Liste introuvable")
  return { ...list, status, [status === "in_progress" ? "startedAt" : "completedAt"]: new Date().toISOString() }
}

export async function updatePickingItem(
  listId: string,
  itemId: string,
  pickedQuantity: number,
): Promise<PickingList> {
  await delay(200)
  const lists = getMockPickingLists("supplier-1")
  const list = lists.find((p) => p.id === listId)
  if (!list) throw new Error("Liste introuvable")
  return {
    ...list,
    items: list.items.map((i) => (i.id === itemId ? { ...i, pickedQuantity } : i)),
  }
}
