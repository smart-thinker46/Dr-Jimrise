import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout, PageHeader } from "@/components/Layout";
import { useBlog } from "@/lib/content";
import { optimizedImageUrl } from "@/lib/images";

export const Route = createFileRoute("/blogs/$slug")({
  head: () => ({
    meta: [
      { title: "Blog post — Dr. Jimrise Ochwach" },
      { name: "description", content: "Published blog post by Dr. Jimrise Ochwach." },
    ],
  }),
  component: BlogPostPage,
});

function BlogPostPage() {
  const { slug } = Route.useParams();
  const { data: post, isLoading } = useBlog(slug);

  if (isLoading) {
    return (
      <Layout plain>
        <PageHeader eyebrow="Writing" title="Loading post" />
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout plain>
        <PageHeader eyebrow="Writing" title="Post not found" subtitle="This post may still be a draft or may have been removed." />
        <section className="py-12 bg-background">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <Button asChild variant="outline">
              <Link to="/blogs"><ArrowLeft size={16} className="mr-2" />Back to blogs</Link>
            </Button>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout plain>
      <PageHeader eyebrow="Writing" title={post.title} subtitle={post.excerpt ?? undefined} />
      <article className="py-14 md:py-20 bg-background">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between gap-4 text-sm text-muted-foreground">
            <Link to="/blogs" className="inline-flex items-center gap-2 text-gold hover:text-navy-deep font-semibold">
              <ArrowLeft size={16} /> Back to blogs
            </Link>
            <span className="inline-flex items-center gap-1">
              <CalendarDays size={14} />
              {formatDate(post.published_at ?? post.created_at)}
            </span>
          </div>
          <div
            className="blog-content text-foreground leading-relaxed"
            dangerouslySetInnerHTML={{ __html: enhanceBlogImages(post.content) }}
          />
        </div>
      </article>
    </Layout>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

function enhanceBlogImages(html: string) {
  return html.replace(/<img\b([^>]*?)>/gi, (tag, attrs: string) => {
    const srcMatch = attrs.match(/\ssrc=(["'])(.*?)\1/i);
    const optimizedSrc = srcMatch?.[2] ? optimizedImageUrl(srcMatch[2], 1200) : "";
    let nextAttrs = attrs;

    if (optimizedSrc && optimizedSrc !== srcMatch?.[2]) {
      nextAttrs = nextAttrs.replace(srcMatch![0], ` src="${optimizedSrc}"`);
    }
    if (!/\sloading=/i.test(nextAttrs)) nextAttrs += ' loading="lazy"';
    if (!/\sdecoding=/i.test(nextAttrs)) nextAttrs += ' decoding="async"';

    return `<img${nextAttrs}>`;
  });
}
