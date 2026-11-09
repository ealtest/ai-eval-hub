import { createFileRoute } from "@tanstack/react-router";
import { FileDown, Github, Linkedin } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { LINKS } from "@/utils/links";

const CHANNELS = [
  { label: "GitHub", detail: "github.com/ealtest", href: LINKS.github, icon: Github },
  { label: "LinkedIn", detail: "Eduardo Alfredo Leiva", href: LINKS.linkedin, icon: Linkedin },
  { label: "Technical CV", detail: "Request PDF", href: LINKS.cv, icon: FileDown },
];

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Eduardo Alfredo Leiva — ApexEval" },
      { name: "description", content: "Reach Eduardo Alfredo Leiva, Senior Systems Architect and AI QA Lead, via GitHub, LinkedIn or CV." },
      { property: "og:title", content: "Contact Eduardo Alfredo Leiva — ApexEval" },
      { property: "og:description", content: "Senior Systems Architect, AI QA Lead and Cybersecurity Expert." },
    ],
  }),
  component: () => (
    <div className="mx-auto max-w-4xl px-6 py-14">
      <PageHeader eyebrow="Contact" title="Eduardo Alfredo Leiva">
        Senior Systems Architect · AI QA Lead · Cybersecurity Expert
      </PageHeader>
      <div className="grid gap-4 sm:grid-cols-3">
        {CHANNELS.map(({ label, detail, href, icon: Icon }) => (
          <a key={label} href={href} target="_blank" rel="noreferrer" className="glass p-6 transition-colors hover:border-primary/50">
            <Icon className="h-6 w-6 text-primary" />
            <p className="mt-4 font-medium">{label}</p>
            <p className="text-sm text-muted-foreground">{detail}</p>
          </a>
        ))}
      </div>
    </div>
  ),
});
