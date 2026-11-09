import { useCallback, useState } from "react";

export interface RedTeamResult {
  scannedAt: string;
  verdict: "high-risk" | "review" | "no-known-pattern";
  matches: { id: string; label: string; severity: "high" | "medium"; rationale: string }[];
  summary: string;
  limitations: string[];
}

export function useRedTeam() {
  const [result, setResult] = useState<RedTeamResult | null>(null);
  const [active, setActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scan = useCallback(async (payload: string) => {
    setActive(true);
    setError(null);
    setResult(null);
    try {
      const response = await fetch("/api/red-team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? `HTTP ${response.status}`);
      setResult(data as RedTeamResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo analizar el payload.");
    } finally {
      setActive(false);
    }
  }, []);

  return { result, active, error, scan };
}
