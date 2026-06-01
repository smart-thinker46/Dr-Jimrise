import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ExternalLink, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Layout, PageHeader } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, useUserAccessStatus } from "@/hooks/use-auth";
import { seoHead } from "@/lib/seo";
import { getSignedStorageUrl } from "@/lib/storage";

export const Route = createFileRoute("/resources/$id")({
  head: ({ params }) => seoHead({
    title: "Student Resource - Dr. Jimrise Ochwach",
    description: "View a student resource shared by Dr. Jimrise Ochwach.",
    path: `/resources/${params.id}`,
    noIndex: true,
  }),
  component: ResourceViewerPage,
});

function ResourceViewerPage() {
  const { id } = Route.useParams();
  const { user, loading: authLoading } = useAuth();
  const { data: accessStatus = "active" } = useUserAccessStatus(user);
  const { data: resource, isLoading } = useQuery({
    queryKey: ["resource", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("resources")
        .select("id,title,course,type,date,file_url,link_url,source_type,allow_download,access_level,description")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data as any;
    },
  });
  const { data: signedFileUrl, isLoading: signingFile } = useQuery({
    queryKey: ["resource", id, "signed-file", resource?.file_url ?? null],
    enabled: !!resource?.file_url,
    queryFn: () => getSignedStorageUrl("resources", resource.file_url, 60 * 10),
    staleTime: 60 * 8,
  });

  if (isLoading || authLoading || signingFile) {
    return (
      <Layout plain>
        <PageHeader eyebrow="Resource" title="Loading resource" />
      </Layout>
    );
  }

  if (!resource || !resource.file_url) {
    return (
      <Layout plain>
        <PageHeader eyebrow="Resource" title="Resource not available" subtitle="This resource could not be opened inside the website." />
        <section className="py-12 bg-background">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <Button asChild variant="outline">
              <Link to="/resources"><ArrowLeft size={16} className="mr-2" />Back to resources</Link>
            </Button>
          </div>
        </section>
      </Layout>
    );
  }

  if (resource.access_level === "authenticated" && !user) {
    return (
      <Layout plain>
        <PageHeader eyebrow="Resource" title="Login required" subtitle="This resource is available only to logged-in users." />
        <section className="py-12 bg-background">
          <div className="mx-auto flex max-w-4xl flex-wrap gap-3 px-4 sm:px-6 lg:px-8">
            <Button asChild variant="outline">
              <Link to="/resources"><ArrowLeft size={16} className="mr-2" />Back to resources</Link>
            </Button>
            <Button asChild className="bg-navy-deep text-cream hover:bg-navy">
              <Link to="/auth">Login to access</Link>
            </Button>
          </div>
        </section>
      </Layout>
    );
  }

  if (resource.access_level === "authenticated" && accessStatus !== "active") {
    return (
      <Layout plain>
        <PageHeader eyebrow="Resource" title="Access restricted" subtitle={`Your account is ${accessStatus}. Contact the site administrator for help.`} />
        <section className="py-12 bg-background">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <Button asChild variant="outline">
              <Link to="/resources"><ArrowLeft size={16} className="mr-2" />Back to resources</Link>
            </Button>
          </div>
        </section>
      </Layout>
    );
  }

  const fileUrl = signedFileUrl || resource.file_url;
  const viewerUrl = getViewerUrl(fileUrl, resource.type);

  return (
    <Layout plain>
      <PageHeader eyebrow="Resource Viewer" title={resource.title} subtitle={`${resource.course} · ${resource.type} · ${resource.date}`} />
      <section className="py-10 md:py-14 bg-background">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <Button asChild variant="outline">
              <Link to="/resources"><ArrowLeft size={16} className="mr-2" />Back to resources</Link>
            </Button>
            {resource.allow_download !== false && (
              <Button asChild className="bg-navy-deep text-cream hover:bg-navy">
                <a href={fileUrl} target="_blank" rel="noreferrer" download>
                  <ExternalLink size={16} className="mr-2" />Download
                </a>
              </Button>
            )}
          </div>

          <Card className="overflow-hidden">
            <CardContent className="p-0">
              {viewerUrl ? (
                <iframe
                  src={viewerUrl}
                  title={resource.title}
                  className="h-[78vh] w-full border-0 bg-secondary/30"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                />
              ) : (
                <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 p-8 text-center">
                  <FileText className="text-gold" size={34} />
                  <h2 className="font-serif text-2xl font-bold text-navy-deep">Preview not available</h2>
                  <p className="max-w-xl text-sm text-muted-foreground">
                    This file type may not preview inside the website.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
}

function getViewerUrl(fileUrl: string, type?: string | null) {
  const lowerType = type?.toLowerCase() ?? "";
  const lowerUrl = fileUrl.toLowerCase();
  if (lowerType.includes("pdf") || lowerUrl.endsWith(".pdf")) return `${fileUrl}#toolbar=0&navpanes=0`;
  if (lowerType.includes("image") || /\.(png|jpe?g|gif|webp|svg)$/i.test(lowerUrl)) return fileUrl;
  if (lowerType.includes("doc") || lowerType.includes("ppt") || lowerType.includes("xls") || /\.(docx?|pptx?|xlsx?)$/i.test(lowerUrl)) {
    return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`;
  }
  return "";
}
