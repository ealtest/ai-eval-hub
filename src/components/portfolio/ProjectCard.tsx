import { ArrowUpRight, FolderGit2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  name: string;
  description: string;
  tags: string[];
  href: string;
  featured?: boolean;
}

export function ProjectCard({ name, description, tags, href, featured }: ProjectCardProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={cn("glass group flex flex-col p-6 transition-colors hover:border-primary/50", featured && "shadow-glow md:col-span-2")}
    >
      <div className="flex items-center gap-2">
        <FolderGit2 className="h-5 w-5 text-primary" />
        <h3 className="font-mono text-base font-semibold">{name}</h3>
        <ArrowUpRight className="ml-auto h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </div>
      <p className="mt-3 flex-1 text-sm text-muted-foreground">{description}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {tags.map((t) => (
          <span key={t} className="rounded-full border border-border bg-secondary px-2.5 py-0.5 font-mono text-xs">
            {t}
          </span>
        ))}
      </div>
    </a>
  );
}
