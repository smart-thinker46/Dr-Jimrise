export function optimizedImageUrl(src: string, width: number, quality = 72) {
  if (!src) return src;

  try {
    const url = new URL(src);
    if (!url.pathname.includes("/storage/v1/object/public/")) return src;

    url.pathname = url.pathname.replace("/storage/v1/object/public/", "/storage/v1/render/image/public/");
    url.searchParams.set("width", String(width));
    url.searchParams.set("quality", String(quality));
    url.searchParams.set("resize", "cover");
    return url.toString();
  } catch {
    return src;
  }
}

export function optimizedImageSrcSet(src: string, widths: number[], quality = 72) {
  return widths.map((width) => `${optimizedImageUrl(src, width, quality)} ${width}w`).join(", ");
}
