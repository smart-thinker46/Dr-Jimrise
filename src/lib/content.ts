import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { publicationCache } from "@/lib/publication-cache";

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

export type StudentGroup = {
  id: string;
  group_name: string;
  description: string;
  created_at: string;
};

export type Announcement = {
  id: string;
  date: string;
  title: string;
  body: string;
  sort_order: number | null;
  target_scope?: "general" | "group" | string | null;
  created_at?: string;
};

export type ResourceDirectoryItem = {
  id: string;
  title: string;
  course: string;
  type: string;
  date: string;
  description: string | null;
  sort_order: number | null;
  created_at: string;
  source_type: "file" | "link" | string | null;
  allow_download: boolean | null;
  access_level: "public" | "authenticated" | string | null;
  file_url: string | null;
  link_url: string | null;
  can_access: boolean;
  allowed_groups: string[];
};

export type BlogPost = {
  id: string;
  title: string;
  slug: string | null;
  excerpt: string | null;
  content: string;
  cover_image_url?: string | null;
  author_id?: string | null;
  author_name?: string | null;
  status: "draft" | "published";
  published_at: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type Publication = {
  id: string;
  kind: "journal" | "conference";
  title: string;
  authors: string | null;
  venue: string | null;
  year: number | null;
  doi: string | null;
  article_url?: string | null;
  pdf_url?: string | null;
  pdf_download_allowed?: boolean | null;
  sort_order: number | null;
};

export function useSiteContent<T>(key: string, fallback: T) {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["site_content", key],
    queryFn: async () => {
      const { data: rpcData, error: rpcError } = await (supabase.rpc as any)("get_site_content_value", { content_key: key });
      if (!rpcError && rpcData) return ((rpcData as T) ?? fallback) as T;

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

export function useAnnouncements(scope = "public") {
  const qc = useQueryClient();
  useEffect(() => {
    const channel = supabase
      .channel("announcements:public")
      .on("postgres_changes", { event: "*", schema: "public", table: "announcements" }, () => {
        qc.invalidateQueries({ queryKey: ["announcements"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "announcement_group_access" }, () => {
        qc.invalidateQueries({ queryKey: ["announcements"] });
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [qc]);

  return useQuery({
    queryKey: ["announcements", scope],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Announcement[];
    },
    initialData: [],
    staleTime: 10_000,
  });
}

export function useResources(includeActionUrls = true) {
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
    queryKey: ["resources", includeActionUrls ? "with-urls" : "metadata"],
    queryFn: async () => {
      const metadataColumns = [
        "id",
        "title",
        "course",
        "type",
        "date",
        "description",
        "sort_order",
        "created_at",
        "source_type",
        "allow_download",
        "access_level",
      ].join(",");

      if (!includeActionUrls) {
        const [{ data: metadata }, { data: publicActions }] = await Promise.all([
          supabase.from("resources").select(metadataColumns).order("sort_order", { ascending: true }),
          supabase.from("resources").select("id,file_url,link_url").eq("access_level", "public"),
        ]);
        const actionsById = new Map((publicActions ?? []).map((r: any) => [r.id, r]));
        return (metadata ?? []).map((r: any) => ({ ...r, ...(actionsById.get(r.id) ?? {}) }));
      }

      const columns = `${metadataColumns},file_url,link_url`;
      const { data } = await supabase
        .from("resources")
        .select(columns)
        .order("sort_order", { ascending: true });
      return data ?? [];
    },
    initialData: [],
  });
}

export function useResourceDirectory() {
  const qc = useQueryClient();
  useEffect(() => {
    const channel = supabase
      .channel("resource-directory:public")
      .on("postgres_changes", { event: "*", schema: "public", table: "resources" }, () => {
        qc.invalidateQueries({ queryKey: ["resource-directory"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "resource_group_access" }, () => {
        qc.invalidateQueries({ queryKey: ["resource-directory"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "student_groups" }, () => {
        qc.invalidateQueries({ queryKey: ["resource-directory"] });
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [qc]);

  return useQuery({
    queryKey: ["resource-directory"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("list_resource_directory" as any);
      if (error) throw error;
      return (data ?? []) as ResourceDirectoryItem[];
    },
    initialData: [],
    staleTime: 30_000,
  });
}

export function useStudentGroups() {
  return useQuery({
    queryKey: ["student_groups"],
    queryFn: async () => {
      const { data: rpcData, error: rpcError } = await (supabase.rpc as any)("list_student_groups");
      if (!rpcError) return (rpcData ?? []) as StudentGroup[];

      const { data, error } = await supabase
        .from("student_groups" as any)
        .select("id,group_name,description,created_at")
        .order("group_name", { ascending: true });
      if (error) throw error;
      return (data ?? []) as StudentGroup[];
    },
    placeholderData: [],
    staleTime: 60_000,
    retry: 1,
    refetchOnWindowFocus: false,
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

export function useAllPublications() {
  const qc = useQueryClient();
  useEffect(() => {
    const channel = supabase
      .channel("publications:public")
      .on("postgres_changes", { event: "*", schema: "public", table: "publications" }, () => {
        qc.invalidateQueries({ queryKey: ["publications", "all"] });
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [qc]);

  return useQuery({
    queryKey: ["publications", "all"],
    queryFn: async () => {
      const { data: rpcData, error: rpcError } = await (supabase.rpc as any)("list_public_publications");
      if (!rpcError) return (rpcData ?? []) as Publication[];

      const { data, error } = await supabase
        .from("publications")
        .select("id,kind,title,authors,venue,year,doi,article_url,pdf_url,pdf_download_allowed,sort_order")
        .order("sort_order", { ascending: true })
        .order("year", { ascending: false });

      if (error) throw error;
      return (data ?? []) as Publication[];
    },
    initialData: publicationCache,
    initialDataUpdatedAt: 0,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}

export function useSupervision(level: "phd" | "msc_completed" | "msc_ongoing", enabled = true) {
  const qc = useQueryClient();
  useEffect(() => {
    if (!enabled) return;
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
  }, [enabled, level, qc]);

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
    enabled,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
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
      if (data) return data as BlogPost;

      const { data: fallbackData } = await supabase
        .from("blog_posts" as any)
        .select("*")
        .eq("id", slug)
        .eq("status", "published")
        .maybeSingle();
      return fallbackData as BlogPost | null;
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

export function normalizeContactContent(value: unknown): ContactContent {
  const source = value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

  return {
    email: contactValue(source.email, contactFallback.email),
    institution_line1: contactValue(source.institution_line1, contactFallback.institution_line1),
    institution_line2: contactValue(source.institution_line2, contactFallback.institution_line2),
    linkedin: contactValue(source.linkedin, contactFallback.linkedin),
    scholar: contactValue(source.scholar, contactFallback.scholar),
    researchgate: contactValue(source.researchgate, contactFallback.researchgate),
    x_url: contactValue(source.x_url, contactFallback.x_url ?? "#"),
    instagram: contactValue(source.instagram, contactFallback.instagram ?? "#"),
    facebook: contactValue(source.facebook, contactFallback.facebook ?? "#"),
    whatsapp: contactValue(source.whatsapp, contactFallback.whatsapp ?? "#"),
  };
}

function contactValue(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

export const homeStatsFallback: HomeStatsContent = {
  journal_articles: 21,
  phd_supervision: 1,
  msc_completed: 2,
  msc_ongoing: 5,
};
