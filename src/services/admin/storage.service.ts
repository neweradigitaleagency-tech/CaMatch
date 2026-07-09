import { supabase } from "../supabase"

export async function uploadVerificationDoc(
  file: File,
  userId: string,
  documentType: string
): Promise<string | null> {
  const ext = file.name.split(".").pop() ?? "jpg"
  const path = `${userId}/${documentType}.${ext}`
  const { error } = await supabase.storage
    .from("verification-docs")
    .upload(path, file, { upsert: true })
  if (error) throw error
  const { data: urlData } = supabase.storage
    .from("verification-docs")
    .getPublicUrl(path)
  return urlData?.publicUrl ?? null
}

export async function getVerificationDocUrl(path: string): Promise<string | null> {
  const { data } = supabase.storage
    .from("verification-docs")
    .getPublicUrl(path)
  return data?.publicUrl ?? null
}

export async function deleteVerificationDoc(path: string): Promise<void> {
  await supabase.storage
    .from("verification-docs")
    .remove([path])
}
