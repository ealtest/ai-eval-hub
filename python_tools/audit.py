#!/usr/bin/env python3
"""Static Python security checks. Parses source with ast; never executes submitted code."""
from __future__ import annotations

import ast
import json
import sys
from typing import Any


def audit(source: str) -> dict[str, Any]:
    findings: list[str] = []
    try:
        tree = ast.parse(source)
    except SyntaxError as exc:
        findings.append(f"Syntax error at line {exc.lineno}: {exc.msg}")
        return {"passed": False, "score": 0, "findings": findings}

    for node in ast.walk(tree):
        if isinstance(node, ast.Call):
            name = node.func.id if isinstance(node.func, ast.Name) else (
                node.func.attr if isinstance(node.func, ast.Attribute) else ""
            )
            if name in {"eval", "exec"}:
                findings.append(f"Line {node.lineno}: use of {name}() permits dynamic code execution.")
            if name in {"run", "call", "Popen", "check_call", "check_output"}:
                if any(keyword.arg == "shell" and isinstance(keyword.value, ast.Constant)
                       and keyword.value.value is True for keyword in node.keywords):
                    findings.append(f"Line {node.lineno}: subprocess call uses shell=True; review command injection risk.")
            if name in {"load", "loads"} and isinstance(node.func, ast.Attribute):
                owner = node.func.value.id if isinstance(node.func.value, ast.Name) else ""
                if owner == "pickle":
                    findings.append(f"Line {node.lineno}: pickle deserialization can execute attacker-controlled payloads.")
            if name in {"get", "post", "put", "delete", "request"}:
                if any(keyword.arg == "verify" and isinstance(keyword.value, ast.Constant)
                       and keyword.value.value is False for keyword in node.keywords):
                    findings.append(f"Line {node.lineno}: TLS certificate verification is disabled.")

        if isinstance(node, (ast.Assign, ast.AnnAssign)):
            targets = node.targets if isinstance(node, ast.Assign) else [node.target]
            value = node.value
            if isinstance(value, ast.Constant) and isinstance(value.value, str) and len(value.value) >= 8:
                for target in targets:
                    names = [n.id.lower() for n in ast.walk(target) if isinstance(n, ast.Name)]
                    if any(any(key in name for key in ("password", "secret", "api_key", "token")) for name in names):
                        findings.append(f"Line {node.lineno}: possible hardcoded credential in source.")
                        break

    findings = list(dict.fromkeys(findings))
    score = max(0, 100 - 20 * len(findings))
    return {"passed": not findings, "score": score, "findings": findings or ["No configured AST security rule matched."]}


def main() -> None:
    raw = sys.stdin.read(120_001)
    if len(raw.encode("utf-8")) > 120_000:
        print(json.dumps({"error": "Input exceeds 120 KB."}))
        raise SystemExit(2)
    try:
        payload = json.loads(raw)
        source = payload["source"]
        if not isinstance(source, str):
            raise ValueError("source must be a string")
        result = audit(source)
        print(json.dumps(result))
    except Exception as exc:
        print(json.dumps({"error": str(exc)}))
        raise SystemExit(2)


if __name__ == "__main__":
    main()
