const DEFAULT_SITE_URL = "https://dr-jimrise.vercel.app";

export const siteUrl = (import.meta.env.VITE_SITE_URL || DEFAULT_SITE_URL).replace(/\/$/, "");
export const siteName = "Dr. Jimrise Ochwach, PhD";
export const defaultTitle = "Dr. Jimrise Ochwach, PhD - Applied Mathematics Lecturer";
export const defaultDescription =
  "Academic profile and student resource hub for Dr. Jimrise Ochwach, Lecturer in Applied Mathematics at Mama Ngina University College, Kenya.";
export const defaultImage = `${siteUrl}/jimriseicon.png`;

type SeoOptions = {
  title?: string;
  description?: string;
  path?: string;
  image?: string | null;
  type?: "website" | "article" | "profile";
  noIndex?: boolean;
};

export function absoluteUrl(path = "/") {
  if (/^https?:\/\//i.test(path)) return path;
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export function seoHead({
  title = defaultTitle,
  description = defaultDescription,
  path = "/",
  image,
  type = "website",
  noIndex = false,
}: SeoOptions = {}) {
  const canonical = absoluteUrl(path);
  const shareImage = image ? absoluteUrl(image) : defaultImage;

  return {
    meta: [
      { title },
      { name: "description", content: description },
      { name: "author", content: siteName },
      { name: "robots", content: noIndex ? "noindex,nofollow" : "index,follow,max-image-preview:large" },
      { property: "og:site_name", content: siteName },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: type },
      { property: "og:url", content: canonical },
      { property: "og:image", content: shareImage },
      { property: "og:image:alt", content: title },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: shareImage },
    ],
    links: [{ rel: "canonical", href: canonical }],
  };
}

export const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Dr. Jimrise Ochwach",
  honorificSuffix: "PhD",
  jobTitle: "Lecturer in Applied Mathematics",
  nationality: "Kenyan",
  worksFor: {
    "@type": "CollegeOrUniversity",
    name: "Mama Ngina University College",
    address: {
      "@type": "PostalAddress",
      addressCountry: "KE",
    },
  },
  affiliation: [
    { "@type": "CollegeOrUniversity", name: "Mama Ngina University College" },
    { "@type": "CollegeOrUniversity", name: "Chuka University" },
  ],
  knowsAbout: [
    "Applied Mathematics",
    "Mathematical Modelling",
    "Dynamical Systems",
    "Epidemiology",
    "Fluid Dynamics",
    "Data Science",
    "Machine Learning",
  ],
  url: siteUrl,
};

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteName,
  url: siteUrl,
  description: defaultDescription,
  publisher: personSchema,
};
