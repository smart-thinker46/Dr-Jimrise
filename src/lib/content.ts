import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
  x_url?: string;
  instagram?: string;
  facebook?: string;
  whatsapp?: string;
};

export type HomeStatsContent = {
  journal_articles: number;
  phd_supervision: number;
  msc_completed: number;
  msc_ongoing: number;
};

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  status: "draft" | "published";
  published_at: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export function useSiteContent<T>(key: string, fallback: T) {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["site_content", key],
    queryFn: async () => {
      const { data } = await supabase.from("site_content").select("value").eq("key", key).maybeSingle();
      return ((data?.value as T) ?? fallback) as T;
    },
    initialData: fallback,
  });

  useEffect(() => {
    const channel = supabase
      .channel(`site_content:${key}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "site_content", filter: `key=eq.${key}` },
        () => qc.invalidateQueries({ queryKey: ["site_content", key] }),
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [key, qc]);

  return { ...q, data: (q.data ?? fallback) as T };
}

export function useAnnouncements() {
  const qc = useQueryClient();
  useEffect(() => {
    const channel = supabase
      .channel("announcements:public")
      .on("postgres_changes", { event: "*", schema: "public", table: "announcements" }, () => {
        qc.invalidateQueries({ queryKey: ["announcements"] });
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [qc]);

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
  const qc = useQueryClient();
  useEffect(() => {
    const channel = supabase
      .channel("resources:public")
      .on("postgres_changes", { event: "*", schema: "public", table: "resources" }, () => {
        qc.invalidateQueries({ queryKey: ["resources"] });
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [qc]);

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
  const qc = useQueryClient();
  useEffect(() => {
    const channel = supabase
      .channel(`publications:${kind}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "publications", filter: `kind=eq.${kind}` },
        () => qc.invalidateQueries({ queryKey: ["publications", kind] }),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [kind, qc]);

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
  const qc = useQueryClient();
  useEffect(() => {
    const channel = supabase
      .channel(`supervision:${level}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "supervision", filter: `level=eq.${level}` },
        () => qc.invalidateQueries({ queryKey: ["supervision", level] }),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [level, qc]);

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

export function useBlogs() {
  const qc = useQueryClient();
  useEffect(() => {
    const channel = supabase
      .channel("blogs:public")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "blog_posts" },
        () => qc.invalidateQueries({ queryKey: ["blogs"] }),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [qc]);

  return useQuery({
    queryKey: ["blogs"],
    queryFn: async () => {
      const { data } = await supabase
        .from("blog_posts" as any)
        .select("*")
        .eq("status", "published")
        .order("sort_order", { ascending: true })
        .order("published_at", { ascending: false });
      return (data ?? []) as BlogPost[];
    },
    initialData: [],
  });
}

export function useBlog(slug: string) {
  const qc = useQueryClient();
  useEffect(() => {
    const channel = supabase
      .channel(`blog:${slug}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "blog_posts", filter: `slug=eq.${slug}` },
        () => qc.invalidateQueries({ queryKey: ["blog", slug] }),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [qc, slug]);

  return useQuery({
    queryKey: ["blog", slug],
    queryFn: async () => {
      const { data } = await supabase
        .from("blog_posts" as any)
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();
      return data as BlogPost | null;
    },
    initialData: null,
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
  x_url: "#",
  instagram: "#",
  facebook: "#",
  whatsapp: "#",
};

export const homeStatsFallback: HomeStatsContent = {
  journal_articles: 21,
  phd_supervision: 1,
  msc_completed: 2,
  msc_ongoing: 5,
};
