import { useCallback, useState } from "react";
import type { EvaluationMode } from "@/types/evaluation";

export interface EvaluationResult {
  mode: EvaluationMode;
  score: number;
  passed: boolean;
  latencyMs: number;
  inputCharacters: number;
  metrics: { dimension: string; score: number }[];
  findings: string[];
  limitations: string[];
}

export function useEvaluation() {
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async (payload: { mode: EvaluationMode; output: string; context?: string; schema?: string }) => {
    setRunning(true);
    setError(null);
    try {
      const response = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? `HTTP ${response.status}`);
      setResult(data as EvaluationResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo ejecutar la evaluación.");
      setResult(null);
    } finally {
      setRunning(false);
    }
  }, []);

  return { result, running, error, run };
}
