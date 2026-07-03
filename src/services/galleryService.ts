import { supabase, isSupabaseReady } from "./supabase";
import { MOCK_PORTFOLIO_PRO } from "./mockData";
import type { GalleryItem, GalleryCategory } from "../types";

const STORAGE_BUCKET = "pro-gallery";

function makeId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export async function uploadGalleryImage(
  proId: string,
  file: File,
  category: GalleryCategory,
  caption?: string
): Promise<GalleryItem> {
  if (!isSupabaseReady()) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          id: makeId(),
          url: reader.result as string,
          thumbnailUrl: reader.result as string,
          category,
          caption: caption || file.name,
          isFeatured: false,
          sortOrder: 0,
          createdAt: new Date().toISOString(),
        });
      };
      reader.readAsDataURL(file);
    });
  }

  const ext = file.name.split(".").pop() || "jpg";
  const path = `${proId}/${makeId()}.${ext}`;

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

  if (error) throw new Error(error.message);

  const { data: urlData } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(data.path);

  const item: GalleryItem = {
    id: makeId(),
    url: urlData.publicUrl,
    thumbnailUrl: urlData.publicUrl,
    category,
    caption: caption || file.name,
    isFeatured: false,
    sortOrder: 0,
    createdAt: new Date().toISOString(),
  };

  return item;
}

export async function deleteGalleryImage(url: string): Promise<void> {
  if (!isSupabaseReady()) return;

  const path = url.split(`${STORAGE_BUCKET}/`)[1];
  if (!path) return;

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .remove([path]);

  if (error) throw new Error(error.message);
}

export async function fetchGalleryImages(
  proId: string
): Promise<GalleryItem[]> {
  if (!isSupabaseReady()) {
    return MOCK_PORTFOLIO_PRO.map((m) => ({
      id: m.id,
      url: m.url,
      thumbnailUrl: m.url,
      category: "realisation" as GalleryCategory,
      caption: m.title || "",
      isFeatured: false,
      sortOrder: 0,
      createdAt: new Date().toISOString(),
    }));
  }

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .list(`${proId}/`, {
      limit: 100,
      sortBy: { column: "created_at", order: "desc" },
    });

  if (error) throw new Error(error.message);

  return (data || []).map((file) => {
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(`${proId}/${file.name}`);

    return {
      id: file.name,
      url: urlData.publicUrl,
      thumbnailUrl: urlData.publicUrl,
      category: "realisation" as GalleryCategory,
      caption: file.name,
      isFeatured: false,
      sortOrder: 0,
      createdAt: file.created_at || new Date().toISOString(),
    };
  });
}
