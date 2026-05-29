import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, MapPin, Linkedin, GraduationCap, BookOpen, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Layout, PageHeader } from "@/components/Layout";
import { toast } from "sonner";
import { useSiteContent, contactFallback, type ContactContent } from "@/lib/content";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Dr. Jimrise Ochwach" },
      { name: "description", content: "Get in touch for research collaboration, supervision enquiries, or student questions." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const { data: c } = useSiteContent<ContactContent>("contact", contactFallback);
  const [sending, setSending] = useState(false);

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
                  <a href={`mailto:${c.email}`} className="font-medium text-navy-deep hover:text-gold">{c.email}</a>
                </div>
              </div>
              <div className="flex items-start gap-4 p-5 rounded-xl border border-border">
                <MapPin className="text-gold mt-1 shrink-0" size={20} />
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Institution</p>
                  <p className="font-medium text-navy-deep leading-snug">
                    {c.institution_line1}<br />
                    <span className="text-sm text-muted-foreground font-normal">{c.institution_line2}</span>
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
                    <a key={label} href={href} aria-label={label}
                      className="w-11 h-11 rounded-lg bg-navy-deep text-cream flex items-center justify-center hover:bg-gold hover:text-navy-deep transition-colors">
                      <Icon size={18} />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <form
              className="lg:col-span-3 bg-card border border-border rounded-2xl p-6 md:p-8 space-y-5 shadow-sm"
              onSubmit={(e) => {
                e.preventDefault();
                setSending(true);
                setTimeout(() => {
                  toast.success("Thank you — your message has been received.");
                  (e.target as HTMLFormElement).reset();
                  setSending(false);
                }, 400);
              }}
            >
              <div className="grid sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" required maxLength={100} placeholder="Your full name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" required maxLength={255} placeholder="you@example.com" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Select>
                  <SelectTrigger id="subject"><SelectValue placeholder="Select a topic" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General Enquiry</SelectItem>
                    <SelectItem value="student">Student Query</SelectItem>
                    <SelectItem value="research">Research Collaboration</SelectItem>
                    <SelectItem value="supervision">Supervision Interest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" required rows={6} maxLength={2000} placeholder="Write your message…" />
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
