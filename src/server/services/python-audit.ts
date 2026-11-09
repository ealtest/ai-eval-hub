import { spawn } from "node:child_process";
import { join } from "node:path";

export interface PythonAuditResult {
  mode: "python-audit";
  score: number;
  passed: boolean;
  latencyMs: number;
  inputCharacters: number;
  metrics: { dimension: string; score: number }[];
  findings: string[];
  limitations: string[];
}

export function runPythonAudit(source: string): Promise<PythonAuditResult> {
  const started = performance.now();
  return new Promise((resolve, reject) => {
    const executable = process.env.PYTHON_BIN ?? (process.platform === "win32" ? "python" : "python3");
    const script = join(process.cwd(), "python_tools", "audit.py");
    const child = spawn(executable, [script], { stdio: ["pipe", "pipe", "pipe"], shell: false });
    let stdout = "";
    let stderr = "";
    let settled = false;

    const finishError = (error: Error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      child.kill();
      reject(error);
    };

    const timeout = setTimeout(() => finishError(new Error("Python audit timed out after 5 seconds.")), 5_000);
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk: string) => {
      stdout += chunk;
      if (stdout.length > 64_000) finishError(new Error("Python audit output exceeded the limit."));
    });
    child.stderr.on("data", (chunk: string) => {
      stderr += chunk;
      if (stderr.length > 8_000) stderr = stderr.slice(-8_000);
    });
    child.on("error", () => finishError(new Error("Python 3 is required for the Python audit. Install Python or set PYTHON_BIN.")));
    child.on("close", (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      try {
        const result = JSON.parse(stdout) as { passed?: boolean; score?: number; findings?: string[]; error?: string };
        if (code !== 0 || result.error) throw new Error(result.error ?? stderr.trim() ?? "Python audit failed.");
        if (typeof result.passed !== "boolean" || typeof result.score !== "number" || !Array.isArray(result.findings)) {
          throw new Error("Python audit returned an invalid response.");
        }
        resolve({
          mode: "python-audit",
          score: result.score,
          passed: result.passed,
          latencyMs: Math.round(performance.now() - started),
          inputCharacters: source.length,
          metrics: [{ dimension: "AST security checks", score: result.score }],
          findings: result.findings,
          limitations: [
            "AST-based static analysis only; submitted source code is parsed but never executed.",
            "The rules cover a limited set of security patterns and do not replace Bandit, Semgrep, Ruff or manual review.",
            "Install Python 3 and pytest for the local Python test suite.",
          ],
        });
      } catch (error) {
        reject(error instanceof Error ? error : new Error("Python audit failed."));
      }
    });
    child.stdin.end(JSON.stringify({ source }));
  });
}
