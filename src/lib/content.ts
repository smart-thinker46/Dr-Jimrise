import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type HeroContent = {
  name: string;
  tagline: string;
  role: string;
  institution: string;
  quote: string;
  photo_url: string;
};

export type AboutContent = {
  bio: string;
  photo_url: string;
};

export type ContactContent = {
  email: string;
  institution_line1: string;
  institution_line2: string;
  linkedin: string;
  scholar: string;
  researchgate: string;
};

export function useSiteContent<T>(key: string, fallback: T) {
  const q = useQuery({
    queryKey: ["site_content", key],
    queryFn: async () => {
      const { data } = await supabase.from("site_content").select("value").eq("key", key).maybeSingle();
      return ((data?.value as T) ?? fallback) as T;
    },
    initialData: fallback,
  });
  return { ...q, data: (q.data ?? fallback) as T };
}

export function useAnnouncements() {
  return useQuery({
    queryKey: ["announcements"],
    queryFn: async () => {
      const { data } = await supabase
        .from("announcements")
        .select("*")
        .order("sort_order", { ascending: true });
      return data ?? [];
    },
    initialData: [],
  });
}

export function useResources() {
  return useQuery({
    queryKey: ["resources"],
    queryFn: async () => {
      const { data } = await supabase
        .from("resources")
        .select("*")
        .order("sort_order", { ascending: true });
      return data ?? [];
    },
    initialData: [],
  });
}

export function usePublications(kind: "journal" | "conference") {
  return useQuery({
    queryKey: ["publications", kind],
    queryFn: async () => {
      const { data } = await supabase
        .from("publications")
        .select("*")
        .eq("kind", kind)
        .order("sort_order", { ascending: true });
      return data ?? [];
    },
    initialData: [],
  });
}

export function useSupervision(level: "phd" | "msc_completed" | "msc_ongoing") {
  return useQuery({
    queryKey: ["supervision", level],
    queryFn: async () => {
      const { data } = await supabase
        .from("supervision")
        .select("*")
        .eq("level", level)
        .order("sort_order", { ascending: true });
      return data ?? [];
    },
    initialData: [],
  });
}

export const heroFallback: HeroContent = {
  name: "Dr. Jimrise Ochwach, PhD",
  tagline: "Applied Mathematician · Lecturer · Researcher",
  role: "Lecturer, Applied Mathematics",
  institution: "Mama Ngina University College · Chuka University (Adjunct)",
  quote: "Developing practical mathematical solutions to socio-economic challenges in Kenya and beyond.",
  photo_url: "",
};

export const aboutFallback: AboutContent = {
  bio: "I am an Applied Mathematician and researcher with expertise in mathematical modeling and analysis. My work spans human and plant disease dynamics, pest control, and fluid mechanics. I also apply data science methods to problems in agribusiness, education, finance, and computing.",
  photo_url: "",
};

export const contactFallback: ContactContent = {
  email: "jochwach@example.ac.ke",
  institution_line1: "Mama Ngina University College",
  institution_line2: "Dept. of Computing and Information Technology",
  linkedin: "#",
  scholar: "#",
  researchgate: "#",
};
