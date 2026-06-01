import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CalendarDays, FilePenLine } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layout, PageHeader } from "@/components/Layout";
import { useBlogs } from "@/lib/content";
import { optimizedImageUrl } from "@/lib/images";

export const Route = createFileRoute("/blogs")({
  head: () => ({
    meta: [
      { title: "Insights — Dr. Jimrise Ochwach" },
      { name: "description", content: "Published articles, updates, and reflections from Dr. Jimrise Ochwach." },
    ],
  }),
  component: BlogsPage,
});

function BlogsPage() {
  const { data: posts = [], isLoading } = useBlogs();

  return (
    <Layout plain>
      <PageHeader eyebrow="Writing" title="Insights & updates" subtitle="Published articles, teaching notes, announcements, and reflections." />
      <section className="py-16 md:py-24 bg-background">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <p className="text-muted-foreground">Loading insights...</p>
          ) : posts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FilePenLine className="mx-auto text-gold mb-3" size={30} />
                <p className="font-serif text-xl font-semibold text-navy-deep">No published insights yet.</p>
                <p className="text-sm text-muted-foreground mt-2">Insights published from the admin dashboard will appear here.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-5">
              {posts.map((post) => (
                <Link key={post.id} to="/blogs/$slug" params={{ slug: post.slug }} className="group">
                  <Card className="h-full overflow-hidden hover:border-gold hover:shadow-xl hover:-translate-y-1 transition-all">
                    {post.cover_image_url && (
                      <div className="aspect-[16/9] overflow-hidden bg-secondary">
                        <img
                          src={optimizedImageUrl(post.cover_image_url, 800)}
                          alt=""
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                    )}
                    <CardContent className="pt-6 flex flex-col h-full">
                      <div className="flex items-center justify-between gap-3 mb-4">
                        <Badge className="bg-gold/15 text-navy-deep hover:bg-gold/15">Published</Badge>
                        <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                          <CalendarDays size={13} />
                          {formatDate(post.published_at ?? post.created_at)}
                        </span>
                      </div>
                      <h2 className="font-serif text-2xl font-bold text-navy-deep leading-tight group-hover:text-gold transition-colors">
                        {post.title}
                      </h2>
                      <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-gold">
                        {post.author_name ?? "Dr. Jimrise Ochwach, PhD"}
                      </p>
                      {post.excerpt && (
                        <p className="mt-3 text-sm text-foreground/70 leading-relaxed flex-1">{post.excerpt}</p>
                      )}
                      <span className="mt-5 text-sm font-semibold text-gold inline-flex items-center gap-1">
                        Read insight <ArrowRight size={14} />
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}
