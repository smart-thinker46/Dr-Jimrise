import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout, PageHeader } from "@/components/Layout";
import { useBlog } from "@/lib/content";
import { optimizedImageUrl } from "@/lib/images";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/blogs/$slug")({
  head: ({ params }) => ({
    ...seoHead({
      title: "Academic Insight - Dr. Jimrise Ochwach",
      description: "Published academic insight by Dr. Jimrise Ochwach on applied mathematics, research, teaching, and student learning.",
      path: `/blogs/${params.slug}`,
      type: "article",
    }),
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
              <Link to="/blogs"><ArrowLeft size={16} className="mr-2" />Back to insights</Link>
            </Button>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout plain>
      <PageHeader eyebrow="Writing" title={post.title} />
      <article className="py-14 md:py-20 bg-background">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between gap-4 text-sm text-muted-foreground">
            <Link to="/blogs" className="inline-flex items-center gap-2 text-gold hover:text-navy-deep font-semibold">
              <ArrowLeft size={16} /> Back to insights
            </Link>
            <span className="inline-flex items-center gap-1">
              <CalendarDays size={14} />
              {formatDate(post.published_at ?? post.created_at)}
            </span>
          </div>
          {post.cover_image_url && (
            <div className="mb-8 overflow-hidden rounded-lg border bg-secondary aspect-[16/9]">
              <img
                src={optimizedImageUrl(post.cover_image_url, 1200)}
                alt=""
                className="h-full w-full object-cover"
                loading="eager"
                decoding="async"
              />
            </div>
          )}
          <p className="mb-8 text-sm font-semibold uppercase tracking-wide text-gold">
            {post.author_name ?? "Dr. Jimrise Ochwach, PhD"}
          </p>
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
