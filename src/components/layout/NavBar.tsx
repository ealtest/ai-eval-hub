import { Link } from "@tanstack/react-router";
import { Github, ShieldCheck } from "lucide-react";
import { LINKS } from "@/utils/links";

const NAV = [
  { to: "/", label: "Dashboard" },
  { to: "/playground", label: "Live Playground" },
  { to: "/red-teaming", label: "Red Teaming" },
  { to: "/architecture", label: "Architecture" },
  { to: "/contact", label: "Contact" },
] as const;

export function NavBar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-6">
        <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <span>ApexEval</span>
          <span className="hidden text-sm font-normal text-muted-foreground lg:inline">
            | AI Security &amp; Quality Engine
          </span>
        </Link>
        <nav className="ml-auto hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: true }}
              className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "bg-secondary text-foreground" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <a
          href={LINKS.repo}
          target="_blank"
          rel="noreferrer"
          className="ml-auto inline-flex items-center gap-2 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground shadow-glow transition-opacity hover:opacity-90 md:ml-0"
        >
          <Github className="h-4 w-4" />
          <span className="hidden sm:inline">View GitHub Source</span>
        </a>
      </div>
      <nav className="flex gap-1 overflow-x-auto px-4 pb-2 md:hidden">
        {NAV.map((n) => (
          <Link
            key={n.to}
            to={n.to}
            activeOptions={{ exact: true }}
            className="whitespace-nowrap rounded-md px-3 py-1 text-xs text-muted-foreground"
            activeProps={{ className: "bg-secondary text-foreground" }}
          >
            {n.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
