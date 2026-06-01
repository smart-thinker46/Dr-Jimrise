import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Mail, MapPin, Linkedin, GraduationCap, BookOpen, ArrowRight, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Layout, PageHeader } from "@/components/Layout";
import { toast } from "sonner";
import { contactFallback, normalizeContactContent, type ContactContent } from "@/lib/content";
import { supabase } from "@/integrations/supabase/client";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/contact")({
  head: () => ({
    ...seoHead({
      title: "Contact Dr. Jimrise Ochwach - Research, Teaching & Supervision",
      description: "Contact Dr. Jimrise Ochwach for research collaboration, student enquiries, postgraduate supervision, and academic communication.",
      path: "/contact",
    }),
  }),
  component: ContactPage,
});

function ContactPage() {
  const [contactContent, setContactContent] = useState<ContactContent>(contactFallback);
  const c = normalizeContactContent(contactContent);
  const email = c.email;
  const institutionLine1 = c.institution_line1;
  const institutionLine2 = c.institution_line2;
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadContactContent() {
      try {
        const { data: rpcData, error: rpcError } = await (supabase.rpc as any)("get_site_content_value", { content_key: "contact" });
        if (!rpcError && rpcData && mounted) {
          setContactContent(normalizeContactContent(rpcData));
          return;
        }

        const { data } = await supabase.from("site_content").select("value").eq("key", "contact").maybeSingle();
        if (mounted) setContactContent(normalizeContactContent(data?.value));
      } catch (error) {
        console.warn("Contact content could not load", error);
        if (mounted) setContactContent(contactFallback);
      }
    }

    void loadContactContent();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Layout plain>
      <PageHeader eyebrow="Contact" title="Get in touch" subtitle="For research collaboration, supervision enquiries, or student questions." />
      <section className="py-16 md:py-24 bg-background">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-10">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-start gap-4 p-5 rounded-xl border border-border">
                <Mail className="text-gold mt-1 shrink-0" size={20} />
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Email</p>
                  <a href={`mailto:${email}`} className="font-medium text-navy-deep hover:text-gold">{email}</a>
                </div>
              </div>
              <div className="flex items-start gap-4 p-5 rounded-xl border border-border">
                <MapPin className="text-gold mt-1 shrink-0" size={20} />
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Institution</p>
                  <p className="font-medium text-navy-deep leading-snug">
                    {institutionLine1}<br />
                    <span className="text-sm text-muted-foreground font-normal">{institutionLine2}</span>
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-3">Profiles</p>
                <div className="flex gap-3">
                  {[
                    { Icon: Linkedin, label: "LinkedIn", href: c.linkedin },
                    { Icon: GraduationCap, label: "Google Scholar", href: c.scholar },
                    { Icon: BookOpen, label: "ResearchGate", href: c.researchgate },
                  ].map(({ Icon, label, href }) => (
                    <a key={label} href={safeExternalUrl(href)} target={isRealExternalUrl(href) ? "_blank" : undefined} rel={isRealExternalUrl(href) ? "noreferrer" : undefined} aria-label={label}
                      className="w-11 h-11 rounded-lg bg-navy-deep text-cream flex items-center justify-center hover:bg-gold hover:text-navy-deep transition-colors">
                      <Icon size={18} />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <form
              className="lg:col-span-3 bg-card border border-border rounded-2xl p-6 md:p-8 space-y-5 shadow-sm"
              onSubmit={async (e) => {
                e.preventDefault();
                setSending(true);
                const form = e.currentTarget;
                const formData = new FormData(form);
                const toastId = toast.loading("Sending message...", {
                  description: "Please wait while we submit your enquiry.",
                });
                const { error } = await supabase.from("contact_messages" as any).insert({
                  name: String(formData.get("name") ?? "").trim(),
                  email: String(formData.get("email") ?? "").trim(),
                  phone: String(formData.get("phone") ?? "").trim(),
                  subject: String(formData.get("subject") ?? "").trim(),
                  message: String(formData.get("message") ?? "").trim(),
                });
                setSending(false);
                if (error) {
                  toast.error("Message could not be sent", { id: toastId, description: error.message });
                  return;
                }
                toast.success("Thank you. Your message has been received.", {
                  id: toastId,
                  description: "The admin can now review it from the dashboard.",
                });
                form.reset();
              }}
            >
              <div className="grid sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" required maxLength={100} placeholder="Your full name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" required maxLength={255} placeholder="you@example.com" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone number</Label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input id="phone" name="phone" type="tel" required maxLength={40} placeholder="+254 700 000 000" className="pl-9" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <select
                  id="subject"
                  name="subject"
                  required
                  defaultValue=""
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="" disabled>Select a topic</option>
                  <option value="general">General Enquiry</option>
                  <option value="student">Student Query</option>
                  <option value="research">Research Collaboration</option>
                  <option value="supervision">Supervision Interest</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" name="message" required rows={6} maxLength={2000} placeholder="Write your message…" />
              </div>
              <Button type="submit" size="lg" disabled={sending} className="w-full bg-navy-deep hover:bg-navy text-cream font-semibold">
                {sending ? "Sending..." : (<>Send Message <ArrowRight size={16} className="ml-2" /></>)}
              </Button>
            </form>
          </div>
        </div>
      </section>
    </Layout>
  );
}

function safeExternalUrl(value?: unknown) {
  const trimmed = contactText(value, "#");
  if (trimmed === "#") return "#";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function isRealExternalUrl(value?: unknown) {
  return safeExternalUrl(value) !== "#";
}

function contactText(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}
