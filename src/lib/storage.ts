import { supabase } from "@/integrations/supabase/client";

export function storagePathFromUrl(bucket: string, value?: string | null) {
  const raw = value?.trim() ?? "";
  if (!raw) return "";
  if (!/^https?:\/\//i.test(raw)) return raw.replace(/^\/+/, "");

  try {
    const url = new URL(raw);
    const marker = `/storage/v1/object/public/${bucket}/`;
    const privateMarker = `/storage/v1/object/sign/${bucket}/`;
    const markerIndex = url.pathname.indexOf(marker);
    const privateIndex = url.pathname.indexOf(privateMarker);
    if (markerIndex >= 0) return decodeURIComponent(url.pathname.slice(markerIndex + marker.length));
    if (privateIndex >= 0) return decodeURIComponent(url.pathname.slice(privateIndex + privateMarker.length));
  } catch {
    return "";
  }

  return "";
}

export async function getSignedStorageUrl(bucket: string, value?: string | null, expiresIn = 60 * 10) {
  const path = storagePathFromUrl(bucket, value);
  if (!path) return value?.trim() ?? "";

  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn);
  if (error) throw error;
  return data.signedUrl;
}
