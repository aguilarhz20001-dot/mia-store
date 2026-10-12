import { createClient } from "@/lib/supabase/client";

const BUCKET = "productos";
export const MAX_VIDEO_MB = 50;

/** Reduce la foto a máx. 1600 px y la convierte a WebP (la tienda carga mucho más rápido). */
async function resizeToWebp(file: File, maxSize = 1600): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, w, h);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.85));
    if (!blob) return file;
    return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".webp", { type: "image/webp" });
  } catch {
    return file;
  }
}

/** Sube una foto o video a Supabase Storage y devuelve su URL pública. */
export async function uploadProductMedia(file: File, folder: string): Promise<string> {
  const supabase = createClient();
  const isVideo = file.type.startsWith("video/");

  if (isVideo && file.size > MAX_VIDEO_MB * 1024 * 1024) {
    throw new Error(`El video pesa más de ${MAX_VIDEO_MB} MB. Comprímelo o recórtalo e inténtalo de nuevo.`);
  }
  if (!isVideo && !file.type.startsWith("image/")) {
    throw new Error("Solo se pueden subir fotos o videos.");
  }

  const toUpload = isVideo ? file : await resizeToWebp(file);
  const ext = isVideo ? (file.name.split(".").pop() ?? "mp4").toLowerCase() : "webp";
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, toUpload, {
    cacheControl: "31536000",
    contentType: toUpload.type,
  });
  if (error) throw new Error(error.message);

  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

/** Borra archivos de Storage a partir de sus URLs públicas (ignora las que no son de Supabase). */
export async function removeProductMedia(urls: string[]) {
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const paths = urls
    .map((u) => {
      const i = u.indexOf(marker);
      return i === -1 ? null : decodeURIComponent(u.slice(i + marker.length));
    })
    .filter((p): p is string => p !== null);
  if (paths.length > 0) await createClient().storage.from(BUCKET).remove(paths);
}
