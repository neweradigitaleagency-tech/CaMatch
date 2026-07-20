import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuthStore } from "../../stores/authStore"
import {
  fetchDocuments,
  uploadDocument,
  processOcr,
  fetchImportSessions,
  importCatalog,
} from "../../services/supplier/documents.service"
import type { SupplierDocument, ImportSession } from "../../types/supplier"

export function useSupplierDocuments() {
  const userId = useAuthStore((s) => s.user?.id)
  return useQuery<SupplierDocument[]>({
    queryKey: ["supplier-documents", userId],
    queryFn: () => fetchDocuments(userId || "supplier-1"),
    enabled: !!userId,
  })
}

export function useImportSessions() {
  const userId = useAuthStore((s) => s.user?.id)
  return useQuery<ImportSession[]>({
    queryKey: ["supplier-imports", userId],
    queryFn: () => fetchImportSessions(userId || "supplier-1"),
    enabled: !!userId,
  })
}

export function useUploadDocument() {
  const userId = useAuthStore((s) => s.user?.id)
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ file, category }: { file: File; category: string }) =>
      uploadDocument(userId || "supplier-1", file, category),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["supplier-documents"] })
    },
  })
}

export function useProcessOcr() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (docId: string) => processOcr(docId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["supplier-documents"] })
    },
  })
}

export function useImportCatalog() {
  const userId = useAuthStore((s) => s.user?.id)
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => importCatalog(userId || "supplier-1", file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["supplier-imports"] })
    },
  })
}
