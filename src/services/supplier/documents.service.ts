import { getMockDocuments, getMockImportSessions } from "../../data/supplier-mocks"
import type { SupplierDocument, DocumentStatus, ImportSession } from "../../types/supplier"

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

export async function fetchDocuments(supplierId: string): Promise<SupplierDocument[]> {
  await delay(250)
  return getMockDocuments(supplierId)
}

export async function fetchDocumentById(docId: string): Promise<SupplierDocument | undefined> {
  await delay(200)
  return getMockDocuments("supplier-1").find((d) => d.id === docId)
}

export async function uploadDocument(
  supplierId: string,
  _file: File,
  category: string,
): Promise<SupplierDocument> {
  await delay(1500)
  const doc: SupplierDocument = {
    id: `doc-${Date.now()}`,
    supplierId,
    name: _file.name.replace(/\.[^.]+$/, ""),
    category: category as any,
    status: "processing",
    fileName: _file.name,
    fileSize: _file.size,
    fileType: _file.name.split(".").pop() || "pdf",
    uploadedAt: new Date().toISOString(),
  }
  return doc
}

export async function processOcr(docId: string): Promise<SupplierDocument> {
  await delay(3000)
  const doc = getMockDocuments("supplier-1").find((d) => d.id === docId)
  if (!doc) throw new Error("Document introuvable")
  const enriched: Partial<SupplierDocument> = {
    status: "reviewed",
    ocrText: "Document analysé avec succès.",
    ocrConfidence: 0.9,
    extractedFields: { "Statut": "Analyse terminée" },
  }
  if (doc.id === "doc-1") {
    enriched.status = "approved"
    enriched.ocrText = "REGISTRE DU COMMERCE\nNuméro: CI-ABJ-2024-B-12345\nDénomination: QUINCAILLERIE ABC\nGérant: Mamadou Diallo\nCapital: 10 000 000 FCFA"
    enriched.ocrConfidence = 0.96
    enriched.extractedFields = { "Numéro": "CI-ABJ-2024-B-12345", "Dénomination": "QUINCAILLERIE ABC" }
  }
  if (doc.id === "doc-8") {
    enriched.status = "rejected"
    enriched.ocrText = "ATTESTATION D'ASSURANCE\nPolice: RESP-2025-45678\nÉchéance: 31/12/2025"
    enriched.ocrConfidence = 0.85
    enriched.extractedFields = { "Police": "RESP-2025-45678", "Échéance": "31/12/2025" }
    enriched.rejectionReason = "Police expirée. Veuillez fournir une attestation à jour."
  }
  return { ...doc, ...enriched }
}

export async function fetchImportSessions(supplierId: string): Promise<ImportSession[]> {
  await delay(200)
  return getMockImportSessions(supplierId)
}

export async function importCatalog(supplierId: string, _file: File): Promise<ImportSession> {
  await delay(2000)
  const session: ImportSession = {
    id: `imp-${Date.now()}`,
    supplierId,
    fileName: _file.name,
    fileType: _file.name.endsWith(".csv") ? "csv" : "xlsx",
    totalRows: 0,
    importedRows: 0,
    failedRows: 0,
    errors: [],
    status: "processing",
    createdAt: new Date().toISOString(),
  }
  return session
}
