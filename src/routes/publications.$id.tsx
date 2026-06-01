import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Layout, PageHeader } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/publications/$id")({
  head: ({ params }) => seoHead({
    title: "Read Publication - Dr. Jimrise Ochwach",
    description: "Read a research publication by Dr. Jimrise Ochwach and collaborators.",
    path: `/publications/${params.id}`,
    type: "article",
  }),
  component: PublicationReaderPage,
});

function PublicationReaderPage() {
  const { id } = Route.useParams();
  const { data: publication, isLoading } = useQuery({
    queryKey: ["publication", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("publications")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data as any;
    },
  });

  const pdfUrl = publication?.pdf_url as string | undefined;
  const allowDownload = publication?.pdf_download_allowed ?? true;

  if (isLoading) {
    return (
      <Layout plain>
        <PageHeader eyebrow="Publication" title="Loading publication" />
      </Layout>
    );
  }

  if (!publication || !pdfUrl) {
    return (
      <Layout plain>
        <PageHeader eyebrow="Publication" title="PDF not available" subtitle="This publication does not currently have a PDF attached." />
        <section className="py-10 bg-background">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <Button asChild variant="outline">
              <Link to="/research"><ArrowLeft size={16} /> Back to Research</Link>
            </Button>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout plain>
      <PageHeader eyebrow="Publication Reader" title={publication.title} subtitle={publication.venue ?? undefined} />
      <section className="py-8 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-4 flex flex-col gap-3 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge className="bg-gold text-navy-deep hover:bg-gold">{publication.year ?? "Publication"}</Badge>
                <Badge variant="outline" className="capitalize">{publication.kind}</Badge>
                {!allowDownload && <Badge variant="outline">Read only</Badge>}
              </div>
              {publication.authors && <p className="text-sm text-muted-foreground">{publication.authors}</p>}
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <Link to="/research"><ArrowLeft size={16} /> Back</Link>
              </Button>
              {allowDownload && (
                <Button asChild className="bg-navy-deep hover:bg-navy text-cream">
                  <a href={pdfUrl} target="_blank" rel="noreferrer" download>
                    <Download size={16} /> Download
                  </a>
                </Button>
              )}
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-border bg-secondary/40">
            <div className="flex items-center gap-2 border-b border-border bg-card px-4 py-2 text-sm font-medium text-navy-deep">
              <FileText size={16} className="text-gold" />
              PDF Viewer
            </div>
            <iframe
              title={publication.title}
              src={`${pdfUrl}${allowDownload ? "" : "#toolbar=0&navpanes=0"}`}
              className="h-[75vh] w-full bg-background"
            />
          </div>
        </div>
      </section>
    </Layout>
  );
}
